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

const Glob = require('glob')
const Logger = require('@mojaloop/central-services-shared').Logger

exports.plugin = {
  name: 'api routes',
  register: function (server) {
    Glob.sync('*/routes.js', { cwd: __dirname, ignore: 'routes.js' })
      .forEach(x => {
        Logger.info(`Loading module: [${x}]`)
        server.route(require('./' + x))
      })
  }
}
