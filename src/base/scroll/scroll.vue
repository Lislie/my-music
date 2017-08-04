<template>
  <div ref="wrapper">
    <slot>
      <!-- 插槽 -->
    </slot>
  </div>
</template>

<script type="text/ecmascript-6">
  import BScroll from 'better-scroll'

  export default {
    props: {
      probeType: {
        type: Number,
        default: 1
        // 1.会截流，只有在滚动结束的时候派发一个 scroll 事件
        // 2.在手指 move 的时候也会实时派发 scroll 事件，不会截流
        // 3.除了手指 mov 的时候派发scroll 事件，在 swipe(手指迅速滑动一小段距离)的情况下，列表会有一个长距离的滚动动画，这个滚动的动画过程中也会实时派发滚动事件
      },
      click: {
        type: Boolean,
        default: true
      },
      data: {
        type: Array,
        default: null
      }
    },
    mounted() {
      setTimeout(() => {
        this._initScroll()
      }, 20)
    },
    methods: {
      _initScroll() {
        if (!this.$refs.wrapper) { // 如果DOM还未加载，不调用滚动事件
          return
        }
        this.scroll = new BScroll(this.$refs.wrapper, {
          probeType: this.probeType,
          click: this.click
        })
      },
      enable() { // 启用better-scroll
        this.scroll && this.scroll.enable()
      },
      disable() { // 关闭better-scroll
        this.scroll && this.scroll.disable()
      },
      refresh() { // 强制scroll重新计算,元素发生变化时调用此方法
        this.scroll && this.scroll.refresh()
      }
    },
    watch: {
      data() {
        setTimeout(() => {
          this.refresh()
        }, 20)
      }
    }

  }
</script>

<style lang="stylus" scoped rel="stylesheet/stylus">

</style>


