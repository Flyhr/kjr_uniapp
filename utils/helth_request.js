// utils/request.js
import uni from '@dcloudio/uni-app'

// 封装请求函数
function request(options) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: 'https://localhost:7777' + options.url, // 替换为你的后端域名及端口
      method: options.method || 'GET',
      data: options.data || {},
      params: options.params || {},
      success: (res) => {
        console.log("完整响应数据：", res.data);
        if (res.data.code === 200 && res.data.data) {
          resolve(res.data.data)
        } else {
          console.error('获取数据失败：', res.data.msg);
          reject(res.data.msg)
        }
      },
      fail: (err) => {
        console.error('请求错误：', err);
        reject(err)
      }
    })
  })
}

export default request