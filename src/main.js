import 'babel-polyfill'
// Set、Maps、Proxy、Promise 等全局对象，API转义
import Vue from 'vue'
import App from './App'
import router from './router'
import fastclick from 'fastclick'
import 'common/stylus/index.styl'

fastclick.attach(document.body)
// 解决移动端点击300毫秒延迟

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
