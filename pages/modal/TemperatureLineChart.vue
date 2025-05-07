<template>
  <!-- 将 ref 添加到容器上 -->
  <div ref="chartContainer" class="chart-container"></div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'TemperatureLineChart',
  data() {
    return {
      chartInstance: null,
      // 保存一天24小时内的温度数据，初始值为 null 表示暂无数据
      chartData: Array(24).fill(null),
      // 横坐标固定为 0~23 点
      hours: Array.from({ length: 24 }, (_, i) => i + '点'),
    };
  },
  mounted() {
    // 使用 $nextTick 确保 DOM 更新完成
    this.$nextTick(() => {
      // 通过 ref 获取 DOM 容器，而非 document.getElementById
      const container = this.$refs.chartContainer;
      if (container) {
        this.chartInstance = echarts.init(container);
        this.initChart();
      } else {
        console.error("图表容器未找到");
      }
    });
  },
  methods: {
    initChart() {
      const option = {
        title: {
          text: '温度折线图',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            let data = params[0].data;
            return params[0].axisValue + ' : ' + (data !== null ? data + '℃' : '暂无数据');
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.hours,
          axisLabel: {
            formatter: '{value}'
          }
        },
        yAxis: {
          type: 'value',
          min: 33,
          max: 43,
          axisLabel: {
            formatter: '{value}℃'
          }
        },
        series: [{
          name: '温度',
          type: 'line',
          smooth: true,
          data: this.chartData,
          areaStyle: { opacity: 0.2 },
          lineStyle: { width: 3 }
        }]
      };
      this.chartInstance.setOption(option);
    },
    /**
     * 父组件调用 updateChart(newTemperature) 时，
     * 根据当前时间更新对应小时的数据并刷新图表
     */
    updateChart(newTemperature) {
      if (!this.chartInstance) {
        console.error("chartInstance 还未初始化");
        return;
      }
      const now = new Date();
      const currentHour = now.getHours();
      // 更新当前小时的温度数据
      this.chartData[currentHour] = newTemperature;
      // 刷新图表的数据
      this.chartInstance.setOption({
        series: [{ data: this.chartData }]
      });
    }
  }
};
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 300px;
}
</style>
