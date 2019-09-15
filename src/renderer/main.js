import Vue from 'vue'
import axios from 'axios'
import BootstrapVue from 'bootstrap-vue'

import App from './App'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import store from '../store/store'

Vue.use(BootstrapVue)
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  store,
  components: { App },
  template: '<App/>'
}).$mount('#app')
