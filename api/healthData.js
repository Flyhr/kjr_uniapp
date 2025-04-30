// api/healthData.js
import request from '@/utils/request.js' // 假设已经有一个 request 工具函数

export function getLatestHealthData(user_id) {
  return request({
    url: '/api/healthData/getData',
    method: 'GET',
    params: {
      user_id
    }
  });
  
}

export function saveHealthData(data) {
    return request({
        url: '/api/healthData/setData',
        method: 'POST',
        data: data
    });
}