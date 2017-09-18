<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper" ref="progressBtn"
          @touchstart="progressTouchStart"
          @touchmove="progressTouchMove"
          @touchend="progressTouchEnd">
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
 import {prefixStyle} from 'common/js/dom'
 const progressBtnWidth = 16
 const transform = prefixStyle('transform')
 export default {
   props: {
     percent: { // 百分比
       type: Number,
       default: 0
     }
   },
   created() {
     this.touch = {} // 用来保存共享对象
   },
   methods: {
     progressTouchStart(e) { // 手指滑动开始
       this.touch.initiated = true // 定义一个表示位，表示已经初始化了
       this.touch.startX = e.touches[0].pageX // 第一个手指开始位置
       this.touch.left = this.$refs.progress.clientWidth // 点击的时候进度条偏移位置
     },
     progressTouchMove(e) { // 滑动中
       if (!this.touch.initiated) { // 如果还没有初始化，直接返回。
         return
       }
       const deltaX = e.touches[0].pageX - this.touch.startX // 当前手指坐标减去开始手指坐标计算出偏移量
       const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, Math.max(0, this.touch.left + deltaX)) // 一开始偏移量加上现在滑动得偏移量
       // 坐标不超过bar 的总宽度
       this._offset(offsetWidth)
     },
     progressTouchEnd(e) { // 滑动结束
       this.touch.initiated = false
       this._triggerPercent()
     },
     progressClick(e) { // 点击圆点直接播放当前时间段歌曲
       this._offset(e.offsetX) // 直接设置当前偏移量
       this._triggerPercent() // 调用方法通知父组件我们改变的百分比
     },
     _triggerPercent() {
       const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
       // 当前播放宽度除以进度条总宽度
       const percent = this.$refs.progress.clientWidth / barWidth
       this.$emit('percentChange', percent) // 暴露给父组件
     },
     _offset(offsetWidth) { // 设置偏移封装函数
       this.$refs.progress.style.width = `${offsetWidth}px`
       this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
     }
   },
   watch: {
     percent(newPercent) { // 因为是动态的所以要监视计算出相应数值
       if (newPercent >= 0 && !this.touch.initiated) {
         const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
         const offsetWidth = newPercent * barWidth
         this._offset(offsetWidth)
       }
     }
   }
 }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>
