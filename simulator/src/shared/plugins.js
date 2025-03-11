/*****
License
--------------
Copyright © 2020-2025 Mojaloop Foundation
The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License")

Contributors
--------------
This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 - Murthy Kakarlamudi murthy@modusbox.com
*****/

'use strict'

const Package = require('../../../package')
const Inert = require('inert')
const Vision = require('vision')
const Blipp = require('blipp')
const goodWinston = require('hapi-good-winston')
const ErrorHandling = require('@mojaloop/central-services-error-handling')
const Logger = require('@mojaloop/central-services-shared').Logger

const goodWinstonOptions = {
  levels: {
    response: 'debug',
    error: 'error'
  }
}

const registerPlugins = async (server) => {
  await server.register({
    plugin: require('hapi-swagger'),
    options: {
      info: {
        'title': 'ml api adapter API Documentation',
        'version': Package.version
      }
    }
  })

  await server.register({
    plugin: require('good'),
    options: {
      ops: {
        interval: 10000
      },
      reporters: {
        // Simple and straight forward usage
        winston: [goodWinston(Logger)],
        // Adding some customization configuration
        winstonWithLogLevels: [goodWinston(Logger, goodWinstonOptions)],
        // This example simply illustrates auto loading and instantiation made by good
        winston2: [
          {
            module: 'hapi-good-winston',
            name: 'goodWinston',
            args: [Logger, goodWinstonOptions]
          }
        ]
      }
    }
  })

  // await server.register({
  //   plugin: require('hapi-auth-basic')
  // })
  //
  // await server.register({
  //   plugin: require('@now-ims/hapi-now-auth')
  // })
  //
  // await server.register({
  //   plugin: require('hapi-auth-bearer-token')
  // })

  await server.register([Inert, Vision, Blipp, ErrorHandling])
}

module.exports = {
  registerPlugins
}
