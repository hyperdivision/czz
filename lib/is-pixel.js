const elm = document.createElement('div')

const cache = {
  flex: 0,
  border: 1,
  transform: 1,
  'line-height': 0,
  'box-shadow': 1,
  'border-top': 1,
  'border-left': 1,
  'border-right': 1,
  'border-bottom': 1
}

module.exports = function (property) {
  // Don't map custom properties
  if (property.startsWith('--')) return false
  if (property in cache) return cache[property]

  try {
    elm.style[property] = '1px'
    return (cache[property] = (elm.style[property].slice(-3) === '1px'))
  } catch (err) {
    return (cache[property] = false)
  }
}
