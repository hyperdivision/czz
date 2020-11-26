/* eslint-env browser */
const parseStream = require('./stream-tokenizer')
const nestSelectors = require('./nest-selectors')
const isPixel = require('./is-pixel')

function id (prefix = '') {
  return 'czz-' + prefix + Math.random().toString(36).slice(2)
}

class CZZParser {
  constructor (transforms = [], parentSelector = null, isGlobal = false) {
    this.animations = []
    this.mediaQueries = []
    this.fontFaces = []
    this.decl = []

    this.selectorPath = []
    this.declPath = []

    this.transforms = transforms
    this.namespace = id(isGlobal ? 'global-' : '')
    this.selector = (parentSelector != null ? parentSelector : '') + '.' + this.namespace

    this.addDecl([this.selector])

    if (isGlobal) {
      this.selectorPath.pop()
    }
  }

  parse (tok) {
    parseStream(tok, {
      ondeclbegin: () => {},
      ondeclend: () => this.endDecl(),
      onrule: (_, value) => this.addRule(value),
      onselector: (iter, value) => {
        if (this.isAnimation(value)) return this.parseAnimation(iter, value)
        if (this.isMediaQuery(value)) return this.parseMediaQuery(iter, value)
        if (this.isFontFace(value)) return this.parseFontFace(iter, value)
        const selector = this.parseSelector(value)
        return this.addDecl(selector)
      }
    })
  }

  addRule (value) {
    const decl = this.decl[this.declPath[this.declPath.length - 1]]
    decl.rules.push(...this.parseRule(value))
  }

  addDecl (selector) {
    this.selectorPath.push(selector)
    this._addDecl()
  }

  _addDecl () {
    this.declPath.push(this.decl.length)
    this.decl.push({ selector: this.selectorPath.reduce(nestSelectors, ['']).join(','), rules: [] })
  }

  endDecl () {
    this.selectorPath.pop()
    this.declPath.pop()
  }

  parseSelector (selector) {
    // TODO: only split when not inside a :is() or similar (eg string)
    return selector.split(',').map(s => s.trim())
  }

  parseRule (rule) {
    let idx = 0
    while (': '.includes(rule[idx++]) === false && rule[idx] != null) continue
    if (rule[idx] === ':') return rule
    const [property, value] = [rule.substring(0, idx - 1), rule.substring(idx)]
    let rules

    if (!CSS.supports(property, 'initial')) {
      for (const t of this.transforms) {
        rules = t(property, value)
        if (rules) break
      }
    }

    return (rules ?? [[property, value]]).map(stringify)

    function stringify ([property, value]) {
      return `${property}: ${units(value)}`

      function units (value) {
        if (!isPixel(property)) return value

        let unit = 'px'
        const tokens = /-?\d*\.?\d+[^ \t\n\r),]*|translate\s*\(|rotate\s*\(|\(|\)/g
        return value.replace(tokens, function (match) {
          if (match[0] === 't') { unit = 'px'; return match }
          if (match[0] === 'r') { unit = 'deg'; return match }
          if (match === '(') { unit = ''; return match }
          if (match === ')') { unit = 'px'; return match }
          if (match === '0') return match
          if (match[match.length - 1] < '0' || match[match.length - 1] > '9') return match
          return match + unit
        })
      }
    }
  }

  isFontFace (value) {
    return value.startsWith('@font-face')
  }

  parseFontFace (iter, selector) {
    const rules = []

    parseStream(iter, {
      onselector: (iter, value) => {
        throw new Error('Cannot have nested rules in font-face')
      },
      onrule: (_, value) => {
        rules.push(this.parseRule(value))
      },
      ondone: () => {
        this.fontFaces.push({ rules })
      }
    })
  }

  isAnimation (value) {
    return value.startsWith('ani') || value.startsWith('@keyframes')
  }

  parseAnimation (iter, selector) {
    let depth = 0
    const isKeyframes = selector.startsWith('@keyframes')
    const name = isKeyframes ? selector.substr('@keyframes'.length) : id('ani-')
    const keyframes = []

    parseStream(iter, {
      ondeclbegin () { depth++ },
      ondeclend () { return --depth === 0 },
      onselector: (iter, value) => {
        if (this.isAnimation(value)) throw new Error('Cannot have nested animations')
        if (this.isMediaQuery(value)) throw new Error('Cannot have nested media queries')

        keyframes.push({ offset: value, rules: [] })
      },
      onrule: (_, value) => {
        keyframes[keyframes.length - 1].rules.push(this.parseRule(value))
      },
      ondone: () => {
        this.animations.push({ name, keyframes })
        if (!isKeyframes) this.addRule(selector + ' ' + name)
      }
    })
  }

  isMediaQuery (value) {
    return value.startsWith('@media')
  }

  parseMediaQuery (iter, selector) {
    let depth = 0

    const declOffset = this.decl.length
    const query = selector
    this._addDecl()

    parseStream(iter, {
      ondeclbegin () { depth++ },
      ondeclend: () => { this.endDecl(); return --depth === 0 },
      onselector: (iter, value) => {
        if (this.isAnimation(value)) return this.parseAnimation(iter, value)
        if (this.isMediaQuery(value)) throw new Error('Cannot have nested media queries')
        const selector = this.parseSelector(value)
        return this.addDecl(selector)
      },
      onrule: (_, value) => this.addRule(value),
      ondone: () => {
        this.mediaQueries.push({ query, decl: this.decl.splice(declOffset, this.decl.length - declOffset) })
      }
    })
  }

  stringifyAnimations () {
    return this.animations.map(ani => {
      const body = ani.keyframes.reduce((s, kf) => s + `  ${kf.offset} {\n    ${kf.rules.join(';\n    ')}\n}`, '')
      return `@keyframes ${ani.name} {\n  ${body}\n}`
    })
  }

  stringifyFontFaces () {
    return this.fontFaces.map(ff => {
      const body = ff.rules.join(';\n  ')
      return `@font-face {\n  ${body}\n}`
    })
  }

  stringifyMediaQueries () {
    return this.mediaQueries.map(mq => {
      if (mq.decl.length === 0) return ''
      return `${mq.query} {\n${mq.decl.map(this._stringifyDecl).join('\n')}\n}`
    })
  }

  stringifyDecls () {
    return this.decl.map(this._stringifyDecl)
  }

  _stringifyDecl (def) {
    if (def.rules.length === 0) return ''
    return `${def.selector} {\n  ${def.rules.join(';\n  ')}\n}`
  }

  stringify () {
    return [
      ...this.stringifyFontFaces(),
      ...this.stringifyAnimations(),
      ...this.stringifyDecls(),
      ...this.stringifyMediaQueries()
    ].join('\n')
  }
}

module.exports = CZZParser
