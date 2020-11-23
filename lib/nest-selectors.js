/**
 * Collapses two lists of selectors into one list of selectors.
 *
 * & is the nesting operator; parent selectors are replaced into this char
 * If no & is found, the parent selector is prepended (otherwise nesting
 * doesn't make sense). Selectors are prepended with whitespace, unless it's a
 * pseudoselector, in which case we "relax" and concat outright
 *
 * Examples:
 * ['.foo', '.bar'], ['.qux'] => ['.foo .qux', '.bar .qux']
 * ['.foo', '.bar'], [':hover &'] => [':hover .foo', ':hover .bar']
 * ['.foo', '.bar'], [':hover'] => ['.foo:hover', '.bar:hover']
 *
 * ['.1', '.2'], ['&.3', '&.4'] => ['.1.3', '.1.4', '.2.3', '.2.4']
 */
module.exports = function (a, b) {
  const alen = a.length
  const blen = b.length
  const res = new Array(Math.max(alen * blen, alen, blen))

  for (let i = 0; i < alen; i++) {
    for (let j = 0; j < blen; j++) {
      res[i + j] = ''
      let didReplace = false
      for (let k = 0; k < b[j].length; k++) {
        if (b[j][k] === '&') {
          res[i + j] += a[i]
          didReplace = true
          continue
        }

        res[i + j] += b[j][k]
      }

      if (didReplace === false) {
        res[i + j] = (
          a[i] + // "parent"
          (res[i + j][0] === ':' ? '' : ' ') + // is naked pseudo selector?
          res[i + j] // current child
        ).trim()
      }
    }
  }

  return res
}
