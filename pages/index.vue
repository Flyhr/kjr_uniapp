<template>
	
<view v-if="user_roleId ===3">
	<text>欢迎，医生！这里是医生专属内容。</text>
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
<!-- 		<uni-grid-item>
	   	<view class="test-container">
	       <button @click="userInfoForecase" class="test-button">用户信息</button>
	   	</view>
	   	</uni-grid-item> -->
	     </uni-grid>
	     <!-- 自定义弹窗组件 -->
	 <!--    <UserInfoModal
	       :visible="showUserInfo"
	       :userInfo="userInfo"
	       @close="cancelPopup"
	       @confirm="confirmPopup"
	     />-->
	   </view> 
  </view> 
</template>

<script>
import CustomModal from '@/components/CustomModal/CustomModal.vue';
import { getLatestHealthData, saveHealthData,getUserInfoFromTableApi } from '@/api/healthData';
import bluetooth from '@/utils/bluetooth.js';
import wifiGetData from '@/utils/wifi.js';
// import UserInfoModal from './modal/UserInfoModal.vue';
import { formatDate } from  "@/utils/date.js";


export default {
  components: {
    CustomModal,
    // UserInfoModal
  },
  data() {
    return {
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
	    initData() {
	        if (this.user_roleId === 4) {
	          this.timer = setInterval(() => {
	            this.fetchSensorData();
	          }, 5000);
	        }
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
    // showUserInfoPopup() {
    //   console.log("测试按钮被点击，弹窗显示");
    //   this.showUserInfo = true;
    // },
	//传感器设备信息
	
 SensorInfo() {
      // 从本地存储中获取用户信息和设备信息
      const userInfo = uni.getStorageSync('userInfo');
      const deviceInfo = userInfo.devices;
 
      // 判断是否存在设备信息
      if (!deviceInfo || Object.keys(deviceInfo).length === 0) {
        uni.showModal({
          title: '设备信息',
          content: '当前没有连接的设备',
          showCancel: false,
          confirmText: '确定'
        });
        return;
      }
 
      // 定义需要展示的字段与对应的中文名称
      const fieldsMapping = {
        deviceName: '设备名称',
        deviceMac: '设备MAC',
        knee: '膝盖角度',
        temperature: '温度',
        walk: '步行状态',
        speed: '速度',
        distance: '距离',
        remark: '备注',
        updateTime: '更新时间'
      };
 
      // 构建弹窗展示内容，格式化更新时间
      let content = '';
      for (const key in fieldsMapping) {
        if (key === 'updateTime' && deviceInfo[key]) {
          content += `${fieldsMapping[key]}：${formatDate(deviceInfo[key])}\n`;
        } else if (key !== 'updateTime' && deviceInfo.hasOwnProperty(key)) {
          content += `${fieldsMapping[key]}：${deviceInfo[key] != null ? deviceInfo[key] : ''}\n`;
        }
      }
 
      uni.showModal({
        title: '设备信息',
        content: content,
        cancelText: '取消',
        confirmText: '删除',
        success: (res) => {
          if (res.confirm) {
            // 用户点击删除后，再次确认删除
            uni.showModal({
              title: '确认删除',
              content: '是否确认删除设备信息？',
              cancelText: '取消',
              confirmText: '确定',
              success: (resDel) => {
                if (resDel.confirm) {
                  // 调用 API 删除后端设备数据
                  deleteHealthData(deviceInfo.userId)
                    .then((resApi) => {
                      // 假设后端返回的 code === 200 表示删除成功
                      if (resApi && resApi.code === 200) {
                        // 删除成功后，同时清除本地存储中的设备信息
                        delete userInfo.devices;
                        uni.setStorageSync('userInfo', userInfo);
                        uni.showToast({
                          title: '设备信息已删除',
                          icon: 'success'
                        });
                      } else {
                        uni.showToast({
                          title: resApi.msg || '删除失败',
                          icon: 'none'
                        });
                      }
                    })
                    .catch((err) => {
 						  console.error('删除请求出错：', err);
                      uni.showToast({
                        title: '请求失败',
                        icon: 'none'
                      });
                    });
                }
              }
            });
          }
        }
      });
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
