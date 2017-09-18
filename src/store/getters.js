export const singer = state => state.singer
// get 数据，Set 数据,实际就是对数据的一层映射，可以根据 state计算出新值

export const playing = state => state.playing

export const fullScreen = state => state.fullScreen

export const playlist = state => state.playlist

export const sequenceList = state => state.sequenceList

export const mode = state => state.mode

export const currentIndex = state => state.currentIndex

export const currentSong = (state) => {
  // 可以通过计算属性获取数据
  return state.playlist[state.currentIndex] || {}
}
