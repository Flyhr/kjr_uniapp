// utils.js
import { formatDate } from  "@/utils/date.js";
import { deleteHealthData, getUserInfoFromTableApi, saveUserInfoFromTableApi, predictHealthRecovery } from '@/api/healthData.js';


//查询用户预测信息
export function    userInfoForecase(userId) {
      return getUserInfoFromTableApi(userId)
        .then(res => {
		if(res.data!=null){
			const userInfo = res.data;
			console.log("0000000",userInfo);
			return userInfo;
		  }
		  
        })
        .catch(error => {
          console.error('获取用户信息失败：', error);
          uni.showToast({ title: '获取用户信息失败', icon: 'none' });
        });
    }
	
//预测康复情况
export function ppredictRecovery(userId, Rehabilitation_status,is_no_save) {
  return predictHealthRecovery(userId)
    .then(res => {
      console.log("预测接口返回数据：", res);
      if (res && res.code === 200 && res.data && res.data.predictedPain != null) {
        const predictedPain = parseInt(res.data.predictedPain);
        const option = Rehabilitation_status.find(item => item.value === predictedPain);
        const description = option ? option.label : '未知';
        uni.showModal({
          title: '康复预测结果',
          content: '预测结果：' + description,
          showCancel: false
        });
        return getUserInfoFromTableApi(userId)
          .then(res => {
            const user_save_info = res.data;
            user_save_info.predictResult = predictedPain;
			if(is_no_save){
				return saveUserInfo(user_save_info);
			}else{
				console.log("返回用户新",user_save_info);
				return user_save_info;
			}
          })
          .catch(error => {
            console.error('获取用户信息失败：', error);
            uni.showToast({ title: '获取用户信息失败', icon: 'none' });
            throw error;
          });
      } else {
        uni.showToast({ title: res && res.msg ? res.msg : '预测失败', icon: 'none' });
        throw new Error('预测失败');
      }
    })
    .catch(err => {
      console.error('预测接口调用失败：', err);
      uni.showToast({ title: '预测请求失败', icon: 'none' });
      throw err;
    });
}
//保存用户预测基本信息
export function saveUserInfo(userInfo) {
  console.log("提交的用户信息:", userInfo);
  return saveUserInfoFromTableApi(userInfo)
    .then((resApi) => {
      if (resApi && resApi.code === 200) {
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        });
        return getUserInfoFromTableApi(userInfo.id)
          .then((res) => {
            return res.data;
          })
          .catch((error) => {
            console.error('获取用户信息失败：', error);
            uni.showToast({ title: '获取用户信息失败', icon: 'none' });
            throw error;
          });
      } else {
        uni.showToast({
          title: resApi.msg || '保存失败',
          icon: 'none'
        });
        throw new Error(resApi.msg || '保存失败');
      }
    })
    .catch((error) => {
      console.error('保存用户信息失败：', error);
      uni.showToast({ title: '保存用户信息失败', icon: 'none' });
      throw error;
    });
}
//设备管理
export function deviceManagement() {
  const userInfo = uni.getStorageSync('userInfo');
  const deviceInfo = userInfo.devices;
  // console.log("44444",deviceInfo);
  if (!deviceInfo || Object.keys(deviceInfo).length === 0) {
    uni.showModal({
      title: '设备信息',
      content: '当前没有连接的设备',
      showCancel: false,
      confirmText: '确定'
    });
    return;
  }

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

  let content = '';
  for (const key in fieldsMapping) {
    if (key === 'updateTime' && deviceInfo[key]) {
      content += `${fieldsMapping[key]}：${formatDate(deviceInfo[key])}\n`;
    } else if (key !== 'updateTime' && deviceInfo.hasOwnProperty(key)) {
      content += `${fieldsMapping[key]}：${deviceInfo[key] != null ? deviceInfo[key] : ''}\n`;
    }
  }

  return new Promise((resolve) => {
    uni.showModal({
      title: '设备信息',
      content: content,
      cancelText: '取消',
      confirmText: '删除',
      success: (res) => {
        if (res.confirm) {
          uni.showModal({
            title: '确认删除',
            content: '是否确认删除设备信息？',
            cancelText: '取消',
            confirmText: '确定',
            success: (resDel) => {
              if (resDel.confirm) {
                deleteHealthData(deviceInfo.userId)
                  .then((resApi) => {
                    if (resApi && resApi.code === 200) {
                      delete userInfo.devices;
                      uni.setStorageSync('userInfo', userInfo);
                      uni.showToast({
                        title: '设备信息已删除',
                        icon: 'success'
                      });
                      resolve();
                    } else {
                      uni.showToast({
                        title: resApi.msg || '删除失败',
                        icon: 'none'
                      });
                      resolve();
                    }
                  })
                  .catch((err) => {
                    console.error('删除请求出错：', err);
                    uni.showToast({
                      title: '请求失败',
                      icon: 'none'
                    });
                    resolve();
                  });
              } else {
                resolve();
              }
            }
          });
        } else {
          resolve();
        }
      }
    });
  });
}