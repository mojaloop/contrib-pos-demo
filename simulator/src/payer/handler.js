/*****
License
--------------
Copyright © 2020-2025 Mojaloop Foundation
The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

Contributors
--------------
This is the official list of the Mojaloop project contributors for this file.
Names of the original copyright holders (individuals or organizations)
should be listed with a '*' in the first column. People who have
contributed from an organization can be listed under the organization
that actually holds the copyright for their contributions (see the
Mojaloop Foundation for an example). Those individuals should have
their names indented and be marked with a '-'. Email address can be added
optionally within square brackets <email>.

* Mojaloop Foundation
- Name Surname <name.surname@mojaloop.io>

- Georgi Georgiev georgi.georgiev@modusbox.com
- Murthy Kakarlamudi murthy@modusbox.com
*****/

'use strict'

const NodeCache = require('node-cache')
const myCache = new NodeCache()
const Metrics = require('../lib/metrics')
const Logger = require('@mojaloop/central-services-shared').Logger

const extractUrls = (request) => {
  const urls = {}
  request.server.table()[0].table.filter(route => {
    return route.settings.id !== undefined &&
      Array.isArray(route.settings.tags) &&
      route.settings.tags.indexOf('api') >= 0
  }).forEach(route => {
    urls[route.settings.id] = `localhost${route.path.replace(/\{/g, ':').replace(/\}/g, '')}`
  })
  return urls
}

exports.metadata = function (request, h) {
  return h.response({
    directory: 'localhost',
    urls: extractUrls(request)
  }).code(200)
}

// Section about /participants
exports.putParticipantsByTypeId = function (request, h) {
  const histTimerEnd = Metrics.getHistogram(
    'sim_request',
    'Histogram for Simulator http operations',
    ['success', 'fsp', 'operation', 'source', 'destination']
  ).startTimer()

  // Logger.perf(`[cid=${request.payload.transferId}, fsp=${request.headers['fspiop-source']}, source=${request.headers['fspiop-source']}, dest=${request.headers['fspiop-destination']}] ~ Simulator::api::payer::putParticipantsByTypeId - START`)

  Logger.info(`IN PAYERFSP:: PUT /payerfsp/participants/${request.params.id}, PAYLOAD: [${JSON.stringify(request.payload)}]`)
  myCache.set(request.params.id, request.payload)

  // Logger.perf(`[cid=${request.payload.transferId}, fsp=${request.headers['fspiop-source']}, source=${request.headers['fspiop-source']}, dest=${request.headers['fspiop-destination']}] ~ Simulator::api::payer::putParticipantsByTypeId - END`)
  histTimerEnd({ success: true, fsp: 'payer', operation: 'putParticipantsByTypeId', source: request.headers['fspiop-source'], destination: request.headers['fspiop-destination'] })
  return h.response().code(200)
}

// Section about /parties
exports.putPartiesByTypeId = function (request, h) {
  const histTimerEnd = Metrics.getHistogram(
    'sim_request',
    'Histogram for Simulator http operations',
    ['success', 'fsp', 'operation', 'source', 'destination']
  ).startTimer()

  // Logger.perf(`[cid=${request.payload.transferId}, fsp=${request.headers['fspiop-source']}, source=${request.headers['fspiop-source']}, dest=${request.headers['fspiop-destination']}] ~ Simulator::api::payer::putPartiesByTypeId - START`)

  Logger.info(`IN PAYERFSP:: PUT /payerfsp/parties/${request.params.id}, PAYLOAD: [${JSON.stringify(request.payload)}]`)
  myCache.set(request.params.id, request.payload)

  // Logger.perf(`[cid=${request.payload.transferId}, fsp=${request.headers['fspiop-source']}, source=${request.headers['fspiop-source']}, dest=${request.headers['fspiop-destination']}] ~ Simulator::api::payer::putPartiesByTypeId - END`)
  histTimerEnd({ success: true, fsp: 'payer', operation: 'putPartiesByTypeId', source: request.headers['fspiop-source'], destination: request.headers['fspiop-destination'] })
  return h.response().code(200)
}

// Section about Quotes
exports.putQuotesById = function (request, h) {
  const histTimerEnd = Metrics.getHistogram(
    'sim_request',
    'Histogram for Simulator http operations',
    ['success', 'fsp', 'operation', 'source', 'destination']
  ).startTimer()

  // Logger.perf(`[cid=${request.payload.transferId}, fsp=${request.headers['fspiop-source']}, source=${request.headers['fspiop-source']}, dest=${request.headers['fspiop-destination']}] ~ Simulator::api::payer::putQuotesById - START`)

  Logger.info(`IN PAYERFSP:: PUT /payerfsp/quotes/${request.params.id}, PAYLOAD: [${JSON.stringify(request.payload)}]`)
  myCache.set(request.params.id, request.payload)

  // Logger.perf(`[cid=${request.payload.transferId}, fsp=${request.headers['fspiop-source']}, source=${request.headers['fspiop-source']}, dest=${request.headers['fspiop-destination']}] ~ Simulator::api::payer::putQuotesById - END`)
  histTimerEnd({ success: true, fsp: 'payer', operation: 'putQuotesById', source: request.headers['fspiop-source'], destination: request.headers['fspiop-destination'] })
  return h.response().code(200)
}

// Section about Transfers
exports.putTransfersById = function (request, h) {
  const histTimerEnd = Metrics.getHistogram(
    'sim_request',
    'Histogram for Simulator http operations',
    ['success', 'fsp', 'operation', 'source', 'destination']
  ).startTimer()

  // Logger.perf(`[cid=${request.payload.transferId}, fsp=${request.headers['fspiop-source']}, source=${request.headers['fspiop-source']}, dest=${request.headers['fspiop-destination']}] ~ Simulator::api::payer::putTransfersById - START`)

  Logger.info(`IN PAYERFSP:: PUT /payerfsp/transfers/${request.params.id}, PAYLOAD: [${JSON.stringify(request.payload)}]`)
  myCache.set(request.params.id, request.payload)

  // Logger.perf(`[cid=${request.payload.transferId}, fsp=${request.headers['fspiop-source']}, source=${request.headers['fspiop-source']}, dest=${request.headers['fspiop-destination']}] ~ Simulator::api::payer::putTransfersById - END`)
  histTimerEnd({ success: true, fsp: 'payer', operation: 'putTransfersById', source: request.headers['fspiop-source'], destination: request.headers['fspiop-destination'] })
  return h.response().code(200)
}

exports.putTransfersByIdError = function (request, h) {
  const histTimerEnd = Metrics.getHistogram(
    'sim_request',
    'Histogram for Simulator http operations',
    ['success', 'fsp', 'operation', 'source', 'destination']
  ).startTimer()

  // Logger.perf(`[cid=${request.payload.transferId}, fsp=${request.headers['fspiop-source']}, source=${request.headers['fspiop-source']}, dest=${request.headers['fspiop-destination']}] ~ Simulator::api::payer::putTransfersByIdError - START`)

  Logger.info(`IN PAYERFSP:: PUT /payerfsp/transfers/${request.params.id}/error, PAYLOAD: [${JSON.stringify(request.payload)}]`)
  myCache.set(request.params.id, request.payload)

  // Logger.perf(`[cid=${request.payload.transferId}, fsp=${request.headers['fspiop-source']}, source=${request.headers['fspiop-source']}, dest=${request.headers['fspiop-destination']}] ~ Simulator::api::payer::putTransfersByIdError - END`)
  histTimerEnd({ success: true, fsp: 'payer', operation: 'putTransfersByIdError', source: request.headers['fspiop-source'], destination: request.headers['fspiop-destination'] })
  return h.response().code(200)
}

exports.getcorrelationId = function (request, h) {
  const histTimerEnd = Metrics.getHistogram(
    'sim_request',
    'Histogram for Simulator http operations',
    ['success', 'fsp', 'operation', 'source', 'destination']
  ).startTimer()

  // Logger.perf(`[cid=${request.payload.transferId}, fsp=${request.headers['fspiop-source']}, source=${request.headers['fspiop-source']}, dest=${request.headers['fspiop-destination']}] ~ Simulator::api::payer::getcorrelationId - START`)

  Logger.info(`IN PAYERFSP:: PUT /payerfsp/correlationid/${request.params.id}/error, CACHE: [${JSON.stringify(myCache.get(request.params.id))}]`)

  // Logger.perf(`[cid=${request.payload.transferId}, fsp=${request.headers['fspiop-source']}, source=${request.headers['fspiop-source']}, dest=${request.headers['fspiop-destination']}] ~ Simulator::api::payer::getcorrelationId - END`)
  histTimerEnd({ success: true, fsp: 'payer', operation: 'getcorrelationId' })
  return h.response(myCache.get(request.params.id)).code(202)
}
