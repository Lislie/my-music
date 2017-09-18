import 'babel-polyfill'
// Set、Maps、Proxy、Promise 等全局对象，API转义
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import fastclick from 'fastclick'
import VueLazyLoad from 'vue-lazyload'
import 'common/stylus/index.styl'

fastclick.attach(document.body)
// 解决移动端点击300毫秒延迟

Vue.use(VueLazyLoad, { // 图片懒加载
  loading: require('common/image/default.png') // 默认图片
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
  store,
  router
})
