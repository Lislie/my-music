function getRandomInt(min, max) { // 随机获取 min到 max 中间的一个数，包括了 min 和 max
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function shuffle (arr) { // 洗牌函数
  for (let i = 0; i < arr.length; i++) {
    // 遍历 arr，从0-i 中取一个索引，和 i 交换
    let j = getRandomInt(0, i) // 随机获取一个数
    let t = arr[i] // 给 i 做临时变量
    arr[i] = arr[j] // 把 i 和 j 交还
    arr[j] = t // 再把随机数赋值给 i
  }
  return arr
}
