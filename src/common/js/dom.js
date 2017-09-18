export function addClass(el, className) { // 添加 class 的 Dom
  if (hasClass(el, className)) {
    return
  }
  let newClass = el.className.split(' ')
  newClass.push(className)
  el.className = newClass.join(' ')
}

export function hasClass(el, className) {
  let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
  return reg.test(el.className)
}

export function getData(el, name, val) { // 获取 dom 数据 get set
  const prefix = 'data-'
  name = prefix + name
  if (val) {
    return el.setAttribute(name, val)
  } else {
    return el.getAttribute(name)
  }
}

let elementStyle = document.createElement('div').style // 创建一个空div
let vendor = (() => { // 判断浏览器供应商,立即执行函数
  let transformNames = {
    webkit: 'webkitTransform', //
    Moz: 'MozTransform', // 火狐
    O: 'Otransform', // 欧朋
    ms: 'msTransform', // ie
    standard: 'transform' // 标准
  }

  for (let key in transformNames) {
    if (elementStyle[transformNames[key]] !== undefined) {
      // 遍历元素如果有key,返回当前支持的浏览器 key
      return key
    }
  }
  return false
})()

export function prefixStyle(style) { // 会根据当前浏览器内核自动添加 css 前缀
  if (vendor === false) { // 如果都没有，浏览器有问题,直接返回
    return false
  }
  if (vendor === 'standard') { // 如果是标准，就返回当前 style
    return style
  }
  return vendor + style.charAt(0).toUpperCase() + style.substr(1)
    // 当前浏览器的供应商 key + 当前样式的第一个首字母，然后大写+剩余部分
}
