<template>
  <div class="dashboard-container">
    <el-card class="box-card">
      <b>系统:</b><span class="system-text">{{ data.sys.sys }}</span>
      <b>IP:</b><span class="system-text">{{ data.sys.ip }}</span>
      <b>系统时间:</b><span class="system-text">{{ data.time }}</span>
      <b>系统运行时间:</b><span class="system-text">{{ data.sys.date }}</span>
    </el-card>
    <el-card class="box-card chart-container">
      <div slot="header" class="clearfix">
        <b>状态</b>
      </div>
      <el-row>
        <el-col :span="6" :xs="24" :sm="12" :md="6">
          <div ref="cpuChart" class="chart" />
        </el-col>
        <el-col :span="6" :xs="24" :sm="12" :md="6">
          <div ref="menChart" class="chart" />
        </el-col>
        <el-col :span="6" :xs="24" :sm="12" :md="6">
          <div ref="diskChart" class="chart" />
        </el-col>
        <el-col :span="6" :xs="24" :sm="12" :md="6">
          <div ref="loadavgChart" class="chart" />
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as echarts from 'echarts'
require('echarts/theme/macarons')

const common = {
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
  }
}
export default {
  name: 'Dashboard',
  data() {
    return {
      ws: null,
      lockReconnect: false,

      cpuChart: null,
      menChart: null,
      loadavgChart: null,
      diskChart: null,

      data: {
        cpu: {},
        mem: {},
        sys: {},
        disk: {}
      }
    }
  },
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  mounted() {
    this.createWebSocket()

    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (this.ws) {
      this.ws.removeEventListener('open', this.onOpen)
      this.ws.removeEventListener('message', this.onMessage)
      this.ws.removeEventListener('close', this.onClose)
      this.ws.removeEventListener('error', this.onError)
      this.ws.close()
    }
  },
  methods: {
    createWebSocket() {
      try {
        if ('WebSocket' in window) {
          let url = `ws://${location.host}/ws`
          if (location.protocol.startsWith('https')) {
            url = `wss://${location.host}/ws`
          }
          this.ws = new WebSocket(url)
          this.lockReconnect = false
        }
        this.initEventHandle()
      } catch (e) {
        this.createWebSocket()
      }
    },
    initEventHandle() {
      this.ws.removeEventListener('open', this.onOpen)
      this.ws.removeEventListener('message', this.onMessage)
      this.ws.removeEventListener('close', this.onClose)
      this.ws.removeEventListener('error', this.onError)

      this.ws.addEventListener('open', this.onOpen)
      this.ws.addEventListener('message', this.onMessage)
      this.ws.addEventListener('close', this.onClose)
      this.ws.addEventListener('error', this.onError)
    },
    onOpen() {
      console.log('链接成功...')
      this.ws.send('message')
    },
    onMessage({ data }) {
      this.ws.send('message')
      this.data = JSON.parse(data)
      this.setOptions(this.data)
    },
    async onClose() {
      console.log('连接被断开，开启重连模式...')
      await this.reconnection()
    },
    async onError() {
      console.log('连接出现异常，开启重连模式...')
      await this.reconnection()
    },
    async reconnection() {
      if (this.lockReconnect) return
      this.lockReconnect = true
      await this.createWebSocket()
    },
    initChart() {
      this.cpuChart = echarts.init(this.$refs.cpuChart)
      this.menChart = echarts.init(this.$refs.menChart)
      this.loadavgChart = echarts.init(this.$refs.loadavgChart)
      this.diskChart = echarts.init(this.$refs.diskChart)
    },
    setOptions({ cpu, mem, sys, disk }) {
      this.cpuChart.setOption({
        tooltip: {
          formatter: '{a} <br/>{b} : {c}%'
        },
        series: [
          {
            name: 'CPU',
            type: 'gauge',
            detail: {
              formatter: `${cpu.used}%`,
              fontSize: 25
            },
            ...common,
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
            name: '内存占用率',
            type: 'gauge',
            detail: {
              formatter: `${mem.usageRate}%`,
              fontSize: 25
            },
            ...common,
            data: [
              { value: mem.usageRate, name: '内存占用率' }
            ]
          }
        ]
      }, true)
      this.diskChart.setOption({
        tooltip: {
          formatter: '{a} <br/>{b} : {c}%'
        },
        series: [
          {
            name: '磁盘使用率',
            type: 'gauge',
            detail: {
              formatter: `${disk.usageRate}%`,
              fontSize: 25
            },
            ...common,
            data: [
              { value: disk.usageRate, name: '磁盘使用率' }
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
            name: '系统负载',
            type: 'gauge',
            detail: {
              formatter: `${sys.loadavg5m}%`,
              fontSize: 25
            },
            ...common,
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
    width: 300px;
    height: 300px;
    margin: 0 auto;
  }
}
.chart-container ::v-deep .el-card__body {
  padding: 0;
}
</style>
