// utils/bluetooth.js
export default {
  /**
   * 扫描附近的蓝牙设备
   */
  async scanNearbyDevices() {
    return new Promise((resolve, reject) => {
      uni.openBluetoothAdapter({
        success: () => {
          console.log('蓝牙适配器已打开');
          uni.startBluetoothDevicesDiscovery({
            success: () => {
              console.log('正在扫描蓝牙设备...');
              // 设置超时时间，获取扫描结果
              setTimeout(() => {
                uni.getBluetoothDevices({
                  success: (res) => {
                    console.log('扫描到的设备：', res.devices);
                    resolve(res.devices); // 返回设备列表
                  },
                  fail: (err) => {
                    console.error('获取蓝牙设备列表失败：', err);
                    reject(err);
                  }
                });
                // 停止扫描
                uni.stopBluetoothDevicesDiscovery();
              }, 5000); // 扫描 5 秒
            },
            fail: (err) => {
              console.error('启动蓝牙扫描失败：', err);
              reject(err);
            }
          });
        },
        fail: (err) => {
          console.error('打开蓝牙适配器失败：', err);
          reject(err);
        }
      });
    });
  },

  /**
   * 连接目标设备
   */
  async connectToDevice(device) {
    return new Promise((resolve, reject) => {
      uni.createBLEConnection({
        deviceId: device.deviceId,
        success: (res) => {
          console.log('蓝牙设备连接成功：', res);
          resolve(res);
        },
        fail: (err) => {
          console.error('蓝牙设备连接失败：', err);
          reject(err);
        }
      });
    });
  }
};
