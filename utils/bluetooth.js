// utils/bluetooth.js
export default {
  // 初始化蓝牙连接
  async initBluetooth() {
    return new Promise((resolve, reject) => {
      uni.openBluetoothAdapter({
        success: () => {
          console.log('蓝牙适配器初始化成功');
          this.startDiscoveringDevices(resolve, reject);
        },
        fail: (err) => {
          console.log('蓝牙适配器初始化失败', err);
          reject(err);
        }
      });
    });
  },
  // 开始搜索蓝牙设备
  startDiscoveringDevices(resolve, reject) {
    uni.startBluetoothDevicesDiscovery({
      services: [],
      success: () => {
        console.log('开始搜索蓝牙设备');
        uni.onBluetoothDeviceFound((devicesRes) => {
          const devices = devicesRes.devices;
          devices.forEach((device) => {
            if (device.name === 'ESP32') {
              console.log('发现ESP32设备');
              this.connectToDevice(device.deviceId, resolve, reject);
            }
          });
        });
      },
      fail: (err) => {
        console.log('搜索蓝牙设备失败', err);
        reject(err);
      }
    });
  },
  // 连接到ESP32设备
  connectToDevice(deviceId, resolve, reject) {
    uni.createBLEConnection({
      deviceId,
      success: () => {
        console.log('连接到ESP32设备成功');
        this.discoverServicesAndCharacteristics(deviceId, resolve, reject);
      },
      fail: (err) => {
        console.log('连接到ESP32设备失败', err);
        reject(err);
      }
    });
  },
  // 发现服务和特征
  discoverServicesAndCharacteristics(deviceId, resolve, reject) {
    uni.getBLEDeviceServices({
      deviceId,
      success: (servicesRes) => {
        const services = servicesRes.services;
        services.forEach((service) => {
          uni.getBLEDeviceCharacteristics({
            deviceId,
            serviceId: service.uuid,
            success: (characteristicsRes) => {
              const characteristics = characteristicsRes.characteristics;
              characteristics.forEach((characteristic) => {
                if (characteristic.properties.notify) {
                  this.enableNotification(deviceId, service.uuid, characteristic.uuid, resolve, reject);
                }
              });
            },
            fail: (err) => {
              console.log('发现特征失败', err);
              reject(err);
            }
          });
        });
      },
      fail: (err) => {
        console.log('发现服务失败', err);
        reject(err);
      }
    });
  },
  // 启用通知并监听特征值变化
  enableNotification(deviceId, serviceId, characteristicId, resolve, reject) {
    uni.notifyBLECharacteristicValueChange({
      state: true,
      deviceId,
      serviceId,
      characteristicId,
      success: () => {
        console.log('启用通知成功');
        uni.onBLECharacteristicValueChange((valueRes) => {
          const decoder = new TextDecoder('utf-8');
          const data = decoder.decode(valueRes.value);
          console.log('接收到的数据：', data);
          const [temperature, flexionDegree, totalSteps] = data.split(',');
          resolve({ temperature, flexionDegree, totalSteps });
        });
      },
      fail: (err) => {
        console.log('启用通知失败', err);
        reject(err);
      }
    });
  }
};