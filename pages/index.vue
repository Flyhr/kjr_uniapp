<template>
	
<view v-if="user_roleId ===3">
	<uni-section title="医生" type="line" class="title_kjr"></uni-section>
	
	<uni-grid :column="3" :showBorder="false" class="button_margin_top">
	<uni-grid-item >
	 <view class="test-container">
	   <button @click="openAddPatientModal_is_add" class="test-button">添加患者信息</button>
	</view>
	</uni-grid-item>
	<!-- <uni-grid-item>
	<view class="test-container">
	   <button @click="fetchSensorData" class="test-button">删除患者信息</button>
	</view>
	</uni-grid-item>
	<uni-grid-item>
	<view class="test-container">
	   <button @click="saveHealthDataToServer" class="test-button">修改患者信息</button>
	</view>
	</uni-grid-item> -->
	<uni-grid-item>
	<view class="test-container">
	   <button @click="openAddPatientModal" class="test-button">查询患者信息</button>
	</view>
	</uni-grid-item>
	 </uni-grid>
<!-- 弹窗部分 -->
  <view v-if="showModal" class="modal-overlay">
    <view class="modal-content">
      <view class="modal-header" v-if="this.is_add === true">添加患者信息</view>
      <view class="modal-header" v-else>查询患者信息</view>
      <view class="modal-body">
        <input
          type="text"
          v-model="patientName"
          placeholder="请输入姓名"
          class="modal-input"
        />
        <input
          type="text"
          v-model="patientPhone"
          placeholder="请输入电话"
          class="modal-input"
        />
      </view>
      <view class="modal-footer">
		  <button @click="closeModal" class="modal-button cancel">取消</button>
		  
        <button @click="confirmAddPatient" class="modal-button confirm">确定</button>
      </view>
    </view>	 
  </view>
  </view>
  <view v-else>
	   <uni-section title="设备数据" type="line" class="title_kjr"></uni-section>
	   	
	   <view class="index-container">
	   	  
	     <!-- 顶部信息栏 -->
	     <view class="top-info">
	       <text v-if="healthData">温度：{{ healthData.temperature }}℃</text>
	       <text v-if="healthData">屈膝度：{{ healthData.knelt_angle }}</text>
	       <text v-if="healthData">步数：{{ healthData.steps }}步</text>
	     </view>
	   	<uni-grid :column="3" :showBorder="false">	
	   	<uni-grid-item>
	     <view class="test-container">
	       <button @click="SensorInfo" class="test-button">设备信息</button>
	   	</view>
	   	</uni-grid-item>
	   	<uni-grid-item>
	   	<view class="test-container">
	       <button @click="fetchSensorData" class="test-button">获取数据</button>
	   	</view>
	   	</uni-grid-item>
	   	<uni-grid-item>
	   	<view class="test-container">
	       <button @click="saveHealthDataToServer" class="test-button">存储数据</button>
	   	</view>
	   	</uni-grid-item>
	     </uni-grid>

	   </view> 
  </view> 
</template>

<script>
import CustomModal from '@/components/CustomModal/CustomModal.vue';
// import { getLatestHealthData, saveHealthData,getUserInfoFromTableApi } from '@/api/healthData';
import wifiGetData from '@/utils/wifi.js';
import {deviceManagement} from "@/utils/prediction.js"
import { formatDate } from  "@/utils/date.js";
import { selectPat,getLatestHealthData,saveHealthData,deleteHealthData,getDoctorData,getPatientData,getUserInfoFromTableApi ,saveUserInfoFromTableApi,predictHealthRecovery,addPatientRelationleApi } from '@/api/healthData.js';


export default {
  components: {
    CustomModal,
  },
  data() {
    return {
		// 弹窗相关数据
		      showModal: false,       // 控制弹窗显示与隐藏
		      patientName: '',        // 患者姓名输入框绑定数据
		      patientPhone: ''  ,      // 患者电话输入框绑定数据
      showUserInfo: false,
      healthData: {
        userId: uni.getStorageSync("userId"),
        deviceName: '',
        mac: '',
        knelt_angle: 0,
        temperature: 0,
        steps: 0,
        distance: 0,
        speed: 0,
      },
      userInfo: {
        name: '',
        gender: '',
        age: '',
        temperature: '',
        flexionDegree: '',
        steps: '',
        surgeryType: '',
        surgeryTime: '',
        isSmoking: '',
        isSwelling: '',
        painLevel: '',
        symptomDescription: ''
      },
	  is_add:false,
      user_id: uni.getStorageSync("userInfo").user.userId,
	  user_roleId : uni.getStorageSync("userInfo").user.roles[0].roleId,   
	   // 用于存储从 integrated_data_table 表获取的信息
	        tableData: []
    };
  },
  onLoad() {
	  
	    this.initData();
  },
  methods: {
	  // 打开弹窗（添加患者信息）
	  openAddPatientModal_is_add() {
	    this.showModal = true;
	    this.is_add = true
	  },
    // 打开弹窗（查询患者信息）
    openAddPatientModal() {
      this.showModal = true;
	  this.is_add = false
	  
    },

    // 关闭弹窗
    closeModal() {
      this.showModal = false;
      // 如果需要，可以在关闭时清空输入框的数据
      this.patientName = '';
      this.patientPhone = '';
    },
    // 点击“确定”按钮后执行的方法
    confirmAddPatient() {
      console.log("患者姓名:", this.patientName);
      console.log("患者电话:", this.patientPhone);
	var patInfo={
				Name : this.patientName,
				Phone : this.patientPhone
			};
      this.selectPatient(patInfo);
      // 关闭弹窗
      this.closeModal();
    },
	    initData() {
	        if (this.user_roleId === 4) {
	          this.timer = setInterval(() => {
	            this.fetchSensorData();
	          }, 20000);
	        }
	      },
 //医生：根据姓名和手机号查询患者是否有账号

async selectPatient(data) {
  selectPat(data.Name, data.Phone)
    .then(res => {
      console.log("查询结果", res.data);
      const relation = {
        docId: this.user_id,
        patId: res.data.userId
      };
      if (this.is_add) {
        addPatientRelationleApi(relation);
      } else {
        // 根据返回的性别进行映射
        const gender = res.data.sex === "0" 
          ? "男" 
          : res.data.sex === "1" 
            ? "女" 
            : "未知";
        // 对状态做简单转换，假设 "0" 为正常，其他为异常
        const status = res.data.status === "0" ? "正常" : "异常";

        // 拼接弹窗内容信息
        const contentText = 
          "姓名：" + res.data.userName + "\n" +
          "昵称：" + res.data.nickName + "\n" +
          "手机号：" + res.data.phonenumber + "\n" +
          "性别：" + gender + "\n" +
		  "邮箱：" + res.data.email + "\n" +
          "账号状态：" + status + "\n" +
          "备注：" + res.data.remark;

        // 弹窗显示用户信息
        uni.showModal({
          title: "用户信息",
          content: contentText,
          showCancel: false
        });
      }
    })
    .catch(error => {
      uni.showToast({ title: '找不到该用户', icon: 'none' });
      this.showModal = true;
    });
},


	//添加自己的患者
	async addPatientRelationle(data){
		
		addPatientRelationleApi(data)
		    .then(res => {
		      console.log('返回数据：', res.data);
			  uni.showToast({ title: '添加病人成功', icon: 'none' });
			  
		    })
		    .catch(error => {
			uni.showToast({ title: '找不到该用户', icon: 'none' });
			this.showModal = true;
		    });
	},
    // 获取传感器测量数据
    fetchSensorData() {
      uni.request({
        url: 'http://192.168.43.95/data',
        method: 'GET',
        success: (res) => {
          this.healthData = res.data;
        },
        fail: (error) => {
          console.error('获取传感器数据时出现错误：', error);
        }
      });
    },
	//查询用户预测的基本信息
    userInfoForecase() {
		const  userId = uni.getStorageSync("userInfo").user.userId;
		// console.log("55555",userId);
		
      getUserInfoFromTableApi(userId)
        .then(res => {
          this.tableData = res.data;
          console.log('从 integrated_data_table 表获取的数据：', this.tableData);
        })
        .catch(error => {
          console.error('获取 integrated_data_table 表信息失败：', error);
          uni.showToast({ title: '获取用户信息失败', icon: 'none' });
        });
    },
	//存储数据
    saveHealthDataToServer() {
      const userId = uni.getStorageSync("userId");
      const healthDataToSave = {
        userId: userId,
        deviceName: "测试设备",
        deviceMac: this.healthData.mac,
        knee: this.healthData.knelt_angle,
        temperature: this.healthData.temperature,
        walk: this.healthData.steps,
        distance: this.healthData.distance,
        speed: this.healthData.speed
      };
      // console.log("传输后端数据", healthDataToSave);
      saveHealthData(healthDataToSave)
        .then((response) => {
          console.log('健康数据存储成功：', response);
          uni.showToast({ title: '数据保存成功', icon: 'success' });
        })
        .catch((error) => {
          console.error('健康数据存储失败：', error);
          uni.showToast({ title: '数据保存失败', icon: 'none' });
        });
    },

	//传感器设备信息	
 SensorInfo() {
      // 从本地存储中获取用户信息和设备信息
      deviceManagement();
    },
	//获取数据库设备信息
    fetchLatestHealthData() {
      getLatestHealthData(this.user_id)
        .then(data => {
          console.log("数据库中数据",data);
        })
        .catch(error => {
          console.error('获取健康数据失败：', error);
        });
    }
  }
};
</script>


<style lang="scss" scoped>

.title_kjr{
	margin-top: 45px;
}
.button_margin_top{
	margin-top: 30px;
	
}
.top-info {
  width: 100%;
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
  background-color: #f5f6f7;
  // margin-top: 0px;
  font-size: 15px;
}
.test-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
}
.test-button {
  width: 100%;
  padding: 10px 0;
  font-size: 14px;
  color: #fff;
  background-color: #409EFF; /* 蓝色基调，可根据主题调整 */
  border: none;
  // border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  transition: background-color 0.3s ease, transform 0.2s ease;
}
/* 按钮按下时稍微缩放一下 */
.test-button:active {
  transform: scale(0.98);
}

/* 鼠标悬浮（H5环境下适用）或长按（手机端效果）时改变背景色 */
.test-button:hover {
  background-color: #66b1ff;
}
/* 弹窗内部样式 */
.popup-content {
  padding: 20px;
}
// 新增标题样式
.info-title {
  font-size: 15px;
  font-weight: bold;
  text-align: center;
  // padding: 10px 0;
}
.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.info-item text {
  width: 100;
  font-size: 17px;
  align-items: center;
}

.info-item input {
  flex: 1;
  border: 1px solid #cecece;
  padding: 0px;
  font-size: 15px;
}
/* 弹窗遮罩层 */
.modal-overlay {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 弹窗主体 */
.modal-content {
  width: 80%;
  max-width: 400px;
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 弹窗标题 */
.modal-header {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  text-align: center;
}

/* 弹窗内容 */
.modal-body {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}
.modal-input {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 15px; /* 增加内边距 */
  font-size: 18px;    /* 提升字体大小 */
  height: 50px;       /* 显式设定高度 */
  border: 1px solid #ccc;
  border-radius: 6px; /* 稍微扩大圆角效果 */
  margin-bottom: 20px;/* 增加下边距 */
}

/* 弹窗按钮区域 */
.modal-footer {
  display: flex;
  justify-content: space-around;
}
.modal-button {
  flex: 1;
  margin: 0 5px;
  padding: 10px 0;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.modal-button.confirm {
  background-color: #007bff;
  color: #fff;
}
.modal-button.cancel {
  background-color: #ccc;
  color: #333;
}
.button-group {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
}

.cancel-button {
  background-color: #e5e5e5;
}

.confirm-button {
  background-color: #2979ff;
  color: white;
}
</style>
