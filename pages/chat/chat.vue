<template>
  <view>
    <!-- 聊天消息列表 -->
    <scroll-view scroll-y="true" class="chat-scroll-view">
      <view class="chat-list">
        <view 
          v-for="(item, index) in chatMessages" 
          :key="index" 
          :class="[item.from === query.to ? 'chat-item-left' : 'chat-item-right', 'chat-item']"
        >
          <!-- 用户头像 -->
          <u-avatar 
            :src="item.image"
            fontSize="18"
            randomBgColor
            shape="square"
          ></u-avatar>
          <!-- 聊天消息内容 -->
          <view 
            :class="[item.from === query.to ? 'chat-msg-left' : 'chat-msg-right']"
          >{{ item.content }}</view>
        </view>
      </view>
    </scroll-view>
    <!-- 输入框和发送按钮区域 -->
    <view class="chat-input-area">
      <view class="input-and-button">
        <!-- 输入框 -->
        <u--input 
          border="bottom" 
          clearable 
          shape="square" 
          v-model="inputText"
        ></u--input>
        <!-- 发送按钮 -->
        <button type="primary" @click="sendMessage">发送</button>
        <!-- 电话图标按钮 -->
        <u-icon name="phone" size="38" @click="makePhoneCall"></u-icon>
      </view>
    </view>
  </view>
</template>

<script>
import { list, addMessage } from "../../api/message/index.js";
import { msg, msgError } from "../../plugins/modal.js";

export default {
  data() {
    return {
      chatMessages: [], // 聊天消息列表
      query: { "to": "", "pageNum": 1, "pageSize": 10 }, // 查询参数
      inputText: "" // 输入框文本
    };
  },
  watch: {
    "$store.state.websocketData": function (val, oldVal) {
      try {
        const data = JSON.parse(val);
        if (data.type === 2) {
          this.fetchChatMessages();
        }
      } catch (error) {
        msgError("解析 WebSocket 数据出错");
      }
    }
  },
  onLoad(e) {
    this.query.to = e.uid;
    this.fetchChatMessages();
  },
  methods: {
    // 拨打电话
    makePhoneCall() {
      uni.navigateTo({
        url: `/pages/call/call?from=${this.query.to}&type=1`
      });
    },
    // 获取聊天消息
    fetchChatMessages() {
      list(this.query)
        .then(res => {
          if (res.data && res.data.list) {
            this.chatMessages = res.data.list;
          } else {
            msgError("获取聊天消息失败：数据格式错误");
          }
        })
        .catch(error => {
          msgError(`获取聊天消息失败：${error}`);
        });
    },
    // 发送消息
    sendMessage() {
      if (!this.inputText.trim()) {
        msg("请输入消息内容");
        return;
      }
      addMessage({ to: this.query.to, content: this.inputText })
        .then(res => {
          if (res.code === 200) {
            this.fetchChatMessages();
            this.$store.dispatch('websocketSend', {
              from: uni.getStorageSync("im-userid"),
              to: this.query.to,
              message: this.inputText,
              type: 2
            });
            this.inputText = "";
          } else {
            msgError(`发送消息失败：${res.msg}`);
          }
        })
        .catch(error => {
          msgError(`发送消息失败：${error}`);
        });
    }
  }
};
</script>

<style scoped>
/* 滚动视图样式 */
.chat-scroll-view {
  height: calc(100vh - 100rpx);
  padding: 20rpx;
}
/* 聊天消息列表样式 */
.chat-list {
  display: flex;
  flex-direction: column;
}
/* 单个聊天消息项样式 */
.chat-item {
  display: flex;
  padding: 20rpx 0;
}
/* 左侧聊天消息项样式 */
.chat-item-left {
  flex-direction: row;
}
/* 左侧聊天消息内容样式 */
.chat-msg-left {
  margin-left: 16rpx;
  background-color: #ffffff;
  font-size: 25rpx;
  border-radius: 20rpx;
  line-height: 50rpx;
  padding: 16rpx 14rpx;
  max-width: 50%;
  word-wrap: break-word;
}
/* 右侧聊天消息项样式 */
.chat-item-right {
  flex-direction: row-reverse;
}
/* 右侧聊天消息内容样式 */
.chat-msg-right {
  margin-right: 16rpx;
  background-color: #ffffff;
  font-size: 28rpx;
  border-radius: 20rpx;
  line-height: 50rpx;
  padding: 16rpx 14rpx;
  max-width: 50%;
  word-wrap: break-word;
}
/* 输入框和按钮区域样式 */
.chat-input-area {
  background: #ffffff;
  border-top: 1px solid rgba(39, 40, 50, 0.1);
  width: 100%;
  position: fixed;
  bottom: 0;
  z-index: 100;
  padding-bottom: var(--status-bar-height);
  padding-bottom: env(safe-area-inset-bottom);
}
/* 输入框和按钮布局样式 */
.input-and-button {
  display: flex;
}
</style>