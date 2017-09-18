export default class Song { // 面向对象的一种拓展方式
  constructor({id, mid, singer, name, album, duration, image, url}) {
    this.id = id
    this.mid = mid
    this.singer = singer
    this.name = name
    this.album = album
    this.duration = duration
    this.image = image
    this.url = url
  }
}

export function createSong(musicData) { // 工厂方法，不直接调用 new，创建方法返回实例
  return new Song({
    id: musicData.songid, // 歌手 id
    mid: musicData.songmid, // 歌曲 id
    singer: filterSinger(musicData.singer), // 歌曲详情，数组转换成字符串
    name: musicData.songname, // 歌曲名字
    album: musicData.albumname, // 专辑名称
    duration: musicData.interval, // 歌曲时间
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`, // 歌手图片
    url: `http://ws.stream.qqmusic.qq.com/${musicData.songid}.m4a?fromtag=46` // 播放地址
  })
}

function filterSinger(singer) {
  let ret = []
  if (!singer) {
    return ''
  }
  singer.forEach((s) => {
    ret.push(s.name)
  })
  return ret.join('/')
}
