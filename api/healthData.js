// api/healthData.js
import request from '@/utils/request' // 假设已经有一个 request 工具函数

export function getLatestHealthData(user_id) {
  return request({
    url: '/api/healthData/latest',
    method: 'GET',
    params: {
      user_id
    }
  })
}