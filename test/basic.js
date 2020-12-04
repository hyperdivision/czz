const test = require('tape')
const czz = require('..')

test('empty inputs', (assert) => {
  czz``
  assert.equal(document.querySelector('#czz').textContent, '')
  czz()
  assert.equal(document.querySelector('#czz').textContent, '')
  czz(null)
  assert.equal(document.querySelector('#czz').textContent, '')
  czz([])
  assert.equal(document.querySelector('#czz').textContent, '')
  czz([''])
  assert.equal(document.querySelector('#czz').textContent, '')

  czz.global``
  assert.equal(document.querySelector('#czz').textContent, '')
  czz.global()
  assert.equal(document.querySelector('#czz').textContent, '')
  czz.global(null)
  assert.equal(document.querySelector('#czz').textContent, '')
  czz.global([])
  assert.equal(document.querySelector('#czz').textContent, '')
  czz.global([''])
  assert.equal(document.querySelector('#czz').textContent, '')

  assert.end()
})
