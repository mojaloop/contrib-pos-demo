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
- Renjith Palamattom renjith@coil.com
*****/

'use strict'

const NodeCache = require('node-cache')
const fetch = require('node-fetch');
const myCache = new NodeCache()
const requests = new NodeCache()
const callbacks = new NodeCache()
const Metrics = require('../lib/metrics')
const Logger = require('@mojaloop/central-services-shared').Logger
const atmEndpoint = process.env.ATM_ENDPOINT || 'http://localhost:8444'
const Util = require('../utils/util')
const db = require('./db/db');
const Const = require('../utils/constant');
const collection = "otp";


function User(createdAt, expiresAt, phoneNo, otp) {
    this.createdAt = createdAt;
    this.expiresAt = expiresAt;
    this.phoneNo = phoneNo;
    this.otp = otp;

}

function findUserQuery(phoneNo) {
    return new Promise((resolve, reject) => {

        return db.getDB().collection(collection).find({ "phoneNo": phoneNo }).sort({ $natural: -1 }).limit(1)
            .toArray(function (err, doc) {
                if (err) {                // handle error
                    console.log(err);
                    console.log('error from db query')
                    return reject(err);

                }
                if (doc != null) {
                    var result = doc[0] || ('no user')
                    return resolve(result);



                }
                else {
                    //console.log('Phone number does not exist in db')
                    return resolve('no user');
                }

            })



        //});
    });

}

exports.sendOtp2 = async function (request, h) {
    const input = request.params;
    console.log(input);
    const phoneNo = input.phoneNo;
    console.log(phoneNo);
    const checkPayerUrl = `${atmEndpoint}/payerfsp/correlationid/${+phoneNo}`
    return fetch(checkPayerUrl, {
        method: 'GET'
    })
        .then(response => response.text())
        .then(text => {
            try {
                const data = JSON.parse(text);
                console.log(data)
                console.log('valid json')
                return new Promise((resolve, reject) => {
                    var userPromise = findUserQuery(phoneNo);
                    userPromise.then(
                        function (result) {
                            if (result != 'no user') {
                                console.log('Phone number exists in db');
                                console.log(result);
                                var currentTime = new Date();
                                console.log(`currentTime: ${currentTime.toISOString()}`)

                                var otpToSend;
                                switch (isOTPValid(currentTime, result.expiresAt)) {
                                    case (Const.OTP_VALID):
                                        console.log('withinTimeLimit; OTP valid')
                                        var user_id = result._id;
                                        otpToSend = generateOTPa(phoneNo, user_id);
                                        break;
                                    case (Const.OTP_EXPIRED):
                                        console.log('outside time limit; OTP expired');
                                        var user_id = result._id;
                                        console.log(`user_id: ${user_id}`);
                                        otpToSend = generateOTPa(phoneNo, user_id);
                                        break;
                                }
                                return resolve(otpToSend);
                            }
                            var otp = generateOTPa(phoneNo, null);
                            return resolve(otp);
                        },
                        function (error) {
                            return reject(error);

                        }
                    );
                });
            } catch (err) {
                console.log('invalid json')
                return h.response('not a participant in PAYERFSP').code(202)
                console.log(err)
            }
        })
        .catch(err => console.log(err))
}

function updateOtpQuery(_id, user) {
    return new Promise((resolve, reject) => {
        return db.getDB().collection(collection).findOneAndUpdate(
            { "_id": db.getPrimaryKey(_id) },
            {
                $set:
                {
                    "createdAt": user.createdAt,
                    "expiresAt": user.expiresAt,
                    "phoneNo": user.phoneNo,
                    "otp": user.otp
                }
            }, function (err, result) {
                if (err) {
                    console.log(`error updating otp for phoneNo: ${user.phoneNo}`);
                    return reject(err);
                }
                else {
                    console.log(`successfully updated otp for phoneNo: ${user.phoneNo}`)
                    console.log(`new otp: ${user.otp}`)
                    return resolve(user.otp);
                }
            }
        );
    });

}

function insertOtpQuery(user) {
    return new Promise((resolve, reject) => {
        return db.getDB().collection(collection).insertOne({
            //"createdAt": new Date(),
            "createdAt": user.createdAt,
            "expiresAt": user.expiresAt,
            "phoneNo": user.phoneNo,
            "otp": user.otp
            //both numbers before
        }, function (err, res) {
            if (err) {
                console.log('error inserting OTP data')
                return reject(err);
            }
            else {
                console.log('successfully inserted OTP data');
                console.log(res.ops[0]);
                return resolve(user.otp);
                //return otp;
            }
        });
    });
}

function validateOtpQuery(phoneNo, inputOtp) {
    return new Promise((resolve, reject) => {
        db.getDB().collection(collection).find({ "phoneNo": phoneNo }).sort({ $natural: -1 }).limit(1)
            .toArray(function (err, doc) {
                if (err) {
                    // handle error
                    console.log(err);
                    console.log('error from db query')
                    return reject(err);
                }
                if (doc != null) {
                    if (!doc[0]) {
                        //handle case
                        console.log('!doc[0]')
                        console.log('------')
                        return reject('no phno');
                    } else {
                        //handle case
                        console.log('Phone no exists');
                        console.log(doc[0]);
                        console.log(`inputOtp: ${inputOtp}`);
                        if (doc[0].otp == inputOtp) {
                            var currentTime = new Date();
                            var body;
                            console.log(`currentTime: ${currentTime.toISOString()}`)
                            switch (isOTPValid(currentTime, doc[0].expiresAt)) {
                                case Const.OTP_VALID:
                                    console.log('OTP verified')
                                    body = JSON.stringify({ status: Const.OTP_VERIFIED, response: "OTP verified" });
                                    console.log('------')
                                    break;
                                case Const.OTP_EXPIRED:
                                    console.log('OTP expired');
                                    console.log('------')
                                    body = JSON.stringify({ status: Const.OTP_EXPIRED, response: "OTP expired!!" });
                            }
                        }
                        else {
                            console.log('OTP invalid!!')
                            console.log('------')
                            body = JSON.stringify({ status: Const.OTP_INVALID, response: "OTP invalid" });
                        }
                        return resolve(body);
                    }
                }
                else {
                    console.log('array null')
                    console.log('------')
                }
            });
    });
}

function generateOTPa(phoneNoa, _id) {
    const phoneNo = phoneNoa.toString();
    console.log(`Generating OTP for ${phoneNo}`);
    const otp = Util.generateOTP(phoneNo).toString();
    var createdAt = new Date();
    var expiresAt = Util.addMinutes(createdAt, 10);
    var user = new User(createdAt, expiresAt, phoneNo, otp);

    if (_id != null) {
        return updateOtpQuery(_id, user);
    }
    else {
        return insertOtpQuery(user);
    }
}

function isOTPValid(currentTime, expiresAtTime) {
    if (currentTime < expiresAtTime)
        return Const.OTP_VALID;
    else return Const.OTP_EXPIRED;
}

exports.validateOtp = function (request, h) {
    const input = request.payload;
    const phoneNo = input.phoneNo;
    const inputOtp = input.inputOtp;

    Logger.info('In validateotp(). Connected to db ' + db.dbname);
    console.log(`input phoneNo ${phoneNo}`)
    console.log(`inputOtp ${inputOtp}`)
    return validateOtpQuery(phoneNo, inputOtp)
        .catch(err => {
            console.log('caught error')
            console.log(err)
            return new Promise('otp error')
        });
}
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
        'Histogram for Simulator http operations', ['success', 'fsp', 'operation', 'source', 'destination']
    ).startTimer()

    // Logger.perf(`[cid=${request.payload.transferId}, fsp=${request.headers['fspiop-source']}, source=${request.headers['fspiop-source']}, dest=${request.headers['fspiop-destination']}] ~ Simulator::api::payer::putParticipantsByTypeId - START`)

    Logger.info(`IN PAYERFSP:: PUT /payerfsp/participants/${request.params.id}, PAYLOAD: [${JSON.stringify(request.payload)}]`)

    //Saving Incoming request 
    let incomingRequest = {
        headers: request.headers,
        data: request.payload
    }
    callbacks.set(request.params.id, incomingRequest)

    myCache.set(request.params.id, request.payload)
    histTimerEnd({ success: true, fsp: 'payer', operation: 'putParticipantsByTypeId', source: request.headers['fspiop-source'], destination: request.headers['fspiop-destination'] })
    return h.response().code(200)
}

// Section about /parties
exports.putPartiesByTypeId = function (request, h) {
    const histTimerEnd = Metrics.getHistogram(
        'sim_request',
        'Histogram for Simulator http operations', ['success', 'fsp', 'operation', 'source', 'destination']
    ).startTimer()
    Logger.info(`IN PAYERFSP:: PUT /payerfsp/parties/${request.params.id}, PAYLOAD: [${JSON.stringify(request.payload)}]`)

    //Saving Incoming request 
    let incomingRequest = {
        headers: request.headers,
        data: request.payload
    }
    callbacks.set(request.params.id, incomingRequest)
    myCache.set(request.params.id, request.payload)
    histTimerEnd({ success: true, fsp: 'payer', operation: 'putPartiesByTypeId', source: request.headers['fspiop-source'], destination: request.headers['fspiop-destination'] })
    return h.response().code(200)
}
// Section about Quotes
exports.putQuotesById = function (request, h) {
    const histTimerEnd = Metrics.getHistogram(
        'sim_request',
        'Histogram for Simulator http operations', ['success', 'fsp', 'operation', 'source', 'destination']
    ).startTimer()
    console.log('***PAYERFSP***')
    Logger.info(`IN PAYERFSP:: PUT /payerfsp/quotes/${request.params.id}, PAYLOAD: [${JSON.stringify(request.payload)}]`)
    //Saving Incoming request 
    let incomingRequest = {
        headers: request.headers,
        data: request.payload
    }
    callbacks.set(request.params.id, incomingRequest)
    const quotesResponsefrompayer = request.payload
    const payerecieveamount = quotesResponsefrompayer.transferAmount.amount
    let charge = Number(payerecieveamount)/100;
    quotesResponsefrompayer.payeeFspFee.amount = charge

   var quoteAmount = Number(quotesResponsefrompayer.transferAmount.amount) + quotesResponsefrompayer.payeeFspFee.amount + Number(quotesResponsefrompayer.payeeFspCommission.amount);

    quoteAmount = quoteAmount.toFixed(2);
    quoteAmount = quoteAmount
    const quotesResponsetoatmendpoint = {
        payeeReceiveAmount: {
            amount: payerecieveamount,
            currency: quotesResponsefrompayer.transferAmount.currency
        },
        quoteAmount: {
            amount: quoteAmount,
            currency: quotesResponsefrompayer.transferAmount.currency
        },
       expiration: new Date(new Date().getTime() + 10000)
    }
    myCache.set(request.params.id, request.payload)

   histTimerEnd({ success: true, fsp: 'payer', operation: 'putQuotesById', source: request.headers['fspiop-source'], destination: request.headers['fspiop-destination'] })

   console.log(`Quotes Response IN PAYERFSP: [${JSON.stringify(quotesResponsetoatmendpoint)}]`);
   console.log(' ****** ');
   return h.response(JSON.stringify(quotesResponsetoatmendpoint)).code(200)
}

// Section about Transfers
exports.putTransfersById = function (request, h) {
    const histTimerEnd = Metrics.getHistogram(
        'sim_request',
        'Histogram for Simulator http operations', ['success', 'fsp', 'operation', 'source', 'destination']
    ).startTimer()

    Logger.info(`IN PAYERFSP:: PUT /payerfsp/transfers/${request.params.id}, PAYLOAD: [${JSON.stringify(request.payload)}]`)

    //Saving Incoming request 
    let incomingRequest = {
        headers: request.headers,
        data: request.payload
    }
    callbacks.set(request.params.id, incomingRequest)

    myCache.set(request.params.id, request.payload)
    histTimerEnd({ success: true, fsp: 'payer', operation: 'putTransfersById', source: request.headers['fspiop-source'], destination: request.headers['fspiop-destination'] })
    return h.response().code(200)
}

exports.putTransfersByIdError = function (request, h) {
    const histTimerEnd = Metrics.getHistogram(
        'sim_request',
        'Histogram for Simulator http operations', ['success', 'fsp', 'operation', 'source', 'destination']
    ).startTimer()

    Logger.info(`IN PAYERFSP:: PUT /payerfsp/transfers/${request.params.id}/error, PAYLOAD: [${JSON.stringify(request.payload)}]`)
    myCache.set(request.params.id, request.payload)

    //Saving Incoming request 
    let incomingRequest = {
        headers: request.headers,
        data: request.payload
    }
    callbacks.set(request.params.id, incomingRequest)

    histTimerEnd({ success: true, fsp: 'payer', operation: 'putTransfersByIdError', source: request.headers['fspiop-source'], destination: request.headers['fspiop-destination'] })
    return h.response().code(200)
}

exports.getcorrelationId = function (request, h) {
 
    const histTimerEnd = Metrics.getHistogram(
        'sim_request',
        'Histogram for Simulator http operations', ['success', 'fsp', 'operation', 'source', 'destination']
    ).startTimer()

    Logger.info(`IN PAYERFSP:: PUT /payerfsp/correlationid/${request.params.id}/error, CACHE: [${JSON.stringify(myCache.get(request.params.id))}]`)
    histTimerEnd({ success: true, fsp: 'payer', operation: 'getcorrelationId' })
    console.log(`returning:${JSON.stringify(myCache.get(request.params.id))}`)
    return h.response(JSON.stringify(myCache.get(request.params.id))).code(202)
}

exports.getRequestById = function (request, h) {
    const histTimerEnd = Metrics.getHistogram(
        'sim_request',
        'Histogram for Simulator http operations', ['success', 'fsp', 'operation', 'source', 'destination']
    ).startTimer()

    Logger.info(`IN PAYERFSP:: PUT /payerfsp/requests/${request.params.id}, CACHE: [${JSON.stringify(requests.get(request.params.id))}]`)
    const responseData = requests.get(request.params.id)
    requests.del(request.params.id)

    histTimerEnd({ success: true, fsp: 'payer', operation: 'getRequestById' })

    return h.response(responseData).code(200)
}

exports.getCallbackById = function (request, h) {
    const histTimerEnd = Metrics.getHistogram(
        'sim_request',
        'Histogram for Simulator http operations', ['success', 'fsp', 'operation', 'source', 'destination']
    ).startTimer()

    Logger.info(`IN PAYERFSP:: PUT /payerfsp/callbacks/${request.params.id}, CACHE: [${JSON.stringify(callbacks.get(request.params.id))}]`)
    const responseData = callbacks.get(request.params.id)
    callbacks.del(request.params.id)

    histTimerEnd({ success: true, fsp: 'payer', operation: 'getCallbackById' })

    return h.response(responseData).code(200)
}