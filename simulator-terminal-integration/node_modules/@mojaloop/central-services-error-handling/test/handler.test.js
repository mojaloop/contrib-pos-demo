'use strict'

const Test = require('tape')
const Boom = require('boom')

const Handler = require('../src/handler')
const Shared = require('@mojaloop/central-services-shared')
const BaseError = Shared.BaseError
const ErrorCategory = Shared.ErrorCategory

let TestError = class extends BaseError {
  constructor (message) {
    super(ErrorCategory.UNPROCESSABLE, message)
  }
}

Test('error handler', handlerTest => {
  handlerTest.test('onPreResponse should', preResponse => {
    preResponse.test('Response is not Boom validation Error', async function (test) {
      let response = {
        isBoom: false,
        output:
        {
          payload:
          {
            error: 'BadRequest'
          }
        }
      }
      test.ok(Handler.onPreResponse({ response: response }, { continue: true }))
      test.end()
    })

    preResponse.test('Response is a Boom validation Error', async function (test) {
      let response = {
        isBoom: true,
        output:
        {
          payload:
          {
            error: 'BadRequest'
          }
        }
      }
      Handler.onPreResponse({ response: response }, {})
      test.equal(response.output.payload.id, 'BadRequestError')
      test.end()
    })

    preResponse.test('Response is Joi validation error', async function (test) {
      let response = {
        isBoom: true,
        isJoi: true,
        output:
        {
          payload:
          {
            message: 'ValidationError: child "amount" fails because [child "@ Supplied amount fails to match the required format. @" fails because [amount with value "1y.12" fails to match the required pattern: /^([0]|([1-9][0-9]{0,17}))([.][0-9]{0,3}[1-9])?$/]]',
            error: 'BadRequest'
          }
        }
      }
      Handler.onPreResponse({ response: response }, {})
      test.equal(response.output.payload.errorInformation.errorDescription, 'BadRequest')
      test.end()
    })

    preResponse.test('Response is Joi validation error with parsing exception', async function (test) {
      let response = {
        isBoom: true,
        isJoi: true,
        output:
        {
          payload:
          {
            error: 'BadRequest'
          }
        }
      }
      Handler.onPreResponse({ response: response }, {})
      test.equal(response.output.payload.errorInformation.errorDescription, 'BadRequest')
      test.end()
    })
    // busy here
    preResponse.test('Response is Joi validation error and extraction of simplified message fails', async function (test) {
      let response = {
        isBoom: true,
        isJoi: true,
        output:
        {
          payload:
          {
            message: 'ValidationError: child "amount" fails because [child fails because [amount with value "1y.12" fails to match the required pattern: /^([0]|([1-9][0-9]{0,17}))([.][0-9]{0,3}[1-9])?$/]]',
            error: 'BadRequest'
          }
        }
      }
      Handler.onPreResponse({ response: response }, {})
      test.equal(response.output.payload.errorInformation.errorDescription, 'BadRequest')
      test.end()
    })

    preResponse.test('handle boom wrapped errors with category property', async function (test) {
      let message = 'test'
      let error = new TestError(message)
      let response = Boom.badData(error)
      let request = {
        response: response
      }

      Handler.onPreResponse(request, {})
      test.equal(response.output.statusCode, 422)
      test.equal(response.output.payload.id, 'TestError')
      test.equal(response.output.payload.message, message)
      test.deepEqual(response.output.headers, {})
      test.end()
    })

    preResponse.test('reformat boom defined errors', async function (test) {
      let message = 'some bad parameters'
      let response = Boom.badRequest('some bad parameters')

      Handler.onPreResponse({ response }, {})
      test.equal(response.output.statusCode, 400)
      test.equal(response.output.payload.id, 'BadRequestError')
      test.equal(response.output.payload.message, message)
      test.end()
    })

    preResponse.test('return reasonable defaults', async function (test) {
      let error = new Error(undefined)
      let response = Boom.badImplementation(error)
      response.output.payload.message = null
      response.message = 'An internal server error occurred'
      Handler.onPreResponse({ response: response }, {})
      test.equal(response.output.statusCode, 500)
      test.equal(response.output.payload.id, 'InternalServerError')
      test.equal(response.output.payload.message, 'An internal server error occurred')
      test.end()
    })
    preResponse.end()
  })

  handlerTest.end()
})
