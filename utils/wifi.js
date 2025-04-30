// utils/api.js
export async function fetchSensorData() {
  try {
    const response = await uni.request({
      url: 'http://192.168.43.95/data', 
      method: 'GET'
    });
    return response.data; // 返回传感器数据
  } catch (error) {
    console.error('获取传感器数据失败：', error);
    throw error;
  }
}
