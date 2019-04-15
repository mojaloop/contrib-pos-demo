'use strict'

const Test = require('tape')
const BaseError = require('../../src/errors/base')

class TestError extends BaseError {
  constructor (category = 'TestCategory', message = 'No message') {
    super(category, message)
  }
}

class TestErrorDefaults extends BaseError {
  constructor (category = 'TestCategory') {
    super(category)
  }
}

Test('BaseError test', errorTest => {
  errorTest.test('payload should', payloadTest => {
    payloadTest.test('assign error_id to constructor name and message to supplied message', test => {
      let error = new TestError()

      test.equal(error.payload.id, 'TestError')
      test.equal(error.payload.message, error.message)
      test.end()
    })

    payloadTest.end()
  })

  errorTest.test('payload should have a constructor with default params', payloadTest => {
    payloadTest.test('assign error_id to constructor name and message to supplied message', test => {
      let error = new TestErrorDefaults()

      test.equal(error.payload.id, 'TestErrorDefaults')
      test.equal(error.payload.message, error.message)
      test.end()
    })

    payloadTest.end()
  })

  errorTest.end()
})
