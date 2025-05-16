<template>
  <view class="mine-container" :style="{height: `${windowHeight}px`}">
    <!--顶部个人信息栏-->
    <view class="header-section">
      <view class="flex padding justify-between">
        <view class="flex align-center">
          <view v-if="!avatar" class="cu-avatar xl round bg-white">
            <view class="iconfont icon-people text-gray icon"></view>
          </view>
          <image v-if="avatar" @click="handleToAvatar" :src="avatar" class="cu-avatar xl round" mode="widthFix">
          </image>
          <view v-if="!name" @click="handleToLogin" class="login-tip">
            点击登录
          </view>
          <view v-if="name" @click="handleToInfo" class="user-info">
            <view class="u_title">
              用户名：{{ name }}
            </view>
          </view>
        </view>
        <view @click="handleToInfo" class="flex align-center">
          <text>个人信息</text>
          <view class="iconfont icon-right"></view>
        </view>
      </view>
    </view>
    <view  class="content-section">
		
		<!-- 医生内容 -->
      <view  v-if="user_roleId ===3" class="mine-actions grid col-4 text-center">
        <view class="action-item" @click="myPatientInfo">
          <view class="iconfont icon-friendfill text-pink icon"></view>
          <text class="text">我的病人</text>
        </view>
        <view class="action-item" @click="DoctorpredictRecoveryButton">
          <view class="iconfont icon-service text-blue icon"></view>
          <text class="text">预测结果</text>
        </view>

        <view class="action-item" @click="suggestion">
          <view class="iconfont icon-dianzan text-green icon"></view>
          <text class="text">医生建议</text>
        </view>
      </view>
	  <!-- 患者内容 -->
	  <view  v-else class="mine-actions grid col-4 text-center">
        <view class="action-item" @click="myDoctorInfo">
          <view class="iconfont icon-friendfill text-pink icon"></view>
          <text class="text">我的医生</text>
        </view>
        <view class="action-item" @click="predictRecoveryButton">
          <view class="iconfont icon-service text-blue icon"></view>
          <text class="text">预测结果</text>
        </view>

        <view class="action-item" @click="doctor_suggestion">
          <view class="iconfont icon-dianzan text-green icon"></view>
          <text class="text">医生建议</text>
        </view>
      </view>

      <view class="menu-list">
        <view class="list-cell list-cell-arrow" @click="handleToEditInfo">
          <view class="menu-item-box">
            <view class="iconfont icon-user menu-icon"></view>
            <view>编辑资料</view>
          </view>
        </view>

        <view class="list-cell list-cell-arrow" @click="handleAbout">
          <view class="menu-item-box">
            <view class="iconfont icon-aixin menu-icon"></view>
            <view>关于我们</view>
          </view>
        </view>
        <view class="list-cell list-cell-arrow" @click="handleToSetting">
          <view class="menu-item-box">
            <view class="iconfont icon-setting menu-icon"></view>
            <view>应用设置</view>
          </view>
        </view>
      </view>

    </view>
  </view>
</template>

<script>
import { formatDate } from  "@/utils/date.js";
import { deleteHealthData,getDoctorData,getPatientData,getUserInfoFromTableApi ,saveUserInfoFromTableApi,predictHealthRecovery } from '@/api/healthData.js';
import { userInfoForecase,ppredictRecovery, saveUserInfo, deviceManagement } from '@/utils/prediction.js';
  export default {
    data() {
      return {
		  userBasicData:{},
		docInfo:{}  ,
        name: this.$store.state.user.name,
        version: getApp().globalData.config.appInfo.version,
		user_roleId : uni.getStorageSync("userInfo").user.roles[0].roleId,
		Rehabilitation_status: [
		  { value: 0, label: '恢复很好。步行练习：第一步：直立时应能保持平衡，感到舒适。第二步：把步行器或拐杖向前移动少许距离，术侧膝关节伸直向前移动，先足跟着地，身体前移，再将足部放平，最后由足趾离地。行走频率、步伐距离及速度要均匀。当肌力和耐力都增加以后，可以逐步延长步行时间和距离。' },
		  { value: 1, label: '恢复良好。弯腿练习：开始时可在床侧进行，患者坐于床边自然放松，小腿凭借重力垂到床下，达到90°;然后将健肢放到患肢前方，向后压，即可增加屈膝角度，用力大小以能够忍受为度。' },
		  { value: 2, label: '恢复较差。踝泵练习：平躺或坐在床上，下肢伸直，大腿放松，缓缓尽力勾起脚尖，至最大位置时保持10秒，然后脚尖缓缓朝下，至最大位置时保持10秒，然后放松。稍休息后再进行下一组动作。反复地屈伸踝关节，最好每个小时练习5分钟，一天练5至8次。' }
		],
		predictRecovery_status: [
		  { value: 0, label: '恢复很好。' },
		  { value: 1, label: '恢复一般。' },
		  { value: 2, label: '恢复较差。' }
		],
		userInfo:{},
		predictRecovery:null
      }
    },
    computed: {
      avatar() {
        return this.$store.state.user.avatar
      },
      windowHeight() {
        return uni.getSystemInfoSync().windowHeight - 50
      }
    },
    methods: {
// 添加辅助方法：性别映射
getSexText(sex) {
    const sexMap = {
        '0': '男',
        '1': '女',
        '2': '未知'
    };
    return sexMap[sex] || '未知'; // 处理异常值
},

// 添加辅助方法：状态映射
getStatusText(status) {
    const statusMap = {
        '0': '正常',
        '1': '停用'
    };
    return statusMap[status] || '异常状态'; // 处理异常值
},
//医生：给予患者建议
async suggestion() {
    try {
        // 先选择患者并加载用户数据
        await this.selectpatient();
        this.userBasicData = await userInfoForecase(this.userInfo.userId);

        // 显示选择分类的操作列表
        uni.showActionSheet({
            itemList: ['恢复很好建议', '恢复良好建议', '恢复较差建议'],
            success: (actionRes) => {
                // 记录所选分类的下标（0、1、2）
                const index = actionRes.tapIndex;
                // 获取对应分类的当前建议内容
                const currentLabel = this.Rehabilitation_status[index].label;

                // 弹出带输入框的模态框，默认值设为当前建议内容
                // 注：这里利用了 editable:true 以及 defaultValue 传入默认值
                uni.showModal({
                    title: '修改康复建议',
                    // content: '请修改建议内容：',
                    editable: true,
                    defaultValue: currentLabel,
                    placeholderText: '请输入康复建议',
                    success: (modalRes) => {
                        if (modalRes.confirm) {
                            const inputValue = modalRes.content;

                            // 更新对应分类的建议（前端状态更新）
                            this.Rehabilitation_status[index].label = inputValue;

                            // 根据选择分类设置 doctorResult（值保持为 0,1,2，与后端逻辑保持一致）
                            this.userBasicData.doctorResult = index;

                            // 保存修改后的用户数据，后端接口保持不变
                            saveUserInfo(this.userBasicData)
                                .then(() => {
                                    console.log('用户数据保存成功');
                                    uni.showToast({
                                        title: '建议保存成功',
                                        icon: 'success'
                                    });
                                })
                                .catch((error) => {
                                    console.error('保存用户数据失败', error);
                                    uni.showToast({
                                        title: '建议保存失败',
                                        icon: 'none'
                                    });
                                });
                        }
                    },
                    fail: (err) => {
                        console.error('用户取消修改', err);
                    }
                });
            },
            fail: (err) => {
                console.error('用户取消选择', err);
            }
        });
    } catch (error) {
        console.error('加载用户数据失败', error);
        uni.showToast({
            title: '获取用户数据失败',
            icon: 'none'
        });
    }
},


			
//获得自己患者的id并查询他的基本信息表
async  selectpatient() {
	const userId = uni.getStorageSync("userInfo").user.userId;
	//现根据医生id查询医生和患者关系表中的患者id，再根据患者id查询他的基本信息表
	getPatientData(userId)
	  .then(res => {
			// const patient = res.data; // 提取用户信息
			this.userInfo = res.data;			
	  })
	  .catch(error => {
	    console.error('获取用户信息失败：', error);
	    uni.showToast({ title: '获取用户信息失败', icon: 'none' });
	  });

	},

//医生：查看自己患者信息
async	myPatientInfo(){
		const userId = uni.getStorageSync("userInfo").user.userId;
		getPatientData(userId)
		  .then(res => {
            const patient = res.data; // 提取用户信息
			this.userInfo = res.data;	
			// console.log("6666",this.userInfo);
			
            // 构建弹窗内容（包含字段映射）
            const content = [
                `姓名：${patient.nickName || '未填写'}`,
                `性别：${this.getSexText(patient.sex)}`,
                `邮箱：${patient.email || '未填写'}`,
                `电话：${patient.phonenumber || '未填写'}`,
                `状态：${this.getStatusText(patient.status)}`
            ].join('\n'); // 使用换行符连接成多行文本

            // 显示模态弹窗
            uni.showModal({
                title: '患者信息',
                content: content,
                showCancel: false, // 隐藏取消按钮
                confirmText: '关闭' // 自定义确认按钮文本
            });			  
			
		  })
		  .catch(error => {
		    console.error('获取用户信息失败：', error);
		    uni.showToast({ title: '获取用户信息失败', icon: 'none' });
		  });
	},	
	// 医生：患者预测结果，调用后端模型进行预测
async DoctorpredictRecoveryButton() {
	      const userId = this.userInfo.userId;
		  const no_save = false;
			const user_info= await ppredictRecovery(userId,this.predictRecovery_status,no_save);
			// console.log("9999",user_info);
	},
				
//患者：查看自己医生信息
	myDoctorInfo(){
		const userId = uni.getStorageSync("userInfo").user.userId;
		getDoctorData(userId)
		  .then(res => {
			  console.log("6666",res);
            const doctor = res.data; // 提取用户信息
			this.docInfo = res.data;	
            // 构建弹窗内容（包含字段映射）
            const content = [
                `姓名：${doctor.nickName || '未填写'}`,
                `性别：${this.getSexText(doctor.sex)}`,
                `邮箱：${doctor.email || '未填写'}`,
                `电话：${doctor.phonenumber || '未填写'}`,
                `状态：${this.getStatusText(doctor.status)}`
            ].join('\n'); // 使用换行符连接成多行文本

            // 显示模态弹窗
            uni.showModal({
                title: '医生信息',
                content: content,
                showCancel: false, // 隐藏取消按钮
                confirmText: '关闭' // 自定义确认按钮文本
            });			  
			
		  })
		  .catch(error => {
		    console.error('获取医生信息失败：', error);
		    uni.showToast({ title: '获取医生信息失败', icon: 'none' });
		  });
	},
	// 患者：点击“康复预测”，调用后端模型进行预测
	predictRecoveryButton() {
	      const userId = uni.getStorageSync("userInfo").user.userId;
		  const no_save = false;
			ppredictRecovery(userId,this.predictRecovery_status,no_save);
	},
		// 患者：医生建议
	doctor_suggestion(){
		const userId = uni.getStorageSync("userInfo").user.userId;
		getUserInfoFromTableApi(userId)
		  .then(res => {
		    this.userInfo = res.data;
			const predictedPain = parseInt(res.data.doctorResult);
			const option = this.Rehabilitation_status.find(item => item.value === predictedPain);
			const description = option ? option.label : '未知';
			uni.showModal({
			  title: '医生建议',
			  content:  description,
			  showCancel: false
			});
		    console.log("医生建议",this.userInfo);
		  })
		  .catch(error => {
		    console.error('获取用户信息失败：', error);
		    uni.showToast({ title: '获取用户信息失败', icon: 'none' });
		  });
	},
      handleToInfo() {
        this.$tab.navigateTo('/pages/mine/info/index')
      },
      handleToEditInfo() {
        this.$tab.navigateTo('/pages/mine/info/edit')
      },
      handleToSetting() {
        this.$tab.navigateTo('/pages/mine/setting/index')
      },
      handleToLogin() {
        this.$tab.reLaunch('/pages/login')
      },
      handleToAvatar() {
        this.$tab.navigateTo('/pages/mine/avatar/index')
      },
      handleHelp() {
        this.$tab.navigateTo('/pages/mine/help/index')
      },
      handleAbout() {
        this.$tab.navigateTo('/pages/mine/about/index')
      },

	  Rehabilitation(){
		const  userId = uni.getStorageSync("userInfo").user.userId;
		
	  },
	  
      handleBuilding() {
        this.$modal.showToast('模块建设中~')
      }
    }
  }
</script>

<style lang="scss" scoped>
  page {
    background-color: #f5f6f7;
  }

  .mine-container {
    width: 100%;
    height: 100%;


    .header-section {
      padding: 15px 15px 45px 15px;
      background-color: #3c96f3;
      color: white;

      .login-tip {
        font-size: 18px;
        margin-left: 10px;
      }

      .cu-avatar {
        border: 2px solid #eaeaea;

        .icon {
          font-size: 40px;
        }
      }

      .user-info {
        margin-left: 15px;

        .u_title {
          font-size: 18px;
          line-height: 30px;
        }
      }
    }

    .content-section {
      position: relative;
      top: -50px;

      .mine-actions {
        margin: 15px 15px;
        padding: 20px 0px;
        border-radius: 8px;
        background-color: white;

        .action-item {
          .icon {
            font-size: 28px;
          }

          .text {
            display: block;
            font-size: 13px;
            margin: 8px 0px;
          }
        }
      }
    }
  }
</style>
