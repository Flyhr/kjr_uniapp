<template>
  <view class="custom-modal" v-if="visible">
    <!-- 半透明背景，点击背景关闭弹窗 -->
    <view class="modal-overlay" @click="$emit('close')"></view>
    <!-- 弹窗内容 -->
    <view class="modal-content">
      <slot></slot>
    </view>
  </view>
</template>

<script>
export default {
  name: "CustomModal",
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style lang="scss" scoped>
.custom-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 80%;
  max-width: 400px;
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  transform: translate(-50%, -50%);
  z-index: 1001;
}
</style>
