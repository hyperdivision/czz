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
const cache = new Map()

//
function czzx (parent = null, isGlobal = false, [str] = []) {
  // Noop
  if (str === '' || str == null) {
    const fn = czzx.bind(null, parent, isGlobal)
    fn.toString = () => parent
    fn.className = parent
    fn.css = ''
    return fn
  }

  let css
  let className

  // Check if we already cached this rule or need to tokenize and parse
  if (cache.has(str)) {
    ({ css, className } = cache.get(str))
  } else {
    const tokenizer = new CZZTokenizer(str)
    const parser = new CZZParser(transforms, parent, isGlobal)

    parser.parse(tokenizer)

    css = parser.stringify()
    className = parser.namespace

    // Inject into <head> and cache
    inject(css)
    cache.set(str, { css, className })
  }

  // Create composition function
  const fn = czzx.bind(null, className, isGlobal)
  fn.toString = () => className
  fn.className = className
  fn.css = css

  return fn
}
czzx.toString = () => ''
czzx.css = ''
czzx.className = ''

const czz = czzx.bind(null, null, false)

czz.global = czzx.bind(null, null, true)
czz.transforms = transforms

module.exports = czz
