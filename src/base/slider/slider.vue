<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot>
        <!-- 插槽 -->
      </slot>
    </div>
    <div class="dots">
      <span class="dot" v-for="(item,index) in dots" :class="{active:currentPageIndex === index}"></span>
    </div>
  </div>
</template>

 <script type="text/ecmascript-6">
  import {addClass} from 'common/js/dom'
  import BScroll from 'better-scroll'
  // 轮播组件
  export default {
    data() {
      return {
        dots: [],
        currentPageIndex: 0
      }
    },
    props: {
      loop: { // 是否可以循环轮播
        type: Boolean,
        default: true
      },
      autoPlay: { // 是否可以自动轮播
        type: Boolean,
        default: true
      },
      interval: { // 轮播间隔事件
        type: Number,
        default: 4000
      }
    },
    mounted() {
      setTimeout(() => {
        this._setSliderWidth()
        this._initDots()
        this._initSlider()

        if (this.autoPlay) {
          this._play()
        }
      }, 20)

      window.addEventListener('resize', () => {
        if (!this.slider) {
          return
        }
        this._setSliderWidth(true)
        // 执行多次会多加 width,所以添加一个 FLAG,判断只执行一次
        this.slider.refresh()
        // BScoll 自带方法，如果页面发生改变，重新渲染
      })
    },
    methods: {
      _setSliderWidth(isResize) { // 动态设置宽度
        this.children = this.$refs.sliderGroup.children
        // 获取所有子容器
        let width = 0 // 初始化宽度
        let sliderWidth = this.$refs.slider.clientWidth
        // 父容器可视宽度
        for (let i = 0; i < this.children.length; i++) {
          let child = this.children[i]
          // 遍历接收所有子容器
          addClass(child, 'slider-item')
          // 给所有子容器动态设置样式
          child.style.width = sliderWidth + 'px'
          // 设置子容器宽度与父容器相同
          width += sliderWidth
          // 轮播总宽度
        }
        if (this.loop && !isResize) { // 如果是无缝循环轮播自动多加两个假容器
          width += 2 * sliderWidth
        }
        this.$refs.sliderGroup.style.width = width + 'px'
        // 赋予轮播容器计算宽度
      },
      _initDots() { // 初始化切换点
        this.dots = new Array(this.children.length)
      },
      _initSlider() { // 初始化轮播容器
        this.slider = new BScroll(this.$refs.slider, {
          scrollX: true, // 横向滚动
          scrollY: false, // 纵向滚动
          momentum: false, // 惯性
          snap: true, // 滑动
          snapLoop: this.loop, // 循环轮播
          snapThreshold: 0.3, // 手指滑动切换的阈值
          snapSpeed: 400 // 轮播动画切换的时间
        })

        this.slider.on('scrollEnd', () => {
          let pageIndex = this.slider.getCurrentPage().pageX
          if (this.loop) {
            pageIndex -= 1 // 无缝循环会多一个假图片，所以-1
          }
          this.currentPageIndex = pageIndex

          if (this.autoPlay) {
            clearTimeout(this.timer)
            this._play()
          }
        })
      },
      _play() { // 自动播放
        let pageIndex = this.currentPageIndex + 1
        if (this.loop) {
          pageIndex += 1
        }
        this.timer = setTimeout(() => {
          this.slider.goToPage(pageIndex, 0, 400)
          // BScoll自带方法，跳转到目标 index(x,y,动画时间)
        }, this.interval)
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .slider
    min-height: 1px
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>
