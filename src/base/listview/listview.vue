<template>
  <scroll class="listview"
          :data='data'
          ref='listview'
          :listenScroll="listenScroll"
          @scroll="scroll"
          :probeType="probeType">
    <ul>
      <li v-for="(group,index) in data" class="list-group" :key='index' ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li @click="selectItem(item)" v-for="(item,index) in group.items" class="list-group-item" :key='index'>
            <img v-lazy="item.avatar" class="avatar">
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div class="list-shortcut"
        @touchstart="onShortcutTouchStart"
        @touchmove.stop.prevent="onShortcutTouchMove"
        >
      <ul>
        <li v-for="(item,index) in shortcutList"
            :key="index" class="item"
            :data-index="index"
            :class="{'current': currentIndex === index}"
            >
          {{item}}
        </li>
      </ul>
    </div>
    <div class="list-fixed" v-show="fixedTitle" ref="fixed">
      <h1 class="fixed-title">{{fixedTitle}}</h1>
    </div>
    <div v-show="!data.length" class="loading-container">
      <loading></loading>
    </div>
  </scroll>

</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll'
  import {getData} from 'common/js/dom'
  import Loading from 'base/loading/loading'

  const ANCHOR_HEIGHT = 18
  const TITLE_HEIGHT = 30
  export default {
    created() {
      this.touch = {} // 不用观测变化，可以这样保存动态坐标
      this.listenScroll = true // 初始化接收滚动事件
      this.listHeight = [] // 保存所有Group高度
      this.probeType = 3 // 快速滑动也会派发事件
    },
    props: {
      data: {
        type: Array,
        default: []
      }
    },
    data() {
      return {
        scrollY: -1, // 初始化观测 scrollY
        currentIndex: 0, // 索引
        diff: -1 // 区块上限 - scrollY 的差
      }
    },
    computed: {
      shortcutList() {
        return this.data.map((group) => {
          return group.title.substr(0, 1)
        })
      },
      fixedTitle() {
        if (this.scrollY > 0) {
          return ''
        }
        return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
      }
    },
    methods: {
      selectItem(item) { // 派发点击事件，告诉父组件点击的是什么
        this.$emit('select', item)
      },
      onShortcutTouchStart(e) {
        let anchorIndex = getData(e.target, 'index') // 获取index
        let firstTouch = e.touches[0] // 手指开始的位置
        this.touch.y1 = firstTouch.pageY // 获取手指开始位置赋值给 touch
        this.touch.anchorIndex = anchorIndex // 记录当前索引
        this._scrollTo(anchorIndex)
      },
      onShortcutTouchMove(e) {
        let firstTouch = e.touches[0] // 手指结束位置
        this.touch.y2 = firstTouch.pageY
        let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0 // 结束位置减去开始位置
        let anchorIndex = parseInt(this.touch.anchorIndex) + delta // 因为获取的是字符串，所以要转换
        this._scrollTo(anchorIndex)
      },
      _scrollTo(index) {
        if (!index && index !== 0) { // 阻止最上最下黑块有反应
          return
        }
        if (index < 0) { // 解决 move 最上最下index bug
          index = 0
        } else if (index > this.listHeight.length - 2) {
          index = this.listHeight.length - 2
        }
        this.scrollY = -this.listHeight[index]
        this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
      },
      scroll(pos) { // 接收 scroll 方法，传值
        this.scrollY = pos.y
      },
      _calculateHeight() { // 计算每个 group 的高度
        this.listHeight = []
        const list = this.$refs.listGroup
        let height = 0
        this.listHeight.push(height)
        for (let i = 0; i < list.length; i++) {
          let item = list[i]
          height += item.clientHeight // 获取每个 Group 的高度
          this.listHeight.push(height)
        }
      }
    },
    watch: {
      data() {
        setTimeout(() => {
          this._calculateHeight() // 监听group高度
        }, 20)
      },
      scrollY(newY) { // 监听 scrollY
        const listHeight = this.listHeight // 多次调用，保存值
        // 当滚动到顶部，newY >0
        if (newY > 0) {
          this.currentIndex = 0
          return
        }
        // 在中间部分
        for (let i = 0; i < listHeight.length - 1; i++) {
          let height1 = listHeight[i] // 保存当前高度
          let height2 = listHeight[i + 1] // 下一个元素高度
          if (!height2 || (-newY >= height1 && -newY < height2)) {
            // 当下一个元素高度有值的并且新的高度大于当前高度，小于下一个元素高度时
            this.currentIndex = i
            this.diff = height2 + newY
          // 把当前元素索引赋值
            return
          }
        }
        // 当滚动到底部，且-newY 大于最后一个元素的上限
        this.currentIndex = listHeight.length - 2
      },
      diff(newVal) {
        let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
          // 大于零，小 title 的高度，就计算出相差值
        if (this.fixedTop === fixedTop) { // diff 是实时的，一样就不执行，减少DOM 操作
          return
        }
        this.fixedTop = fixedTop
        this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`
        // 3d开启GPU加速,赋予DOM样式
      }
    },
    components: {
      Scroll,
      Loading
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
