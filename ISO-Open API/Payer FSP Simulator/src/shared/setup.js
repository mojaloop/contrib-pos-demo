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

const Hapi = require('hapi')
const Boom = require('boom')
const Logger = require('@mojaloop/central-services-shared').Logger
const Metrics = require('../lib/metrics')
const Db = require('../payer/db/db');

const createServer = (port, modules) => {
  return (async () => {
    const server = await new Hapi.Server({
      port,
      routes: {
        validate: {
          failAction: async (request, h, err) => {
            throw Boom.boomify(err)
          }
        }
      }
    })
    Logger.info(`Registering server modules...`)
    await server.register(modules)

    Logger.info(`Initializing metrics...`)
    Metrics.setup()

    Db.connect((err) => {
      if (err) {
        console.log(err);
        //process.exit();
      }
      else {
        Logger.info(`Connected to db: ${Db.dbname}`);

      }
    });

    Logger.info(`Server starting up...`)
    await server.start()

    Logger.info(`Server running at: ${server.info.uri}`)
    return server
  })()
}

// Migrator.migrate is called before connecting to the database to ensure all new tables are loaded properly.
const initialize = async function ({ service, port, modules = [] }) {
  const server = await createServer(port, modules)
  return server
}

module.exports = {
  initialize,
  createServer
}
