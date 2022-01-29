const CZZTokenizer = require('./tokenizer')

module.exports = function parseStream (tokenizer, { onselector, onstring, onrule, ondeclbegin, ondeclend, ondone }) {
  for (const [token, value] of tokenizer) {
    switch (token) {
      case CZZTokenizer.TOK_SELECTOR:
        if ((onselector && onselector(tokenizer, value)) === false) { if (ondone) ondone(); return false }
        break
      case CZZTokenizer.TOK_DECL_BEGIN:
        if ((ondeclbegin && ondeclbegin(tokenizer)) === false) { if (ondone) ondone(); return false }
        break
      case CZZTokenizer.TOK_DECL_END:
        if ((ondeclend && ondeclend(tokenizer)) === false) { if (ondone) ondone(); return false }
        break

      case CZZTokenizer.TOK_RULE:
        if ((onrule && onrule(tokenizer, value)) === false) { if (ondone) ondone(); return false }
        break

      case CZZTokenizer.TOK_STRING:
        if ((onstring && onstring(tokenizer, value)) === false) { if (ondone) ondone(); return false }
        break
    }
  }

  if (ondone) ondone()
}
