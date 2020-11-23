const style = document.createElement('style')
style.setAttribute('id', 'czz')
document.head.append(style)

module.exports = function (str) {
  style.textContent += str
}
