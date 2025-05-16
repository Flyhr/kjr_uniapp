<template>
  <view class="work-container">
    <uni-section title="诊疗预测" type="line"></uni-section>
    <view v-if="user_roleId ===3" class="grid-body">
		
      <uni-grid :column="2" :showBorder="false">
        <uni-grid-item>
          <view class="grid-item-box" @click="DoctoruserInfoForecase">
            <uni-icons type="person-filled" size="30"></uni-icons>
            <text class="text">患者基础信息</text>
          </view>
        </uni-grid-item> 
        <!-- <uni-grid-item>
          <view class="grid-item-box" @click="deviceManagementButton">
            <uni-icons type="settings-filled" size="30"></uni-icons>
            <text class="text">患者设备管理</text>
          </view>
        </uni-grid-item> -->
        <uni-grid-item>
          <view class="grid-item-box" @click="DoctorpredictRecoveryButton">
            <uni-icons type="color" size="30"></uni-icons>
            <text class="text">患者康复预测</text>
          </view>
        </uni-grid-item>
      </uni-grid>
	  
    </view>
	<view v-else class="grid-body">
		<uni-grid :column="3" :showBorder="false">
		  <uni-grid-item>
		    <view class="grid-item-box" @click="userInfoForecase">
		      <uni-icons type="person-filled" size="30"></uni-icons>
		      <text class="text">用户信息</text>
		    </view>
		  </uni-grid-item> 
		  <uni-grid-item>
		    <view class="grid-item-box" @click="deviceManagementButton">
		      <uni-icons type="settings-filled" size="30"></uni-icons>
		      <text class="text">设备管理</text>
		    </view>
		  </uni-grid-item>
		  <uni-grid-item>
		    <view class="grid-item-box" @click="predictRecoveryButton">
		      <uni-icons type="color" size="30"></uni-icons>
		      <text class="text">康复预测</text>
		    </view>
		  </uni-grid-item>
		</uni-grid>
	</view>
    
    <!-- 用户信息弹窗 -->
 <view v-if="showUserModal" class="modal-overlay">
      <view class="modal">
        <view class="modal-header">
          <text>用户基础信息</text>
        </view>
        <view class="modal-body">
          <form @submit.prevent="saveUserInfo">
            <!-- 遍历其它表单项 -->
            <view class="form-item" 
                  v-for="(value, key) in editableUserInfo" 
                  :key="key"
                  v-if="!excludeFields.includes(key) && key !== 'pain'">
              <text class="label">{{ fieldsMapping[key] || key }}：</text>
              <input v-model="editableUserInfo[key]" class="input-field" />
            </view>
            <!-- 单选框：pain 字段 -->
            <view class="form-item">
              <text class="label">疼痛</text>
              <!-- 在 radio-group 上绑定 v-model 并增加 change 事件 -->
              <radio-group 
                v-model="editableUserInfo.pain"
                @change="handlePainChange"
                class="radio-group">
                <label v-for="option in painOptions" 
                       :key="option.value" 
                       class="radio-option">
                  <radio :value="option.value" /> 
                  <text>{{ option.label }}</text>
                </label>
              </radio-group>
            </view>
          </form>
        </view>
        <view v-if ="user_roleId===4"class="modal-footer">
          <button @click="closeUserModal" class="btn cancel-btn">取消</button>
          <button @click="saveUserInfoButton" class="btn confirm-btn">保存</button>
        </view>
		<view v-else>
			<button @click="closeUserModal" class="btn confirm-btn">确定</button>
			
		</view>
      </view>
    </view>
	
  </view>
</template>
<script>
import { formatDate } from  "@/utils/date.js";
import { deleteHealthData,getUserInfoFromTableApi ,saveUserInfoFromTableApi,predictHealthRecovery,getPatientData } from '@/api/healthData.js';
import { ppredictRecovery, saveUserInfo, deviceManagement } from '@/utils/prediction.js';

  export default {
    data() {
      return {
		patientData:{},
		  user_roleId : uni.getStorageSync("userInfo").user.roles[0].roleId,
// 用于存放从后端获取的用户数据
      userInfo: {},
      // 编辑时使用的拷贝数据
      editableUserInfo: {},
      // 控制弹窗显示
      showUserModal: false,
      // 不显示的字段
      excludeFields: ['id', 'createTime', 'predictResult', 'doctorResult'],
      // 字段中文对应的名称
      fieldsMapping: {
        name: '姓名',
        weight: '体重',
        height: '身高',
        gender: '性别',
        age: '年龄',
        smoking: '是否吸烟',
        temp: '体温',
        tempCut: '膝盖温度',
        pulse: '脉搏',
        sbp: '收缩压',
        dbp: '舒张压',
        swelling: '是否水肿',
        knee: '屈膝度',
        step: '步数',
        decri: '症状描述',
        updateTime: '更新时间',
        pain: '疼痛等级'
      },
	  userId :uni.getStorageSync("userInfo").user.userId,
      painOptions: [
        { value: 0, label: '几乎无痛，能够奔跑' },
        { value: 1, label: '略微疼痛，缓慢行走' },
        { value: 2, label: '极为疼痛，不能行走' }
      ],
	  Rehabilitation_status: [
        { value: 0, label: '基本康复' },
        { value: 1, label: '恢复一般' },
        { value: 2, label: '恢复较差' }
      ],
        current: 0,
        swiperDotIndex: 0,
      }
    },
	  
    methods: {
	//医生：“用户基础信息”按钮，获取数据并显示弹窗
async 	DoctoruserInfoForecase(show){
		const userId = uni.getStorageSync("userInfo").user.userId;
		return getPatientData(userId)
		  .then(res => {
		    const patient = res.data; 
			if(show){
				this.getBasicInfo(patient.userId,show);
					return patient;
			}else{
				show = false;
				this.getBasicInfo(patient.userId,show);
					return patient;
			}	
		  })
		  .catch(error => {
		    console.error('获取用户信息失败：', error);
		    uni.showToast({ title: '获取用户信息失败', icon: 'none' });
		  });
	},
	//医生：“康复预测”按钮，
async DoctorpredictRecoveryButton(){
	var show = false;
	const patInfo = await this.DoctoruserInfoForecase(show);
	console.log("chaotenq",patInfo);
	const is_doc = true;
	this.predictRecoveryButton(patInfo.userId,is_doc);
},

    // 患者：“用户基础信息”按钮，获取数据并是否显示弹窗
async    userInfoForecase() {
      const userId = uni.getStorageSync("userInfo").user.userId;
	  const show = true;
	  this.getBasicInfo(userId,show);
      
    },
//获取传入id的基础信息
 async getBasicInfo(userId ,show){
	getUserInfoFromTableApi(userId)
	  .then(res => {
	    this.userInfo = res.data;
	    this.editableUserInfo = res.data;
			  // console.log("777777",this.editableUserInfo);
	    this.editableUserInfo.pain = Number(res.data.pain);
			  if(this.showUserModal!=true && show){
				  this.showUserModal = true;

			  }
	  })
	  .catch(error => {
	    console.error('获取用户信息失败：', error);
	    uni.showToast({ title: '获取用户信息失败', icon: 'none' });
	  }); 
 },   
    // 改变单选选项时触发，让 pain 的值始终为数字
    handlePainChange(e) {
      const newPain = Number(e.detail.value);
      this.editableUserInfo.pain = newPain;
    },
// 患者：点击“康复预测”，调用后端模型进行预测
predictRecoveryButton(userId,is_doc) {
	if(!is_doc){
    userId = uni.getStorageSync("userInfo").user.userId;
	  }
	  console.log(userId);
	  const is_save = true;
		ppredictRecovery(userId,this.Rehabilitation_status,is_save);
},
   
    // 保存用户基本信息到后端
    saveUserInfoButton() {
		this.userInfoForecase();
		if(this.editableUserInfo != null){
			this.userInfo = saveUserInfo(this.editableUserInfo);
		}else{
			console.log("获取用户信息失败");
			
		}      
    },
    // 关闭弹窗
    closeUserModal() {
      this.showUserModal = false;
    },
//设备管理
 deviceManagementButton() {
     deviceManagement();
    },

      clickBannerItem(item) {
        console.info(item)
      },
      changeSwiper(e) {
        this.current = e.detail.current
      },

    }
  }
</script>

<style lang="scss" scoped>
	
  /* #ifndef APP-NVUE */
  page {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    background-color: #fff;
    min-height: 100%;
    height: auto;
  }

  view {
    font-size: 14px;
    line-height: inherit;
  }
  /* #endif */
/* 弹窗覆盖层 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 弹窗容器 */
.modal {
  width: 90%;
  max-width: 600px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

/* 弹窗头部、底部 */
.modal-header, .modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f8f8;
}
.modal-header {
  font-size: 18px;
  font-weight: bold;
}
.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
}

/* 弹窗内容 */
.modal-body {
  padding: 16px;
  max-height: 70vh;
  overflow-y: auto;
}

/* 表单项 */
/* 表单项调整为横向排列 */
.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

/* 标签固定宽度并右边留空隙 */
.label {
  width: 100px; /* 根据需要调整宽度 */
  // margin-right: 10px;
  font-weight: bold;
}

/* 增大输入框高度，并使其在同一行显示 */
.input-field {
  flex: 1;
  height: 40px;  /* 设置更高的输入框 */
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* 单选组 */
.radio-group {
  display: flex;
  flex-direction: column;
}
.radio-option {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}
.radio-option radio {
  margin-right: 8px;
}

/* 底部按钮 */
.btn {
  padding: 5px 10px;
  font-size: 15px;
  border: none;
  border-radius: 4px;
}
.cancel-btn {
  background-color: #ccc; /* 灰色背景 */
  color: #fff; /* 白色文字 */
  border: none; /* 移除边框 */
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 15px;
  cursor: pointer;
}
.confirm-btn {
  background-color: #1989fa; /* 蓝色确认按钮 */
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 15px;
}
.modal-footer button + button {
  margin-left: 10px;
}
.modal-footer {
  display: flex;
  justify-content: flex-end; /* 按钮右对齐 */
  padding: 15px 20px;
  border-top: 1px solid #f5f5f5;
  gap: 10px; /* 按钮间距 */
}
  .text {
    text-align: center;
    font-size: 26rpx;
    margin-top: 10rpx;
  }

  .grid-item-box {
    flex: 1;
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 15px 0;
  }

  .uni-margin-wrap {
    width: 690rpx;
    width: 100%;
    ;
  }

  .swiper {
    height: 300rpx;
  }

  .swiper-box {
    height: 150px;
  }

  .swiper-item {
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #fff;
    height: 300rpx;
    line-height: 300rpx;
  }

  @media screen and (min-width: 500px) {
    .uni-swiper-dot-box {
      width: 400px;
      /* #ifndef APP-NVUE */
      margin: 0 auto;
      /* #endif */
      margin-top: 8px;
    }

    .image {
      width: 100%;
    }
  }
</style>
