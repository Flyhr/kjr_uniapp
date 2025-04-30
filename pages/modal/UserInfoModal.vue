<template>
<!-- 使用绝对定位的模态容器，覆盖整个页面 -->
  <div v-if="visible" class="modal-overlay">
    <div class="modal-content">
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
        <text>步数：</text>
        <input v-model="userInfo.steps" placeholder="请输入步数" />
      </view>
      <view class="info-item">
        <text>屈膝度：</text>
        <input v-model="userInfo.flexionDegree" placeholder="请输入屈膝度" />
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
        <button @click="handleClose" class="cancel-button">取消</button>
        <button @click="handleConfirm" class="confirm-button">确认</button>
      </view>
    </view>
	</div>
	</div>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      required: true // 必须由父组件传递显隐状态
    },
    userInfo: {
      type: Object,
      default: () => ({
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
      })
    }
  },
  methods: {
    handleClose() {
      this.$emit('close');
    },
    handleConfirm() {
      this.$emit('confirm', this.userInfo);
      this.$emit('close');
    }
  }
};
</script>

<style lang="scss" scoped>
/* 弹窗内部样式 */
.popup-content {
  padding: 20px;
}
/* 新增模态弹窗的样式，确保覆盖页面并居中 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%; /* 适配小屏幕 */
  max-width: 400px;
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