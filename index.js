const CZZTokenizer = require('./lib/tokenizer')
const CZZParser = require('./lib/parser')
const inject = require('./lib/inject')

// Global transforms - Emmet shorthands are enabled by default
const transforms = [
  require('./emmet')
]

/**
 * Styles cache to prevent "leaking memory" through reinserting the same
 * rules over and over again
 * @type {Map.<string, { className: string, css: string }>
 */
class Cache {
  constructor () {
    this.selectors = new Map()
  }

  has (selector, css) {
    const _css = this.selectors.get(selector)
    if (_css) return _css.has(css)

    return false
  }

  get (selector, css) {
    const _css = this.selectors.get(selector)
    if (_css) return _css.get(css)

    return null
  }

  set (selector, css, val) {
    let _css = this.selectors.get(selector)
    if (_css == null) {
      _css = new Map()
      this.selectors.set(selector, _css)
    }

    _css.set(css, val)
    return this
  }

  clear () {
    this.selectors = new Map()
  }
}
const cache = new Cache()

//
function czzx (parentSelector = null, isGlobal = false, strs = [], ...inter) {
  // Noop
  if (strs == null || strs.length === 0 || (strs[0] === '' && inter.length === 0)) {
    const fn = czzx.bind(null, parentSelector, isGlobal)
    fn.toString = () => parentSelector
    fn.classList = (parentSelector && parentSelector.split('.').slice(1)) || []
    fn.css = ''
    return fn
  }

  let css
  let selector
  let classList

  let str = strs[0]
  for (let i = 0; i < inter.length; i++) {
    str += inter[i].toString()
    str += strs[i + 1]
  }

  // Check if we already cached this rule or need to tokenize and parse
  if (cache.has(parentSelector, str)) {
    ({ css, selector, classList } = cache.get(parentSelector, str))
  } else {
    const tokenizer = new CZZTokenizer(str)
    const parser = new CZZParser(transforms, parentSelector, isGlobal)

    parser.parse(tokenizer)

    css = parser.stringify()
    selector = parser.selector
    classList = selector.split('.').slice(1) || []

    // Inject into <head> and cache
    for (const rule of parser.values()) {
      inject(rule)
    }

    cache.set(parentSelector, str, { css, classList, selector })
  }

  // Create composition function
  const fn = czzx.bind(null, selector, isGlobal)
  fn.toString = () => selector
  fn.classList = classList
  fn.css = css

  return fn
}
czzx.toString = () => ''
czzx.css = ''
czzx.classList = []

const czz = czzx.bind(null, null, false)

czz.global = czzx.bind(null, null, true)
czz.clear = () => {
  cache.clear()
  inject.clear()
}

czz.transforms = transforms

module.exports = czz
