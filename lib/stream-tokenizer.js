const czzTokenizer = require('./tokenizer')

module.exports = function parseStream (tokenizer, { onselector, onstring, onrule, ondeclbegin, ondeclend, ondone }) {
  for (const [token, value] of tokenizer) {
    switch (token) {
      case czzTokenizer.TOK_SELECTOR:
        if (onselector?.(tokenizer, value) === false) { ondone?.(); return false }
        break
      case czzTokenizer.TOK_DECL_BEGIN:
        if (ondeclbegin?.(tokenizer) === false) { ondone?.(); return false }
        break
      case czzTokenizer.TOK_DECL_END:
        if (ondeclend?.(tokenizer) === false) { ondone?.(); return false }
        break

      case czzTokenizer.TOK_RULE:
        if (onrule?.(tokenizer, value) === false) { ondone?.(); return false }
        break

      case czzTokenizer.TOK_STRING:
        if (onstring?.(tokenizer, value) === false) { ondone?.(); return false }
        break
    }
  }

  ondone?.()
}
