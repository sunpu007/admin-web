<template>
  <div class="dashboard-container">
    <div id="cpuChart" style="width: 250px;height: 250px" />
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
      chart: null,

      data: {
        cpu: {}
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
      this.chart = echarts.init(document.getElementById('cpuChart'))
    },
    setOptions({ cpu }) {
      this.chart.setOption({
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
</style>
