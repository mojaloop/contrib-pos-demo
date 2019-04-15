'use strict'

const Test = require('tape')
const Encoding = require('../src/encoding')

Test('encoding test', encodingTest => {
  encodingTest.test('base64 should', base64test => {
    base64test.test('encode and decode value', test => {
      const value = 'some value'
      let encoded = Encoding.toBase64(value)
      test.notEqual(encoded, value)
      let decoded = Encoding.fromBase64(encoded)
      test.equal(decoded, value)
      test.end()
    })

    base64test.end()
  })

  encodingTest.end()
})
