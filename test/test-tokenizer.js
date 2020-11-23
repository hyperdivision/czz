const test = require('tape')
const CZZTokenizer = require('../lib/tokenizer')

test('comment', function (assert) {
  const tok1 = new CZZTokenizer('w 10/* hello */')

  assert.deepEqual(Array.from(tok1), [
    [CZZTokenizer.TOK_RULE, 'w 10']
  ])
  assert.end()
})

test('url', function (assert) {
  const tok1 = new CZZTokenizer('w 1;h 1')

  assert.deepEqual(Array.from(tok1), [
    [CZZTokenizer.TOK_RULE, 'w 1'],
    [CZZTokenizer.TOK_RULE, 'h 1']
  ])

  const tok2 = new CZZTokenizer(`w 1
                               h 1`)

  assert.deepEqual(Array.from(tok2), [
    [CZZTokenizer.TOK_RULE, 'w 1'],
    [CZZTokenizer.TOK_RULE, 'h 1']
  ])

  const tok3 = new CZZTokenizer(`w 1;
                               h 1`)

  assert.deepEqual(Array.from(tok3), [
    [CZZTokenizer.TOK_RULE, 'w 1'],
    [CZZTokenizer.TOK_RULE, 'h 1']
  ])

  const tok4 = new CZZTokenizer(`w: 1;
                               h 1`)

  assert.deepEqual(Array.from(tok4), [
    [CZZTokenizer.TOK_RULE, 'w: 1'],
    [CZZTokenizer.TOK_RULE, 'h 1']
  ])

  assert.end()
})

test('url', function (assert) {
  const tokker = new CZZTokenizer('bgi url(test.png)')

  assert.deepEqual(Array.from(tokker), [
    [CZZTokenizer.TOK_STRING, '(test.png)'],
    [CZZTokenizer.TOK_RULE, 'bgi url(test.png)']
  ])

  assert.end()
})

test('animation', function (assert) {
  const tokker = new CZZTokenizer(`
  animation 200ms ease{
    // inline
    from{o 0}/* 0% */
    to{o 1}/* 1% */
  }`)

  assert.deepEqual(Array.from(tokker), [
    [CZZTokenizer.TOK_SELECTOR, 'animation 200ms ease'],
    [CZZTokenizer.TOK_DECL_BEGIN],
    [CZZTokenizer.TOK_SELECTOR, 'from'],
    [CZZTokenizer.TOK_DECL_BEGIN],
    [CZZTokenizer.TOK_RULE, 'o 0'],
    [CZZTokenizer.TOK_DECL_END],
    [CZZTokenizer.TOK_SELECTOR, 'to'],
    [CZZTokenizer.TOK_DECL_BEGIN],
    [CZZTokenizer.TOK_RULE, 'o 1'],
    [CZZTokenizer.TOK_DECL_END],
    [CZZTokenizer.TOK_DECL_END]
  ])
  assert.end()
})
