<template>
  <div class="dashboard-container">
    <el-card class="box-card">
      <b>系统:</b><span class="system-text">{{ data.sys.sys }}</span>
      <b>IP:</b><span class="system-text">{{ data.sys.ip }}</span>
      <!-- <b>系统时间:</b><span class="system-text">{{ data.time }}</span> -->
      <b>系统运行时间:</b><span class="system-text">{{ data.sys.date }}</span>
    </el-card>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <b>状态</b>
      </div>
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="chart" id="cpuChart" style="width: 250px;height: 250px" />
        </el-col>
        <el-col :span="8">
          <div class="chart" id="menChart" style="width: 250px;height: 250px" />
        </el-col>
        <el-col :span="8">
          <div class="chart" id="loadavgChart" style="width: 250px;height: 250px" />
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as echarts from 'echarts'
require('echarts/theme/macarons')
export default {
  name: 'Dashboard',
  data() {
    return {
      cpuChart: null,
      menChart: null,
      loadavgChart: null,

      data: {
        cpu: {},
        mem: {},
        sys: {}
      }
    }
  },
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  mounted() {
    const that = this
    const ws = new WebSocket(`ws://${location.host}/ws`)
    ws.addEventListener('message', ({ data }) => {
      ws.send('hello')
      that.data = JSON.parse(data)
      that.setOptions(that.data)
    })

    this.$nextTick(() => {
      this.initChart()
    })
  },
  methods: {
    initChart() {
      this.cpuChart = echarts.init(document.getElementById('cpuChart'))
      this.menChart = echarts.init(document.getElementById('menChart'))
      this.loadavgChart = echarts.init(document.getElementById('loadavgChart'))
    },
    setOptions({ cpu, mem, sys }) {
      this.cpuChart.setOption({
        tooltip: {
          formatter: '{a} <br/>{b} : {c}%'
        },
        series: [
          {
            name: '业务指标',
            type: 'gauge',
            detail: { formatter: `${cpu.used}%` },
            axisLine: {
              lineStyle: {
                width: 10
              }
            },
            splitLine: {
              length: 15,
              lineStyle: {
                color: '#DCDFE6'
              }
            },
            pointer: {
              length: '75%',
              width: 5
            },
            data: [
              { value: cpu.used, name: 'CPU占用率' }
            ]
          }
        ]
      }, true)
      this.menChart.setOption({
        tooltip: {
          formatter: '{a} <br/>{b} : {c}%'
        },
        series: [
          {
            name: '业务指标',
            type: 'gauge',
            detail: { formatter: `${mem.usageRate}%` },
            axisLine: {
              lineStyle: {
                width: 10
              }
            },
            splitLine: {
              length: 15,
              lineStyle: {
                color: '#DCDFE6'
              }
            },
            pointer: {
              length: '75%',
              width: 5
            },
            data: [
              { value: mem.usageRate, name: '内存占用率' }
            ]
          }
        ]
      }, true)
      this.loadavgChart.setOption({
        tooltip: {
          formatter: '{a} <br/>{b} : {c}%'
        },
        series: [
          {
            name: '业务指标',
            type: 'gauge',
            detail: { formatter: `${sys.loadavg5m}%` },
            axisLine: {
              lineStyle: {
                width: 10
              }
            },
            splitLine: {
              length: 15,
              lineStyle: {
                color: '#DCDFE6'
              }
            },
            pointer: {
              length: '75%',
              width: 5
            },
            data: [
              { value: sys.loadavg5m, name: '系统5m负载' }
            ]
          }
        ]
      }, true)
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}

.box-card {
  font-size: 12px;
  margin-bottom: 20px;
  .system-text {
    font-size: 10px;
    margin-left: 5px;
    margin-right: 30px;
  }
  .chart {
    margin: 0 auto;
  }
}
</style>
