/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
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
 - Renjith Palamattom renjith@coil.com
 --------------
 ******/

'use strict'
const NodeCache = require('node-cache')
const myCache = new NodeCache()
const requests = new NodeCache()
const callbacks = new NodeCache()
const fetch = require('node-fetch')
const Logger = require('@mojaloop/central-services-shared').Logger
const Metrics = require('../lib/metrics')

const partiesEndpoint = process.env.PARTIES_ENDPOINT || 'http://localhost:8444'
const quotesEndpoint = process.env.QUOTES_ENDPOINT || 'http://localhost:8444'
const transfersEndpoint = process.env.TRANSFERS_ENDPOINT || 'http://localhost:8444'
const transfersFulfilResponseDisabled = (process.env.TRANSFERS_FULFIL_RESPONSE_DISABLED !== undefined && process.env.TRANSFERS_FULFIL_RESPONSE_DISABLED !== 'false')
const transfersFulfilment = process.env.TRANSFERS_FULFILMENT || 'XoSz1cL0tljJSCp_VtIYmPNw-zFUgGfbUqf69AagUzY'
const transfersCondition = process.env.TRANSFERS_CONDITION || 'HOr22-H3AfTDHrSkPjJtVPRdKouuMkDXTR4ejlQa8Ks'
const transfersIlpPacket = process.env.TRANSFERS_ILPPACKET || 'AQAAAAAAAADIEHByaXZhdGUucGF5ZWVmc3CCAiB7InRyYW5zYWN0aW9uSWQiOiIyZGY3NzRlMi1mMWRiLTRmZjctYTQ5NS0yZGRkMzdhZjdjMmMiLCJxdW90ZUlkIjoiMDNhNjA1NTAtNmYyZi00NTU2LThlMDQtMDcwM2UzOWI4N2ZmIiwicGF5ZWUiOnsicGFydHlJZEluZm8iOnsicGFydHlJZFR5cGUiOiJNU0lTRE4iLCJwYXJ0eUlkZW50aWZpZXIiOiIyNzcxMzgwMzkxMyIsImZzcElkIjoicGF5ZWVmc3AifSwicGVyc29uYWxJbmZvIjp7ImNvbXBsZXhOYW1lIjp7fX19LCJwYXllciI6eyJwYXJ0eUlkSW5mbyI6eyJwYXJ0eUlkVHlwZSI6Ik1TSVNETiIsInBhcnR5SWRlbnRpZmllciI6IjI3NzEzODAzOTExIiwiZnNwSWQiOiJwYXllcmZzcCJ9LCJwZXJzb25hbEluZm8iOnsiY29tcGxleE5hbWUiOnt9fX0sImFtb3VudCI6eyJjdXJyZW5jeSI6IlVTRCIsImFtb3VudCI6IjIwMCJ9LCJ0cmFuc2FjdGlvblR5cGUiOnsic2NlbmFyaW8iOiJERVBPU0lUIiwic3ViU2NlbmFyaW8iOiJERVBPU0lUIiwiaW5pdGlhdG9yIjoiUEFZRVIiLCJpbml0aWF0b3JUeXBlIjoiQ09OU1VNRVIiLCJyZWZ1bmRJbmZvIjp7fX19'

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

exports.metadata = function(request, h) {
    return h.response({
        directory: 'localhost',
        urls: extractUrls(request)
    }).code(200)
}

exports.postPartiesByTypeAndId = function(request, h) {
    const histTimerEnd = Metrics.getHistogram(
        'sim_request',
        'Histogram for Simulator http operations', ['success', 'fsp', 'operation', 'source', 'destination']
    ).startTimer()

    // Logger.perf(`[cid=${request.payload.transferId}, fsp=${request.headers['fspiop-source']}, source=${request.headers['fspiop-source']}, dest=${request.headers['fspiop-destination']}] ~ Simulator::api::payee::postPartiesByTypeAndId - START`)

    Logger.info('IN PAYEEFSP:: POST /payeefsp/parties/' + request.params.id, request.payload)
    myCache.set(request.params.id, request.payload)

    // Logger.perf(`[cid=${request.payload.transferId}, fsp=${request.headers['fspiop-source']}, source=${request.headers['fspiop-source']}, dest=${request.headers['fspiop-destination']}] ~ Simulator::api::payee::postPartiesByTypeAndId - END`)
    histTimerEnd({ success: true, fsp: 'payee', operation: 'postPartiesByTypeAndId', source: request.headers['fspiop-source'], destination: request.headers['fspiop-destination'] })
    return h.response().code(202)
}

exports.getPartiesByTypeAndId = function(req, h) {
    (async function() {
        const histTimerEnd = Metrics.getHistogram(
            'sim_request',
            'Histogram for Simulator http operations', ['success', 'fsp', 'operation', 'source', 'destination']
        ).startTimer()

        // Logger.perf(`[cid=${req.payload.transferId}, fsp=${req.headers['fspiop-source']}, source=${req.headers['fspiop-source']}, dest=${req.headers['fspiop-destination']}] ~ Simulator::api::payee::getPartiesByTypeAndId - START`)

        const metadata = `${req.method} ${req.path} ${req.params.id} `
        Logger.info((new Date().toISOString()), ['IN PAYEEFSP::'], `received: ${metadata}. `)
            //Saving Incoming request 
        let incomingRequest = {
            headers: req.headers
        }
        requests.set(req.params.id, incomingRequest)

        const url = partiesEndpoint + '/payeefsp/parties/MSISDN/' + req.params.id
        console.log('URL')
        console.log(url)
        try {
            const opts = {
                method: 'POST',
                headers: {
                    'Accept': 'application/vnd.interoperability.parties+json;version=1',
                    'Content-Type': 'application/vnd.interoperability.parties+json;version=1.0',
                    'FSPIOP-Source': 'payeefsp',
                    'FSPIOP-Destination': req.headers['fspiop-source'],
                    'Date': req.headers['date']
                },
                rejectUnauthorized: false,
                body: JSON.stringify(myCache.get(req.params.id))
            }
            Logger.info((new Date().toISOString()), `Executing PUT`, url)
            const res = await fetch(url, opts)
            Logger.info((new Date().toISOString()), 'response: ', res.status)
            if (!res.ok) {
                // TODO: how does one identify the failed response?
                throw new Error(`Failed to send. Result: ${res}`)
            }

            // Logger.perf(`[cid=${req.payload.transferId}, fsp=${req.headers['fspiop-source']}, source=${req.headers['fspiop-source']}, dest=${req.headers['fspiop-destination']}] ~ Simulator::api::payee::getPartiesByTypeAndId - END`)
            histTimerEnd({ success: true, fsp: 'payee', operation: 'getPartiesByTypeAndId', source: req.headers['fspiop-source'], destination: req.headers['fspiop-destination'] })
        } catch (err) {
            Logger.error(err)
                // Logger.perf(`[cid=${req.payload.transferId}, fsp=${req.headers['fspiop-source']}, source=${req.headers['fspiop-source']}, dest=${req.headers['fspiop-destination']}] ~ Simulator::api::payee::getPartiesByTypeAndId - ERROR`)
            histTimerEnd({ success: false, fsp: 'payee', operation: 'getPartiesByTypeAndId', source: req.headers['fspiop-source'], destination: req.headers['fspiop-destination'] })
        }
    })()

    return h.response().code(202)
}

exports.postQuotes = function(req, h) {
    //const responseFromFetch ='';
    //(async function () {
    const histTimerEnd = Metrics.getHistogram(
        'sim_request',
        'Histogram for Simulator http operations', ['success', 'fsp', 'operation', 'source', 'destination']
    ).startTimer()


    // Logger.perf(`[cid=${req.payload.transferId}, fsp=${req.headers['fspiop-source']}, source=${req.headers['fspiop-source']}, dest=${req.headers['fspiop-destination']}] ~ Simulator::api::payee::postQuotes - START`)

    const metadata = `${req.method} ${req.path}`
    console.log(' ****** ');
    console.log(`${metadata}`);
    console.log(' ****** ');
    Logger.info('PAYEE Request message::')
    Logger.info(`IN PAYEEFSP:: POST /payeefsp/quotes/, PAYLOAD: [${JSON.stringify(req.payload)}]`)
    console.log(' ****** ');
    const quotesRequest = req.payload

    let incomingRequest = {
        headers: req.headers,
        data: req.payload
    }
    requests.set(quotesRequest.quoteId, incomingRequest)
    const quotesResponsetopayer = {
        transferAmount: {
            amount: quotesRequest.amount.amount,
            currency: quotesRequest.amount.currency
        },

        payeeReceiveAmount: {
            amount: quotesRequest.amount.amount,
            currency: quotesRequest.amount.currency
        },
        payeeFspFee: {
            amount: quotesRequest.surcharge,
            currency: quotesRequest.amount.currency
        },
        payeeFspCommission: {
            amount: '1',
            currency: quotesRequest.amount.currency
        },
        expiration: new Date(new Date().getTime() + 10000),
        ilpPacket: transfersIlpPacket,
        condition: transfersCondition
    }

    Logger.info(`Quotes Response To PayerFSP:  [${JSON.stringify(quotesResponsetopayer)}]`)
    console.log(' ****** ');
    const quote_url1 = quotesEndpoint + '/payerfsp/quotes/' + quotesRequest.quoteId

    //responseFromFetch = 
    return fetch(quote_url1, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },

            method: "PUT",
            rejectUnauthorized: false,
            body: JSON.stringify(quotesResponsetopayer)
        })
        .then(function(res) {
            console.log('Quotes Response from PAYERFSP :: ')
            console.log(res);
            console.log(' ****** ');
            return res.json();
        })
        .then(function(res) {
            console.log('Response from PAYERFSP:: ')
            console.log(res);
            return res;
        })
        .catch(function(err) {
            console.log(`in PAYEE fetch error ${err}`);
        });
}

exports.postTransfers = async function(req, h) {
    const histTimerEnd = Metrics.getHistogram(
        'sim_request',
        'Histogram for Simulator http operations', ['success', 'fsp', 'operation', 'source', 'destination']
    ).startTimer()

    Logger.debug(`[cid=${req.payload.transferId}, fsp=${req.headers['fspiop-source']}, source=${req.headers['fspiop-source']}, dest=${req.headers['fspiop-destination']}] ~ Simulator::api::payee::postTransfers - START`)

    const metadata = `${req.method} ${req.path} ${req.payload.transferId}`
    Logger.info(`IN PAYEEFSP:: received: ${metadata}.`)

    if (!transfersFulfilResponseDisabled) {
        //Saving Incoming request 
        let incomingRequest = {
            headers: req.headers,
            data: req.payload
        }
        requests.set(req.payload.transferId, incomingRequest)

        const url = transfersEndpoint + '/transfers/' + req.payload.transferId
        try {
            const transfersResponse = {
                fulfilment: transfersFulfilment,
                completedTimestamp: new Date().toISOString(),
                transferState: 'COMMITTED'
            }

            const opts = {
                method: 'PUT',
                headers: {
                    'Accept': 'application/vnd.interoperability.transfers+json;version=1',
                    'Content-Type': 'application/vnd.interoperability.transfers+json;version=1.0',
                    'FSPIOP-Source': req.headers['fspiop-destination'],
                    'FSPIOP-Destination': req.headers['fspiop-source'],
                    'Date': req.headers['date']
                },
                rejectUnauthorized: false,
                body: JSON.stringify(transfersResponse)
            }
            console.log(' ****** ');
            Logger.info(`Executing PUT: [${url}], HEADERS: [${JSON.stringify(opts.headers)}], BODY: [${JSON.stringify(transfersResponse)}]`)
            console.log(' ****** ');
            const res = await fetch(url, opts)
            return res;
        } catch (err) {
            Logger.error(err)
                // Logger.perf(`[cid=${req.payload.transferId}, fsp=${req.headers['fspiop-source']}, source=${req.headers['fspiop-source']}, dest=${req.headers['fspiop-destination']}] ~ Simulator::api::payee::postTransfers - ERROR`)
            histTimerEnd({
                    success: false,
                    fsp: 'payee',
                    operation: 'postTransfers',
                    source: req.headers['fspiop-source'],
                    destination: req.headers['fspiop-destination']
                })
                // TODO: what if this fails? We need to log. What happens by default?
                // const url = await rq.createErrorUrl(db, req.path, requesterName);
                // TODO: review this error message
                // TODO: we should be able to throw an AppError somewhere, test whether the error
                // received in this handler is an AppError, then send the requester the correct
                // payload etc. based on the contents of that AppError.
                // rq.sendError(url, asyncResponses.serverError, rq.defaultHeaders(requesterName, 'participants'), {logger});
        }
    } else {
        // Logger.perf(`[cid=${req.payload.transferId}, fsp=${req.headers['fspiop-source']}, source=${req.headers['fspiop-source']}, dest=${req.headers['fspiop-destination']}] ~ Simulator::api::payee::postTransfers - END`)
        histTimerEnd({
            success: true,
            fsp: 'payee',
            operation: 'postTransfers',
            source: req.headers['fspiop-source'],
            destination: req.headers['fspiop-destination']
        })
    }

    return h.response().code(202)
}

exports.putTransfersById = function(request, h) {
    const histTimerEnd = Metrics.getHistogram(
            'sim_request',
            'Histogram for Simulator http operations', ['success', 'fsp', 'operation', 'source', 'destination']
        ).startTimer()
        // Logger.perf(`[cid=${request.payload.transferId}, fsp=${request.headers['fspiop-source']}, source=${request.headers['fspiop-source']}, dest=${request.headers['fspiop-destination']}] ~ Simulator::api::payee::putTransfersById - START`)

    Logger.info(`IN PAYEEFSP:: PUT /payeefsp/transfers/${request.params.id}, PAYLOAD: [${JSON.stringify(request.payload)}]`)

    myCache.set(request.params.id, request.payload)

    //Saving Incoming request 
    let incomingRequest = {
        headers: request.headers,
        data: request.payload
    }
    callbacks.set(request.params.id, incomingRequest)

    // Logger.perf(`[cid=${request.payload.transferId}, fsp=${request.headers['fspiop-source']}, source=${request.headers['fspiop-source']}, dest=${request.headers['fspiop-destination']}] ~ Simulator::api::payee::putTransfersById - END`)
    histTimerEnd({ success: true, fsp: 'payee', operation: 'putTransfersById', source: request.headers['fspiop-source'], destination: request.headers['fspiop-destination'] })
    return h.response().code(200)
}

exports.putTransfersByIdError = function(request, h) {
    const histTimerEnd = Metrics.getHistogram(
        'sim_request',
        'Histogram for Simulator http operations', ['success', 'fsp', 'operation', 'source', 'destination']
    ).startTimer()

    // Logger.perf(`[cid=${request.payload.transferId}, fsp=${request.headers['fspiop-source']}, source=${request.headers['fspiop-source']}, dest=${request.headers['fspiop-destination']}] ~ Simulator::api::payee::putTransfersByIdError - START`)

    Logger.info(`IN PAYEEFSP:: PUT /payeefsp/transfers/${request.params.id}/error, PAYLOAD: [${JSON.stringify(request.payload)}]`)
    myCache.set(request.params.id, request.payload)

    //Saving Incoming request 
    let incomingRequest = {
        headers: request.headers,
        data: request.payload
    }
    callbacks.set(request.params.id, incomingRequest)

    // Logger.perf(`[cid=${request.payload.transferId}, fsp=${request.headers['fspiop-source']}, source=${request.headers['fspiop-source']}, dest=${request.headers['fspiop-destination']}] ~ Simulator::api::payee::putTransfersByIdError - END`)
    histTimerEnd({ success: true, fsp: 'payee', operation: 'putTransfersByIdError', source: request.headers['fspiop-source'], destination: request.headers['fspiop-destination'] })
    return h.response().code(200)
}

exports.getcorrelationId = function(request, h) {
    const histTimerEnd = Metrics.getHistogram(
        'sim_request',
        'Histogram for Simulator http operations', ['success', 'fsp', 'operation', 'source', 'destination']
    ).startTimer()

    // Logger.perf(`[cid=${request.payload.transferId}, fsp=${request.headers['fspiop-source']}, source=${request.headers['fspiop-source']}, dest=${request.headers['fspiop-destination']}] ~ Simulator::api::payee::getcorrelationId - START`)

    Logger.info(`IN PAYEEFSP:: Final response for GET /payeefsp/correlationid/${request.params.id}, CACHE: [${JSON.stringify(myCache.get(request.params.id))}`)

    // Logger.perf(`[cid=${request.payload.transferId}, fsp=${request.headers['fspiop-source']}, source=${request.headers['fspiop-source']}, dest=${request.headers['fspiop-destination']}] ~ Simulator::api::payee::getcorrelationId - END`)
    histTimerEnd({ success: true, fsp: 'payee', operation: 'getcorrelationId' })
    return h.response(myCache.get(request.params.id)).code(202)
}

exports.getRequestById = function(request, h) {
    const histTimerEnd = Metrics.getHistogram(
        'sim_request',
        'Histogram for Simulator http operations', ['success', 'fsp', 'operation', 'source', 'destination']
    ).startTimer()

    Logger.info(`IN PAYEEFSP:: PUT /payeefsp/requests/${request.params.id}, CACHE: [${JSON.stringify(requests.get(request.params.id))}]`)
    const responseData = requests.get(request.params.id)
    requests.del(request.params.id)

    histTimerEnd({ success: true, fsp: 'payee', operation: 'getRequestById' })

    return h.response(responseData).code(200)
}

exports.getCallbackById = function(request, h) {
    const histTimerEnd = Metrics.getHistogram(
        'sim_request',
        'Histogram for Simulator http operations', ['success', 'fsp', 'operation', 'source', 'destination']
    ).startTimer()

    Logger.info(`IN PAYEEFSP:: PUT /payeefsp/callbacks/${request.params.id}, CACHE: [${JSON.stringify(callbacks.get(request.params.id))}]`)
    const responseData = callbacks.get(request.params.id)
    callbacks.del(request.params.id)

    histTimerEnd({ success: true, fsp: 'payee', operation: 'getCallbackById' })

    return h.response(responseData).code(200)
}