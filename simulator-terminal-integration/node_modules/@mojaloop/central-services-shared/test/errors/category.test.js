'use strict'

const Test = require('tape')
const ErrorCategory = require('../../src/errors/category')

Test('Category test', categoryTest => {
  categoryTest.test('getStatusCode should', statusTest => {
    statusTest.test('return appropriate status codes', test => {
      test.equal(ErrorCategory.getStatusCode(ErrorCategory.BAD_REQUEST), 400)
      test.equal(ErrorCategory.getStatusCode(ErrorCategory.CONFLICT), 409)
      test.equal(ErrorCategory.getStatusCode(ErrorCategory.FORBIDDEN), 403)
      test.equal(ErrorCategory.getStatusCode(ErrorCategory.INTERNAL), 500)
      test.equal(ErrorCategory.getStatusCode(ErrorCategory.METHOD_NOT_ALLOWED), 405)
      test.equal(ErrorCategory.getStatusCode(ErrorCategory.NOT_ACCEPTABLE), 406)
      test.equal(ErrorCategory.getStatusCode(ErrorCategory.NOT_FOUND), 404)
      test.equal(ErrorCategory.getStatusCode(ErrorCategory.NOT_IMPLEMENTED), 501)
      test.equal(ErrorCategory.getStatusCode(ErrorCategory.UNAUTHORIZED), 401)
      test.equal(ErrorCategory.getStatusCode(ErrorCategory.UNPROCESSABLE), 422)
      test.equal(ErrorCategory.getStatusCode(ErrorCategory.UNSUPPORTED_MEDIA_TYPE), 415)
      test.equal(ErrorCategory.getStatusCode('anything else'), 500)
      test.end()
    })
    statusTest.end()
  })

  categoryTest.end()
})
