<template>
  <view class="work-container">
    <uni-section title="诊疗预测" type="line"></uni-section>
    <view class="grid-body">
      <uni-grid :column="4" :showBorder="false">
        <uni-grid-item>
          <view class="grid-item-box" @click="userInfoForecase">
            <uni-icons type="person-filled" size="30"></uni-icons>
            <text class="text">用户信息</text>
          </view>
        </uni-grid-item> 
        <uni-grid-item>
          <view class="grid-item-box" @click="deviceManagement">
            <uni-icons type="settings-filled" size="30"></uni-icons>
            <text class="text">设备管理</text>
          </view>
        </uni-grid-item>
        <uni-grid-item>
          <view class="grid-item-box">
            <uni-icons type="staff-filled" size="30"></uni-icons>
            <text class="text">角色管理</text>
          </view>
        </uni-grid-item>
        <uni-grid-item>
          <view class="grid-item-box" @click="predictRecovery">
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
          <text>用户信息</text>
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
        <view class="modal-footer">
          <button @click="closeUserModal" class="btn cancel-btn">取消</button>
          <button @click="saveUserInfo" class="btn confirm-btn">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
import { formatDate } from  "@/utils/date.js";
import { deleteHealthData,getUserInfoFromTableApi ,saveUserInfoFromTableApi,predictHealthRecovery } from '@/api/healthData.js';
  export default {
    data() {
      return {
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
    // 点击“用户信息”按钮，获取数据并显示弹窗
    userInfoForecase() {
      const userId = uni.getStorageSync("userInfo").user.userId;
      getUserInfoFromTableApi(userId)
        .then(res => {
          this.userInfo = res.data;
          // 复制数据到 editableUserInfo，并确保 pain 为数字类型
          this.editableUserInfo = { ...res.data };
          this.editableUserInfo.pain = Number(res.data.pain);
          this.showUserModal = true;
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
// 新增方法：点击“康复预测”，调用后端模型进行预测
predictRecovery() {
  // 调用 predictHealthRecovery API，把 userId 传给后端
  predictHealthRecovery(this.userId)
    .then(res => {
      console.log("预测接口返回数据：", res);
      if (res && res.code === 200 && res.data && res.data.predictedPain != null) {
        // 将返回的预测值转换成整型（确保类型一致）
        const predictedPain = parseInt(res.data.predictedPain);
		console.log("predictedPain：",predictedPain);
        // 根据 Rehabilitation_status 映射预测等级描述
        const option = this.Rehabilitation_status.find(item => item.value === predictedPain);
        const description = option ? option.label : '未知';
        uni.showModal({
          title: '康复预测结果',
          content: '预测结果：' + description,
          showCancel: false
        });
      } else {
        uni.showToast({ title: res && res.msg ? res.msg : '预测失败', icon: 'none' });
      }
    })
    .catch(err => {
      console.error('预测接口调用失败：', err);
      uni.showToast({ title: '预测请求失败', icon: 'none' });
    });
},
   
    // 保存用户信息到后端
    saveUserInfo() {
      console.log('保存用户信息:', this.editableUserInfo);
      this.editableUserInfo.pain = Number(this.editableUserInfo.pain);
      console.log("提交的用户信息:", this.editableUserInfo);
      saveUserInfoFromTableApi(this.editableUserInfo)
        .then((resApi) => {
          if (resApi && resApi.code === 200) {
            uni.showToast({
              title: '保存成功',
              icon: 'success'
            });
            // 保存成功后重新获取最新数据
            getUserInfoFromTableApi(this.userId)
              .then((res) => {
                this.userInfo = res.data;
                this.editableUserInfo = { ...res.data };
                this.editableUserInfo.pain = Number(res.data.pain);
                this.showUserModal = true;
              })
              .catch((error) => {
                console.error('获取用户信息失败：', error);
                uni.showToast({ title: '获取用户信息失败', icon: 'none' });
              });
          } else {
            uni.showToast({
              title: resApi.msg || '保存失败',
              icon: 'none'
            });
          }
        })
        .catch((error) => {
          console.error('保存用户信息失败：', error);
          uni.showToast({ title: '保存用户信息失败', icon: 'none' });
        });
      this.showUserModal = false;
    },
    // 关闭弹窗
    closeUserModal() {
      this.showUserModal = false;
    },
  
 deviceManagement() {
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
    closeUserModal() {
      this.showUserModal = false;
    },
      clickBannerItem(item) {
        console.info(item)
      },
      changeSwiper(e) {
        this.current = e.detail.current
      },
      changeGrid(e) {
        this.$modal.showToast('模块建设中~')
      }
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
  background-color: #ccc;
  color: #fff;
}
.confirm-btn {
  background-color: #409EFF;
  color: #fff;
}
.modal-footer button + button {
  margin-left: 10px;
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
