'use strict'

const Test = require('tape')
const Sinon = require('sinon')
const Handler = require('../src/handler')
const Module = require('../src/index')

Test('error handler module', moduleTest => {
  moduleTest.test('register should', registerTest => {
    registerTest.test('wire Handler onPreResponse method to server onPreResponse event', async function (test) {
      let extStub = Sinon.stub()
      let server = { ext: extStub }
      await Module.plugin.register(server, {})
      test.ok(extStub.calledWith('onPreResponse', Handler.onPreResponse))
      test.end()
    })

    registerTest.test('be named error-handler', test => {
      test.equal(Module.plugin.name, 'error-handler')
      test.end()
    })

    registerTest.end()
  })

  moduleTest.test('validateRoutes should', validateRoutesTest => {
    validateRoutesTest.test('return failAction and default options', async function (test) {
      const result = await Module.validateRoutes()

      test.equal(result.abortEarly, false)
      test.equal(result.language.key, '{{!key}} ')
      test.end()
    })

    validateRoutesTest.test('set abortEarly and language key on options and pass others', test => {
      const result = Module.validateRoutes({
        abortEarly: true,
        language: {
          key: 'not name'
        },
        others: 'others'
      })

      test.equal(result.abortEarly, false)
      test.equal(result.language.key, '{{!key}} ')
      test.equal(result.others, 'others')
      test.end()
    })

    validateRoutesTest.end()
  })

  moduleTest.end()
})
