<template>
  <div id="app">
    <m-header></m-header>
    <tab></tab>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <player></player>
  </div>
</template>

 <script type="text/ecmascript-6">
  import MHeader from 'components/m-header/m-header'
  import Tab from 'components/tab/tab'
  import Player from 'components/player/player'
  import wx from 'weixin-js-sdk'
  import axios from 'axios'
  export default {
    created() {
      this.signFn()
    },
    methods: {
      signFn() {
        let url = location.href.split('#')[0]
        console.log(url)
        axios.get('http://101.251.240.134:8080/mobile/api/v1/wechat/sign?url=' + url)
        .then((res) => {
          this.timestamp = res.data.nonceStr
          this.nonceStr = res.data.nonceStr
          this.signature = res.data.signature
          this.appId = res.data.appId
          this.url = res.data.url
          console.log(res)
          let links = this.url
          let title = ' 这是测试新接口111'
          let desc = '成功了吗？？？？？告诉我'
          let picUrl = 'http://img.ppx.easyto.com/images/wish/page1/logo_ppx.png'
          wx.config({
            debug: false,
            appId: this.appId,
            timestamp: this.timestamp,
            nonceStr: this.nonceStr,
            signature: this.signature,
            jsApiList: [
              'onMenuShareTimeline', 'onMenuShareAppMessage'
            ]
          })
          wx.ready(function () {
              // alert("done")
              // alert(title)
            wx.onMenuShareTimeline({
              title: title, // 分享标题
              link: links, // 分享链接'
              imgUrl: picUrl, // 分享图标
              success: function () {
                  // 分享纪录
                alert('分享到朋友圈成功')
              },
              cancel: function () {
                alert('分享失败,您取消了分享!')
              }
            })
            wx.onMenuShareAppMessage({
              title: title, // 分享标题
              desc: desc, // 分享描述
              link: links, // 分享链接
              imgUrl: picUrl, // 分享图标
              success: function () {
                alert('成功分享给朋友')
              },
              cancel: function () {
                alert('分享失败,您取消了分享!')
              }
            })
          })
        })
      }
    },
    components: {
      MHeader,
      Tab,
      Player
    }
  }
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
</style>

