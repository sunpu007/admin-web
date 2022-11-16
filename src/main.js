import Vue from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control

import * as filters from './filters' // global filters

import * as Sentry from '@sentry/vue'
import { Integrations } from '@sentry/tracing'

// set ElementUI lang to EN
Vue.use(ElementUI, { size: Cookies.get('size') || 'mini' })
// 如果想要中文版 element-ui，按如下方式声明
// Vue.use(ElementUI)

// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

Sentry.init({
  Vue,
  dsn: 'http://d03fccd60d7a422dbcc70c14c9e1af01@39.98.93.122:9000/3',
  integrations: [
    new Integrations.BrowserTracing({
      routingInstrumentation: Sentry.vueRouterInstrumentation(router),
      tracingOrigins: ['localhost', 'my-site-url.com', /^\//]
    })
  ],
  tracesSampleRate: 1.0
})

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
