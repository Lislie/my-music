import {playMode} from 'common/js/config'

const state = {
  singer: {}, // 歌手数据
  playing: false, // 播放器播放和暂停
  fullScreen: false, // 播放器展开和最小化
  playlist: [], // 播放列表
  sequenceList: [], // 顺序播放列表
  mode: playMode.sequence, // 播放模式
  currentIndex: -1 // 当前播放的索引值

}

export default state
