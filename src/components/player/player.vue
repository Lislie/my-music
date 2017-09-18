<template>
  <div class="player" v-show="playlist.length>0">
    <transition name="normal" @enter="enter" @after-enter="afterEnter" @leave="leave" @after-leave="afterLeave">
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image">
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle">
          <div class="middle-l">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls">
                <img class="image" :src="currentSong.image">
              </div>
            </div>
          </div>
        </div>
        <div class="bottom">
          <div class="progress-wrapper">
            <span class="time time-l">{{ format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
            </div>
            <span class="time time-r ">{{ format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i @click="prev" class="icon-prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i :class="playIcon" @click="togglePlaying"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i @click="next" class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon icon-not-favorite"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <img :class="cdCls" width="40" height="40" :src="currentSong.image">
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :radius="radius" :percent="percent">
            <i :class="miniIcon" @click.stop="togglePlaying" class="icon-mini"></i>
            <!-- 需要阻止冒泡 -->
          </progress-circle>
        </div>
        <div class="contorl">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <audio ref="audio" :src="currentSong.url" @canplay="ready" @error="error" @timeupdate="updateTime"></audio>
  </div>
</template>

<script type="text/ecmascript-6">
import { mapGetters, mapMutations } from 'vuex'
import animations from 'create-keyframe-animation'
// 用 js 创建 ccs3 的库
import { prefixStyle } from 'common/js/dom'
import ProgressBar from 'base/progress-bar/progress-bar'
import ProgressCircle from 'base/progress-circle/progress-circle'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'

const transform = prefixStyle('transform')

export default {
  data() {
    return {
      songReady: false, // 播放标识，避免连续点击 DOM未加载错误
      currentTime: 0, // 当前播放时间
      radius: 32
    }
  },
  computed: {
    cdCls() { // 判断 cd 旋转动画执行
      return this.playing ? 'play' : 'play pause'
    },
    playIcon() { // 通过计算属性计算播放按钮的 css
      return this.playing ? 'icon-pause' : 'icon-play'
    },
    miniIcon() {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    },
    disableCls() { // 处理快速播放标识的样式
      return this.songReady ? '' : 'disable'
    },
    percent() { // 歌曲播放比例
      return this.currentTime / this.currentSong.duration
      // 当前播放时间除以当前总时长
    },
    iconMode() { // 计算出当前播放模式
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    },
    ...mapGetters([
      'fullScreen', // 播放缩放状态
      'playlist', // 播放列表
      'currentSong', // 当前歌曲数据
      'playing', // 播放状态
      'currentIndex', // 播放歌曲index
      'mode', // 当前播放模式
      'sequenceList' // 播放列表顺序序列
    ])
  },
  mounted() {
    // setInterval(() => {
    //   console.log(this.percent)
    // }, 1000)
  },
  methods: {
    changeMode() { // 改变播放模式
      const mode = (this.mode + 1) % 3
      this.setPlayMode(mode) // 调用修改 Vuex 状态
      let list = null
      if (mode === playMode.random) { // 如果播放模式为随机的话
        list = shuffle(this.sequenceList)
      } else {
        list = this.sequenceList
      }
      this._resetCurrentIndex(list)
      this.setPlayList(list) // 把我们的 list 传入 vuex
    },
    _resetCurrentIndex(list) { // 重置索引
      let index = list.findIndex((item) => { // 遍历找到当前元素，赋值索引
        return item.id === this.currentSong.id
      })
      this.setCurrentIndex(index) // 当改变播放模式的时候，重新设置索引，使其不变
    },
    onProgressBarChange(percent) {
      this.$refs.audio.currentTime = this.currentSong.duration * percent
      // audio 设置播放时间，当前歌曲总时间乘以从子组件计算出来的播放百分比
      if (!this.playing) { // 如果当前不是播放状态的时候，调用方法使其播放
        this.togglePlaying()
      }
    },
    updateTime(e) { // 获取当前播放时间
      this.currentTime = e.target.currentTime
    },
    ready() {
      this.songReady = true
    },
    next() {
      if (!this.songReady) { // 如果false，直接返回,保证执行一次
        return
      }
      let index = this.currentIndex + 1
      if (index === this.playlist.length) { // 如果是最后一首歌变成第一首歌
        index = 0
      }
      this.setCurrentIndex(index)
      if (!this.playing) { // 切换下一首的时候改变按钮样式
        this.togglePlaying()
      }
      this.songReady = false
    },
    prev() {
      if (!this.songReady) { // 如果false，直接返回
        return
      }
      let index = this.currentIndex - 1
      if (index === -1) { // 如果是第一首歌变为最后一首歌
        index = this.playlist.length - 1
      }
      this.setCurrentIndex(index)
      if (!this.playing) {
        this.togglePlaying()
      }
      this.songReady = false
    },
    error() { // 处理加载失败
      this.songReady = true
    },
    format(interval) { // 时间戳转换
      interval = interval | 0
      const minute = interval / 60 | 0
      const second = this._pad(interval % 60)
      return `${minute}:${second}`
    },
    _pad(num, n = 2) { // 时间补值  0
      let len = num.toString().length
      while (len < n) {
        num = '0' + num
        len++
      }
      return num
    },
    togglePlaying() {
      this.setPlayingState(!this.playing) // 修改播放器状态，停止播放器
    },
    back() { // 打开 mini播放器
      this.setFullScreen(false) // 调用方法修改 vuex 状态
    },
    open() { // 关闭
      this.setFullScreen(true)
    },
    enter(el, done) { // vue 动画生命钩子函数，第一个是 DOM，第二个回调函数，执行直接跳到afterEnter
      const { x, y, scale } = this._getPosAndScale()

      let animation = {
        0: {
          transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
        },
        60: {
          transform: `translate3d(0,0,0) scale(1.1)`
        },
        100: {
          transform: `translate3d(0,0,0) scale(1)`
        }
      }
      animations.registerAnimation({ // 插件自带 API，注册动画
        name: 'move', // 动画名
        animation, // 动画效果
        presets: {
          duration: 400, // 动画间隔
          easing: 'linear' // 缓动
        }
      })

      animations.runAnimation(this.$refs.cdWrapper, 'move', done)
      // 启动动画API，第一个 DOM，第二个动画名,第三个是执行下after
    },
    afterEnter() {
      animations.unregisterAnimation('move') // 结束动画API
      this.$refs.cdWrapper.style.animation = '' // 清空动画
    },
    leave(el, done) {
      this.$refs.cdWrapper.style.transition = 'all 0.4s'
      const { x, y, scale } = this._getPosAndScale()
      this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
      this.$refs.cdWrapper.addEventListener('transitionend', done)
      // 监听动画结束之后，调用 done，就会执行 afterleave
    },
    afterLeave() {
      this.$refs.cdWrapper.style.transition = '' // 清空动画
      this.$refs.cdWrapper.style[transform] = ''
    },
    _getPosAndScale() {
      const targetWidth = 40 // 目标宽度
      const paddingLeft = 40 // 目标中心离左侧宽度
      const paddingBottom = 30 // 目标中心离底部宽度
      const paddingTop = 80 // 目标离顶部距离
      const width = window.innerWidth * 0.8 // 大图初始宽度
      const scale = targetWidth / width // 初始缩放值
      const x = -(window.innerWidth / 2 - paddingLeft) // 初始偏移量
      const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
      return {
        x,
        y,
        scale
      }
    },
    ...mapMutations({ //  vuexAPI,调用才可以修改状态
      setFullScreen: 'SET_FULL_SCREEN', // 改变播放器大小状态
      setPlayingState: 'SET_PLAYING_STATE', // 改变播放状态
      setCurrentIndex: 'SET_CURRENT_INDEX', // 歌曲索引
      setPlayMode: 'SET_PLAY_MODE', // 播放模式
      setPlayList: 'SET_PLAYLIST' // 播放列表
    })
  },
  watch: {
    currentSong(newSong, oldSong) { // 监视 currentSong 变化，变化即可播放
      if (newSong.id === oldSong.id) { // 如果 id 没变，什么都不做
        return
      }
      this.$nextTick(() => {
        this.$refs.audio.play()
      })
    },
    playing(newPlaying) {
      const audio = this.$refs.audio
      this.$nextTick(() => {
        newPlaying ? audio.play() : audio.pause()
        // 监听播放状态调用 auido 接口 暂停播放，启动播放
      })
    }
  },
  components: {
    ProgressBar,
    ProgressCircle
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
