'use strict'

const Test = require('tape')

const Index = require('../src')

Test('Index', indexTest => {
  indexTest.test('Exports Logger', test => {
    test.equal(Index.Logger, require('../src/logger'))
    test.end()
  })

  indexTest.test('Exports BaseError', test => {
    test.equal(Index.BaseError, require('../src/errors/base'))
    test.end()
  })

  indexTest.test('Exports Encoding', test => {
    test.equal(Index.Encoding, require('../src/encoding'))
    test.end()
  })

  indexTest.test('Exports ErrorCategory', test => {
    test.equal(Index.ErrorCategory, require('../src/errors/category'))
    test.end()
  })

  indexTest.test('Exports NotFoundError', test => {
    test.equal(Index.NotFoundError, require('../src/errors/not-found'))
    test.end()
  })

  indexTest.test('Exports ValidationError', test => {
    test.equal(Index.ValidationError, require('../src/errors/validation'))
    test.end()
  })

  indexTest.end()
})
