<template>
  <view class="index-container">
    <!-- 顶部信息栏 -->
        <view class="top-info">
          <text v-if="healthData && healthData.data">温度：{{ healthData.data.temperature }}</text>
          <text v-if="healthData && healthData.data">屈膝度：{{ healthData.data.knee }}</text>
          <text v-if="healthData && healthData.data">当天总步数：{{ healthData.data.walk }}</text>
        </view>
    <!-- 圆形测试按钮 -->
    <button @click="showUserInfoPopup" class="test-button">测试</button>
    
    <!-- 使用自定义弹窗组件 -->
    <custom-modal :visible="showUserInfo" @close="cancelPopup">
      <view class="info-title">确认信息</view>
      <view class="popup-content">
        <view class="info-item">
          <text>姓名：</text>
          <input v-model="userInfo.name" placeholder="请输入姓名" />
        </view>
        <view class="info-item">
          <text>性别：</text>
          <input v-model="userInfo.gender" placeholder="请输入性别" />
        </view>
        <view class="info-item">
          <text>年龄：</text>
          <input v-model="userInfo.age" placeholder="请输入年龄" />
        </view>
        <view class="info-item">
          <text>体温：</text>
          <input v-model="userInfo.temperature" placeholder="请输入体温" />
        </view>
        <view class="info-item">
          <text>屈膝度：</text>
          <input v-model="userInfo.flexionDegree" placeholder="请输入屈膝度" />
        </view>
        <view class="info-item">
          <text>步数：</text>
          <input v-model="userInfo.steps" placeholder="请输入步数" />
        </view>
        <view class="info-item">
          <text>手术类型：</text>
          <input v-model="userInfo.surgeryType" placeholder="请输入手术类型" />
        </view>
        <view class="info-item">
          <text>手术时间：</text>
          <input v-model="userInfo.surgeryTime" placeholder="请输入手术时间" />
        </view>
        <view class="info-item">
          <text>是否吸烟：</text>
          <input v-model="userInfo.isSmoking" placeholder="请输入是否吸烟" />
        </view>
        <view class="info-item">
          <text>是否肿胀：</text>
          <input v-model="userInfo.isSwelling" placeholder="请输入是否肿胀" />
        </view>
        <view class="info-item">
          <text>疼痛级别：</text>
          <input v-model="userInfo.painLevel" placeholder="请输入疼痛级别" />
        </view>
        <view class="info-item">
          <text>症状描述：</text>
          <input v-model="userInfo.symptomDescription" placeholder="请输入症状描述" />
        </view>
        <!-- 弹窗底部按钮 -->
        <view class="button-group">
          <button @click="cancelPopup" class="cancel-button">取消</button>
          <button @click="confirmPopup" class="confirm-button">确认</button>
        </view>
      </view>
    </custom-modal>
  </view>
</template>

<script>
import CustomModal from '@/components/CustomModal/CustomModal.vue';
import { getLatestHealthData } from '@/api/healthData'

export default {
  components: {
    CustomModal
  },
  data() {
    return {
      // 健康数据初始值
      healthData: {
        temperature: null,
        knee: null,
        walk: null
      },
      showUserInfo: false,
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
      user_id: 2 // 假设用户 ID 为 1，实际使用时需要动态获取
    };
  },
  onLoad() {
    this.fetchLatestHealthData();
  },
  methods: {
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
		console.log("完整的健康数据:", this.healthData); // 打印完整的健康数据对象

		  console.log("健康数据"+this.healthData.data.knee);
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
}

.test-button {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #2979ff;
  color: white;
  font-size: 18px;
  margin-top: 50px;
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
  width: 100px;
  font-size: 20px;
  align-items: center;
}

.info-item input {
  flex: 1;
  border: 1px solid #cecece;
  padding: 0px;
  font-size: 1pxs;
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