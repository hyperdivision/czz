class CZZTokenizer {
  static WHITESPACE = ' \t\n\r'
  static DELIMITERS = {
    '"': '"', // double quoted str
    "'": "'", // single quoted str
    '(': ')', // brackets
    '\/\/': '\n', // Single line comment
    '\/*': '*\/' // Multiline comment
  }

  static TOK_STRING = Symbol('STRING')
  static TOK_DECL_BEGIN = Symbol('DECL_BEGIN')
  static TOK_DECL_END = Symbol('DECL_END')
  static TOK_RULE = Symbol('RULE')
  static TOK_SELECTOR = Symbol('SELECTOR')

  static isDelimiter (char) {
    return this.DELIMITERS[char] != null
  }

  static isComment (char0, char1) {
    return char0 === '/' && (char1 === '*' || char1 === '/')
  }

  constructor (str) {
    this.str = str
    this.buf = ''
    this.offset = 0
    this.allWhitespace = true
  }

  prev () {
    return this.str[this.offset - 1]
  }

  char () {
    return this.str[this.offset]
  }

  peek (len = 1) {
    return this.str.substr(this.offset, len)
  }

  consume () {
    const str = this.buf
    this.buf = ''
    this.skip()

    return str
  }

  skip () {
    this.offset++
    this.skipWhitespace()
  }

  isEmpty () {
    return this.buf === ''
  }

  continueUntil (stop) {
    let escape = false

    while (true) {
      this.offset++
      this.buf += this.char()
      if (escape) {
        escape = false
        continue
      }

      if (this.char() === '\\') escape = true

      if (stop === this.char()) {
        this.offset++
        return this
      }
    }
  }

  skipComment (stop) {
    let escape = false
    const len = stop.length

    while (this.offset < this.str.length) {
      this.offset++
      if (escape) {
        escape = false
        continue
      }

      if (this.char() === '\\') escape = true

      if (stop === this.peek(len)) {
        this.offset += len
        return this
      }
    }
  }

  skipWhitespace () {
    while (this.constructor.WHITESPACE.includes(this.str[this.offset])) {
      this.offset++
    }
  }

  * [Symbol.iterator] () {
    this.skipWhitespace()
    while (this.offset < this.str.length) {
      const char = this.char()

      if (CZZTokenizer.isDelimiter(char)) {
        const start = this.offset
        this.buf += this.char()
        this.continueUntil(CZZTokenizer.DELIMITERS[char])
        yield [CZZTokenizer.TOK_STRING, this.str.substring(start, this.offset)]
        continue
      }

      if (CZZTokenizer.isComment(...this.peek(2))) {
        const stop = CZZTokenizer.DELIMITERS[this.peek(2)]
        this.skipComment(stop)
        this.skipWhitespace()
        continue
      }

      if (char === ';' || (this.prev() !== ',' && char === '\n') || CZZTokenizer.isComment(...this.peek(2))) {
        const tok = this.consume()
        if (tok != '') yield [CZZTokenizer.TOK_RULE, tok]
        continue
      }

      if (char === '{') {
        yield [CZZTokenizer.TOK_SELECTOR, this.consume()]
        yield [CZZTokenizer.TOK_DECL_BEGIN]
        continue
      }

      if (char === '}') {
        if (!this.isEmpty()) yield [CZZTokenizer.TOK_RULE, this.consume()]
        else this.skip()
        yield [CZZTokenizer.TOK_DECL_END]
        continue
      }

      this.buf += this.char()
      this.offset++
    }

    if (!this.isEmpty()) yield [CZZTokenizer.TOK_RULE, this.consume()]
  }
}

module.exports = CZZTokenizer
