<template>
  <transition name="slide">
    <music-list :songs="songs" :title="title" :bg-image="bgImage"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
  import {mapGetters} from 'vuex'
  import {getSingerDetail} from 'api/singer'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/song'
  import MusicList from 'components/music-list/music-list'

  // vuex 取数据的语法糖
  export default {
    data() {
      return {
        songs: []
      }
    },
    computed: {
      ...mapGetters([ // 从 vuex 获取数据
        'singer'
      ]),
      title() {
        return this.singer.name // 通过vuex 获取的数据动态计算获取 title
      },
      bgImage() {
        return this.singer.avatar
      }
    },
    created() {
      this._getDetail()
      console.log(this.singer)
    },
    methods: {
      _getDetail() {
        if (!this.singer.id) { // 如果没有获取到数据，跳转回 singer 页面
          this.$router.push('/singer')
          return
        }
        getSingerDetail(this.singer.id) // 因为数据是从 vuex 传递过来，所以必须从 singer 页面进来才有数据
          .then((res) => {
            if (res.code === ERR_OK) {
              this.songs = this._normalizeSongs(res.data.list)
              console.log(this.songs, res.data)
            }
          })
      },
      _normalizeSongs(list) {
        let ret = []
        list.forEach((item) => {
          let {musicData} = item
          if (musicData.songid && musicData.albummid) { // 必有值
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
    },
    components: {
      MusicList
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import '~common/stylus/variable'

  .slide-enter-active,.slide-leave-active
    transition all .3s
  .slide-enter,.slide-leave-to
    transform translate3d(100%,0,0)
</style>
