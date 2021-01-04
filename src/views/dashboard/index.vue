<template>
  <div class="dashboard-container">
    <el-card class="box-card">
      <!-- <b>系统:</b><span class="system-text">GNU/Linux Debian GNU/Linux 8 (jessie) build 4.15.0-48-generic </span> -->
      <b>系统时间:</b><span class="system-text">{{ data.date }}</span>
      <b>系统运行时间:</b><span class="system-text">{{ data.time }}</span>
    </el-card> 
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <b>状态</b>
      </div>
      <el-row :gutter="20">
        <el-col :span="8">
          <div id="cpuChart" style="width: 250px;height: 250px" />
        </el-col>
        <el-col :span="8">
          <div id="menChart" style="width: 250px;height: 250px" />
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

      data: {
        cpu: {},
        mem: {}
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
    const ws = new WebSocket('ws://127.0.0.1:7002/ws')
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
    },
    setOptions({ cpu, mem }) {
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
  font-size: 14px;
  margin-bottom: 20px;
  .system-text {
    font-size: 12px;
    margin-left: 5px;
    margin-right: 30px;
  }
}
</style>
