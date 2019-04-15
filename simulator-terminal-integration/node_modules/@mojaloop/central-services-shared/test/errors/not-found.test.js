'use strict'

const Test = require('tape')
const NotFoundError = require('../../src/errors/not-found')
const ErrorCategory = require('../../src/errors/category')

Test('NotFoundError test', notFoundTest => {
  notFoundTest.test('payload should', payloadTest => {
    payloadTest.test('set error_id to NotFoundError and message to supplied', test => {
      const message = 'some message'
      let error = new NotFoundError(message)
      test.equal(error.category, ErrorCategory.NOT_FOUND)
      test.equal(error.payload.id, 'NotFoundError')
      test.equal(error.payload.message, message)
      test.end()
    })
    payloadTest.end()
  })

  notFoundTest.end()
})
