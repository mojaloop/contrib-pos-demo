'use strict'

const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const Winston = require('winston')
const Logger = require('../src/logger')

Test('logger', function (loggerTest) {
  let sandbox
  let addMethod
  let logMethod

  loggerTest.beforeEach(t => {
    sandbox = Sinon.createSandbox()
    sandbox.stub(Winston, 'createLogger')
    addMethod = Sinon.stub()
    logMethod = Sinon.stub()
    addMethod.returns({ log: logMethod })
    Winston.createLogger.returns({ add: addMethod })
    t.end()
  })

  loggerTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  loggerTest.test('configure Winston', function (assert) {
    assert.ok(Winston.transports.Console, Sinon.match({ timestamp: true, colorize: true }))
    assert.end()
  })

  loggerTest.test('log debug level', function (assert) {
    Logger.debug('test %s', 'me')
    assert.ok(Sinon.match('debug', 'test %s', 'me'))
    assert.end()
  })

  loggerTest.test('log info level', function (assert) {
    let infoMessage = 'things are happening'
    Logger.info(infoMessage)
    assert.ok(Sinon.match('info', infoMessage))
    assert.end()
  })

  loggerTest.test('log warn level', function (assert) {
    let warnMessage = 'something bad is happening'
    Logger.warn(warnMessage)
    assert.ok(Sinon.match('warn', warnMessage))
    assert.end()
  })

  loggerTest.test('log error level', function (assert) {
    let errorMessage = 'there was an exception'
    let ex = new Error()
    Logger.error(errorMessage, ex)
    assert.ok(Sinon.match('error', errorMessage, ex))

    assert.end()
  })

  loggerTest.end()
})
