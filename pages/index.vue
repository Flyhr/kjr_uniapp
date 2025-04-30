<template>
  <view class="index-container">
    <!-- 顶部信息栏 -->
        <view class="top-info">
          <text v-if="healthData ">温度：{{ healthData.temperature }}℃</text>
          <text v-if="healthData ">屈膝度：{{ healthData.knelt_angle }}</text>
          <text v-if="healthData ">步数：{{ healthData.steps }}步</text>
		  
        </view>
		<div class="test-container">
			<button @click="showUserInfoPopup" class="test-button">测试</button>
			<button @click="fetchSensorData" class="test-button">获取传感器数据</button>		
			<button @click="saveHealthDataToServer" class="test-button">存储数据</button>		
		</div>
     <!-- 使用自定义弹窗组件 -->
        <UserInfoModal :visible="showUserInfo" :userInfo="userInfo" @close="cancelPopup" @confirm="confirmPopup" />
  </view>
</template>

<script>
import CustomModal from '@/components/CustomModal/CustomModal.vue';
import { getLatestHealthData,saveHealthData } from '@/api/healthData';
import bluetooth from '@/utils/bluetooth.js';
import wifiGetData from '@/utils/wifi.js'
import UserInfoModal from './modal/UserInfoModal.vue';


export default {
  components: {
    CustomModal,
	UserInfoModal
  },
  data() {
    return {
		showUserInfo: false,
      healthData: {
		  userId:uni.getStorageSync("userId"),
		  deviceName:'',
		  mac:'',
		  knelt_angle: 0, 
        temperature: 0,
        steps: 0,
		distance:0,
		speed:0,
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
      user_id: uni.getStorageSync("userId")
    };
  },
  onLoad() {
    this.fetchLatestHealthData();
	 // 每5秒执行一次获取数据
	    this.timer = setInterval(() => {
	      this.fetchSensorData();
	    }, 5000);
  },

  methods: {
		  fetchSensorData() {
		    uni.request({
		      url: 'http://192.168.43.95/data',
		      method: 'GET',
		      success: (res) => {
		        // console.log('接收到的数据111111：', res);
				this.healthData = res.data;
		      },
		      fail: (error) => {
		        console.error('获取传感器数据时出现错误：', error);
		      }
		    });
		  },
  saveHealthDataToServer() {
    const userId = uni.getStorageSync("userId");
		const healthDataToSave = {
      userId:userId,
      deviceName: "测试设备",
      deviceMac: this.healthData.mac,
      knee: this.healthData.knelt_angle,
      temperature: this.healthData.temperature,
      walk: this.healthData.steps,
      distance: this.healthData.distance,
      speed: this.healthData.speed
    };
console.log("传输后端数据",healthDataToSave);
    // 调用已有的 API 方法 saveHealthData 接收 user_id 和健康数据
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
    showUserInfoPopup() {
      console.log("测试按钮被点击，弹窗显示");
      this.showUserInfo = true;
    },
    cancelPopup() {
      console.log("弹窗关闭");
      this.showUserInfo = false;
    },
    confirmPopup() {
      console.log("用户信息已确认：", this.userInfo);
      this.showUserInfo = false;
    },
    fetchLatestHealthData() {
      getLatestHealthData(this.user_id)
        .then(data => {
          this.healthData = data
        })
        .catch(error => {
          console.error('获取健康数据失败：', error)
        })
    }
  }
};
</script>

<style lang="scss" scoped>
.index-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.top-info {
  width: 100%;
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
  background-color: #f5f6f7;
  margin-top: 40px;
  font-size: 15px;
}
 .test-container {
      display: flex;
      gap: 10px;
	flex-wrap: nowrap;

    }
.test-button {
  width: 200px;
  height: 50px;
  // border-radius: 90%;
  background-color: #2979ff;
  color: white;
  font-size: 20px;
  margin-top: 10px;
}
@media (max-width: 600px) {
      .test-button {
        width: 100px;
        font-size: 16px;
      }
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