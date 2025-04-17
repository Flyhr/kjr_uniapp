import Vue from 'vue'
import App from './App'
import store from './store' // store
import plugins from './plugins' // plugins
import './permission' // permission
// import UniPopup from '@dcloudio/uni-ui/lib/uni-popup/uni-popup.vue';

Vue.use(plugins)

Vue.config.productionTip = false
Vue.prototype.$store = store

App.mpType = 'app'

const app = new Vue({
  ...App
})

app.$mount()
// export default {
//   components: {
//     UniPopup,
//   },
// };