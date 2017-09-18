import * as types from './mutation-types' // 给暴露对象接口赋予变量名，types

const mutations = {
  [types.SET_SINGER](state, singer) {
    // 对接收的数据进行修改，第一个形参是我们获取的数据，第二个是要修改的数据
    state.singer = singer
    // 进行赋值，这样就可以修改我们的 state
  },
  [types.SET_PLAYING_STATE](state, flag) {
    state.playing = flag
  },
  [types.SET_FULL_SCREEN](state, flag) {
    state.fullScreen = flag
  },
  [types.SET_PLAYLIST](state, list) {
    state.playlist = list
  },
  [types.SET_SEQUENCE_LIST](state, list) {
    state.sequenceList = list
  },
  [types.SET_PLAY_MODE](state, mode) {
    state.mode = mode
  },
  [types.SET_CURRENT_INDEX](state, index) {
    state.currentIndex = index
  }
}

export default mutations
