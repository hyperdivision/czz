const style = document.createElement('style')
style.setAttribute('id', 'czz')
document.head.append(style)

module.exports = function (str) {
  style.sheet.insertRule(str, style.sheet.cssRules.length)
}

module.exports.clear = () => {
  style.textContent = ''
}
