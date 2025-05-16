<template>
    <view>
        <scroll-view scroll-y="true">
            <view class="list">
                <view v-for="(item,index) in list"  :class="[item.from == query.to?'item-left':'item-right','item']">
                    <u-avatar  :src="item.image"
                               fontSize="18"
                               randomBgColor  shape="square"></u-avatar>
                    <view  :class="[item.from == query.to?'msg-left':'msg-right']">{{item.content}}</view>
                </view>	
            </view>
        </scroll-view>
        <view class="list-boom">
            <view class="boom-item">  
                <u--input border="bottom" clearable shape="square" v-model="text"></u--input>
                <button type="primary" @click="tomsg" :disabled="isSending">{{isSending ? '发送中...' : '发送'}}</button>
                <u-icon name="phone"  size="38" @click="phoneto"></u-icon>
            </view>
        </view>
    </view>
</template>

<script>
import {list,addMessage} from "@/api/message/index.js";
// 假设 u--input 和 u-icon 组件需要引入
import UIcon from '@/uni_modules/uni-icons/components/uni-icons/uni-icons.vue';
// import UIcon from '@/components/u-icon/u-icon.vue';

export default {
    components: {
        // UInput,
        UIcon
    },
    data() {
        return {
            list: [],
            query: {"to": '', "pageNum": 1, "pageSize": 10},
            text: "",
            isSending: false
        };
    },
    watch: {
        "$store.state.websocketData": function(val, oldval) {
            let data = JSON.parse(val);
            if (data.type == 2) {
                this.getlist();
            }
        }
    },
    onLoad(e) {
        this.query.to = e.uid;
        this.getlist();
    },
    methods: {
        phoneto() {
            uni.navigateTo({
                url: '/pages/call/call?from=' + this.query.to + "&type=1"
            });
        },
        getlist() {
            list(this.query).then(res => {
                this.list = res.data.list;
            });
        },
        // 在 tomsg 方法中添加错误处理
        tomsg() {
            if (this.text.trim() === '') return;
            this.isSending = true;
            addMessage({to: this.query.to, content: this.text}).then(res => {
				console.log("发送按钮被点击",res);
				
                this.getlist();
            }).then(() => {
                this.$store.dispatch('websocketSend', {from: uni.getStorageSync("im-userid"), to: this.query.to, message: this.text, type: 2});
                this.text = '';
                this.isSending = false;
            }).catch(error => {
                this.isSending = false;
                uni.showToast({
                    title: '消息发送失败',
                    icon: 'none'
                });
                console.error('消息发送失败:', error);
            });
        },
	  getlist() {
	        list(this.query).then(res => {
	            if (this.query.pageNum === 1) {
	                this.list = res.data.list;
	            } else {
	                this.list = this.list.concat(res.data.list);
	            }
	        });
	    },
	    loadMore() {
	        this.query.pageNum++;
	        this.getlist();
	    }	
    }
};
</script>

<style>
	page{
		background-color: rgb(243,243,243);
	}
	
.list{
	padding-top: 50rpx;
	padding-left: 20rpx;
	padding-right: 20rpx;
	padding-bottom: 100rpx;
	display: flex;
	flex-direction: column;
}
.item{
	display: flex;
	padding: 20rpx 0;
	
}
.item-left{
	flex-direction: row;
}
.msg-left{
	margin-left: 16rpx;
	background-color: #ffffff;
	font-size: 25rpx;
	border-radius: 20rpx;
	line-height: 50rpx;
	padding: 16rpx 14rpx; 
	max-width: 50%;
	word-wrap:break-word
}

.item-right{
flex-direction: row-reverse;
}
.msg-right{
	margin-right: 16rpx;
	background-color: #ffffff;
	font-size: 28rpx;
	border-radius: 20rpx;
	line-height: 50rpx;
	padding: 16rpx 14rpx;
	max-width: 50%;
	word-wrap:break-word
}
.list-boom{
        background: #ffffff;
        border-top: 1px solid rgba(39, 40, 50, 0.1);
        width: 100%;
        position: fixed;
        bottom: 0;
        z-index: 100;
        padding-bottom: var(--status-bar-height);
        padding-bottom: env(safe-area-inset-bottom);
		
}
.boom-item{
	display: flex;
}

</style>
