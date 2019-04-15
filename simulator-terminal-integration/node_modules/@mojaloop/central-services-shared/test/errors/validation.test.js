'use strict'

const Test = require('tape')
const ValidationError = require('../../src/errors/validation')
const ErrorCategory = require('../../src/errors/category')

Test('ValidationError test', validationTest => {
  validationTest.test('payload should', payloadTest => {
    payloadTest.test('set error_id, message and validation_errors', test => {
      const message = 'some message'
      const validationErrors = [{}]
      let error = new ValidationError(message, validationErrors)
      test.equal(error.category, ErrorCategory.BAD_REQUEST)
      test.equal(error.payload.id, 'ValidationError')
      test.equal(error.payload.message, message)
      test.equal(error.payload.validationErrors, validationErrors)
      test.end()
    })
    payloadTest.end()
  })
  validationTest.end()
})
