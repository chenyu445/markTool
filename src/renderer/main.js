import Vue from 'vue'
import axios from 'axios'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// import ECharts from 'vue-echarts/components/ECharts.vue'
// import 'echarts/lib/chart/bar'
// import 'echarts/lib/component/tooltip'
import VCharts from 'v-charts'
import App from './App'
import router from './router'
import store from './store'
import * as filters from './filters' // 全局filter
// Vue.component('chart', VueECharts)
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.use(ElementUI)
Vue.use(VCharts)
// Vue.component('chart', ECharts)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
