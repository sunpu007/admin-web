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
  dsn: 'http://0a7730e9082b43a189717472ea14d0e5@sentry.myjerry.cn/2',
  integrations: [
    new Integrations.BrowserTracing({
      routingInstrumentation: Sentry.vueRouterInstrumentation(router),
      tracingOrigins: ['localhost', 'my-site-url.com', /^\//]
    })
  ],
  logErrors: true,
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0
})

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
