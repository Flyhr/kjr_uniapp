const devicesInfo = {
	GetdeviceManagement(){
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
	
	// 弹出设备信息弹窗，提供“取消”和“删除”按钮
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
}}
export default devicesInfo