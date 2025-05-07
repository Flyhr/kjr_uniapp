// api/healthData.js
import request from '@/utils/request.js' 
//获取数据库中的设备数据
export function getLatestHealthData(user_id) {
  return request({
    url: '/api/healthData/getData',
    method: 'GET',
    params: {
      user_id
    }
  });
  
}
//保存设备数到数据库中
export function saveHealthData(data) {
    return request({
        url: '/api/healthData/setData',
        method: 'POST',
        data: data
    });
}
/**
 * 删除数据库中设备数据的 API 调用
 * @param {number} userId - 用户ID，用于删除设备数据
 * @returns {Promise} Promise 对象，包含后端响应数据
 */
export function deleteHealthData(userId) {
  return request({
    url: '/api/healthData/deleteData',
    method: 'GET',
    data: { user_id: userId }
  });
}
// 获取 integrated_data_table 表的信息
export function getUserInfoFromTableApi(user_id) {
  return request({
    url: '/api/healthData/getBasicUserInfo', // 这里需要根据实际的后端接口地址修改
    method: 'get',
	params: {
	  user_id
	}
  })
}
//保存用户基础信息到数到数据库中
export function saveUserInfoFromTableApi(data) {
    return request({
        url: '/api/healthData/setBasicInfo',
        method: 'POST',
        data: data
    });
}
/**
 * 调用后端 SVM 模型预测接口
 * @param {number} userId - 用户ID，用于查询数据库中对应的 integrated_health_data 数据，并进行预测
 * @returns {Promise} 后端返回预测结果，例： { code: 200, data: { predictedPain: 1 }, msg: '成功' }
 */
export function predictHealthRecovery(userId) {
  return request({
    url: '/api/healthData/predict',
    method: 'GET',
    params: { user_id: userId }
  });
}