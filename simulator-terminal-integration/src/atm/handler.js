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
 - Renjith Palamattom  <renjith@coil.com>
 --------------
 ******/

'use strict'
const iso8583 = require('iso_8583');
const util = require('../utils/util');

const NodeCache = require('node-cache')
const myCache = new NodeCache()
const fetch = require('node-fetch')
const Logger = require('@mojaloop/central-services-shared').Logger
const Metrics = require('../lib/metrics')

const atmEndpoint = process.env.ATM_ENDPOINT || 'http://localhost:8444'
const partiesEndpoint = process.env.PARTIES_ENDPOINT || 'http://localhost:8444'
const quotesEndpoint = process.env.QUOTES_ENDPOINT || 'http://localhost:8444'
const transfersEndpoint = process.env.TRANSFERS_ENDPOINT || 'http://localhost:8444'
const transfersFulfilResponseDisabled = (process.env.TRANSFERS_FULFIL_RESPONSE_DISABLED !== undefined && process.env.TRANSFERS_FULFIL_RESPONSE_DISABLED !== 'false')
const transfersFulfilment = process.env.TRANSFERS_FULFILMENT || 'XoSz1cL0tljJSCp_VtIYmPNw-zFUgGfbUqf69AagUzY'
const transfersCondition = process.env.TRANSFERS_CONDITION || 'HOr22-H3AfTDHrSkPjJtVPRdKouuMkDXTR4ejlQa8Ks'
const transfersIlpPacket = process.env.TRANSFERS_ILPPACKET || 'AQAAAAAAAADIEHByaXZhdGUucGF5ZWVmc3CCAiB7InRyYW5zYWN0aW9uSWQiOiIyZGY3NzRlMi1mMWRiLTRmZjctYTQ5NS0yZGRkMzdhZjdjMmMiLCJxdW90ZUlkIjoiMDNhNjA1NTAtNmYyZi00NTU2LThlMDQtMDcwM2UzOWI4N2ZmIiwicGF5ZWUiOnsicGFydHlJZEluZm8iOnsicGFydHlJZFR5cGUiOiJNU0lTRE4iLCJwYXJ0eUlkZW50aWZpZXIiOiIyNzcxMzgwMzkxMyIsImZzcElkIjoicGF5ZWVmc3AifSwicGVyc29uYWxJbmZvIjp7ImNvbXBsZXhOYW1lIjp7fX19LCJwYXllciI6eyJwYXJ0eUlkSW5mbyI6eyJwYXJ0eUlkVHlwZSI6Ik1TSVNETiIsInBhcnR5SWRlbnRpZmllciI6IjI3NzEzODAzOTExIiwiZnNwSWQiOiJwYXllcmZzcCJ9LCJwZXJzb25hbEluZm8iOnsiY29tcGxleE5hbWUiOnt9fX0sImFtb3VudCI6eyJjdXJyZW5jeSI6IlVTRCIsImFtb3VudCI6IjIwMCJ9LCJ0cmFuc2FjdGlvblR5cGUiOnsic2NlbmFyaW8iOiJERVBPU0lUIiwic3ViU2NlbmFyaW8iOiJERVBPU0lUIiwiaW5pdGlhdG9yIjoiUEFZRVIiLCJpbml0aWF0b3JUeXBlIjoiQ09OU1VNRVIiLCJyZWZ1bmRJbmZvIjp7fX19'

exports.postInfo = async function(req, h) {

    console.log('Received Request From ATM : ')
    console.log(req.payload)

    let F061 = req.payload.F061
    let F062 = req.payload.F062
    let F041 = req.payload.F041
    let F042 = req.payload.F042
    let F043 = req.payload.F043
    let F120 = req.payload.F120
    let F022 = req.payload.F022
    let F067 = req.payload.F067
    let F100 = req.payload.F100
    let F003 = req.payload.F003
    let F025 = req.payload.F025
    let F004 = req.payload.F004
    let F049 = req.payload.F049
    let F052 = req.payload.F052
    let F011 = req.payload.F011
    let F012 = req.payload.F012
    let MsgType = req.payload.MsgType
    let F013 = req.payload.F013
    let F035 = req.payload.F035
    let F039 = req.payload.F039
    let F018 = req.payload.F018
    let F102 = req.payload.F102
    let F103 = req.payload.F103

    //console.log(`F004 $Number(F004)``);
    if (F049 == 356) {
        F049 = 'INR'
    } else if (F049 == 840) {
        F049 = 'USD'
    } else if (F049 == 710) {
        F049 = 'ZAR'
    }

    let uuid = util.guid(F011);
    let request = {
        "transferId": uuid,
        "payee": {
            "partyIdInfo": {
                "partyIdType": "MSISDN",
                "partyIdentifier": F041
            },
        },
        "payer": {
            "partyIdType": "MSISDN",
            "partyIdentifier": F102
        },
        "amount": {
            "currency": F049,
            "amount": F004
        },
        "transactionType": {
            "scenario": "WITHDRAWAL",
            "initiator": "PAYEE",
            "initiatorType": "CONSUMER"
        },
        "authenticationType": {
            "Authentication": "OTP"
        },
        "expiration": new Date(new Date().getTime() + 10000)
    }

    let quote_request = {
        "quoteId": "7c23e80c-d078-4077-8263-2c047876fcf6",
        "transactionId": uuid,
        "payee": {
            "partyIdInfo": {
                "partyIdType": "IBAN",
                "partyIdentifier": F041,
                "fspId": "MobileMoney"
            }
        },
        "payer": {
            "personalInfo": {
                "complexName": {
                    "firstName": "Mats",
                    "lastName": "Hagman"
                }
            },
            "partyIdInfo": {
                "partyIdType": "MSISDN",
                "partyIdentifier": F102,
                "fspId": "BankNrOne"
            }
        },
        "amountType": "RECEIVE",
        "amount": {
            "amount": F004,
            "currency": F049
        },
        "transactionType": {
            "scenario": "TRANSFER",
            "initiator": "PAYER",
            "initiatorType": "CONSUMER"
        },
        "note": "From Mats",
        "expiration": new Date(new Date().getTime() + 10000)
    }

    const otp_request = {
        "phoneNo": F102,
        "inputOtp": F103
    }

    var quoteAmount = '';
    const quote_url = quotesEndpoint + '/payeefsp/quotes'
    const otp_url = atmEndpoint + '/validateOtp';
    const payee_transfers_url = atmEndpoint + '/payeefsp/transfers'

    return fetch(quote_url, {
            headers: {
                'Accept': 'application/vnd.interoperability.quotes+json;version=1',
                'Content-Type': 'application/vnd.interoperability.quotes+json;version=1.0',
                'FSPIOP-Source': 'atm',
                'FSPIOP-Destination': 'payeefsp',
                'Date': new Date().toISOString()
            },
            method: "POST",
            body: JSON.stringify(quote_request)
        })
        .then(function(res) {
            console.log('Qoute Response at ATM handler:')
            console.log(res)
            console.log(' ****** ');
            return res.json();
        })
        .then(function(res) {
            //console.log('fetch res 2 quote ATM handler')
            //console.log(`JIJIJIJIJI+${res}JIJIJIJI`)
            quoteAmount = res.quoteAmount.amount;
            console.log(' ****** ');
            console.log(`QuoteAmount:  ${quoteAmount}`)
            console.log(' ****** ');
            return fetch(otp_url, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: "POST",
                    body: JSON.stringify(otp_request)
                })
                .then(function(res) {
                    console.log('Response (json) from OTP handler')
                    console.log(res)
                    return res.json();
                })
                .then(function(res) {
                    console.log('Response from OTP handler')
                    console.log(res)
                    var res1;
                    if (res.response == 'OTP invalid') {

                        F103 = '01';
                        request.messageType = "0110";
                        request.authenticationType.Authentication = F103;

                        request.expiration = new Date(new Date().getTime() + 20000)
                        return request;

                        res1 = res.response;
                        return res.response;

                    } else {
                        //perform transaction to payeefsp/transfers
                        F103 = '00';
                        F004 = quoteAmount;
                        console.log(`Quote Amt: ${quoteAmount}`)
                        return fetch(payee_transfers_url, {
                                headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json'
                                },
                                method: "POST",
                                body: JSON.stringify(request)
                            })
                            .then(function(res) {
                                console.log('Response from payee_transfers to ATM handler')
                                console.log(res)
                                request.messageType = "0110";
                                request.authenticationType.Authentication = F103;
                                request.amount.amount = quoteAmount

                                request.expiration = new Date(new Date().getTime() + 20000)
                                return request
                            })
                            .catch(function(err) {
                                console.log(`fetch err payee_transfers ATM handler ${err}`)
                            })
                    }
                    return res1;
                })
                .catch(function(err) {
                    console.log(`OTP ATM handler error ${err}`)
                });
            //}
            //return h.response().code(202)
        });
}

exports.getQuote = async function(req, h) {
    console.log('Received Request From ATM : ')
    console.log(req.payload)
    const quote_url = quotesEndpoint + '/payeefsp/quotes'
    let F061 = req.payload.F061
    let F062 = req.payload.F062
    let F041 = req.payload.F041
    let F042 = req.payload.F042
    let F043 = req.payload.F043
    let F120 = req.payload.F120
    let F022 = req.payload.F022
    let F067 = req.payload.F067
    let F100 = req.payload.F100
    let F003 = req.payload.F003
    let F025 = req.payload.F025
    let F004 = req.payload.F004
    let F049 = req.payload.F049
    let F052 = req.payload.F052
    let F011 = req.payload.F011
    let F012 = req.payload.F012
    let MsgType = req.payload.MsgType
    let F013 = req.payload.F013
    let F035 = req.payload.F035
    let F039 = req.payload.F039
    let F018 = req.payload.F018
    let F102 = req.payload.F102
    let F103 = req.payload.F103

    if (F049 == 356) {
        F049 = 'INR'
    } else if (F049 == 840) {
        F049 = 'USD'
    } else if (F049 == 710) {
        F049 = 'ZAR'
    }

    let uuid = util.guid(F011);
    let quote_request = {
        "quoteId": "7c23e80c-d078-4077-8263-2c047876fcf6",
        "transferId": uuid,
        "payee": {
            "partyIdInfo": {
                "partyIdType": "MSISDN",
                "partyIdentifier": F041
            },

        },
        "payer": {
            "partyIdType": "MSISDN",
            "partyIdentifier": F102
        },
        "amount": {
            "currency": F049,
            "amount": F004
        },
        "transactionType": {
            "scenario": "WITHDRAWAL",
            "initiator": "PAYEE",
            "initiatorType": "CONSUMER"
        },
        "authenticationType": {
            "Authentication": F103
        },
        "expiration": "2016-05-24T08:38:08.699-04:00"
    }

    return await fetch(quote_url, {
            headers: {
                'Accept': 'application/vnd.interoperability.quotes+json;version=1',
                'Content-Type': 'application/vnd.interoperability.quotes+json;version=1.0',
                'FSPIOP-Source': 'atm',
                'FSPIOP-Destination': 'payeefsp',
                'Date': new Date().toISOString()
            },
            method: "POST",
            body: JSON.stringify(quote_request)
        })
        .then(function(res) {
            console.log('fetch res msgtyoe0100')
            console.log(res)
                //return res;
            return res.json();
        })
        .then(function(res) {
            console.log('fetch res msgtyoe0100')
            console.log(res)
                //return res.json();
            return res;
        })
        .catch(function(res) {
            console.log(`in ATM fetch error ${err}`)
        });
}

exports.posToILP = async function(req, h) {
    console.log('Received Request From ATM : ')
    console.log(req.payload)

    let F061 = req.payload.F061
    let F062 = req.payload.F062
    let F041 = req.payload.F041
    let F042 = req.payload.F042
    let F043 = req.payload.F043
    let F120 = req.payload.F120
    let F022 = req.payload.F022
    let F067 = req.payload.F067
    let F100 = req.payload.F100
    let F003 = req.payload.F003
    let F025 = req.payload.F025
    let F004 = req.payload.F004
    let F049 = req.payload.F049
    let F052 = req.payload.F052
    let F011 = req.payload.F011
    let F012 = req.payload.F012
    let MsgType = req.payload.MsgType
    let F013 = req.payload.F013
    let F035 = req.payload.F035
    let F039 = req.payload.F039
    let F018 = req.payload.F018
    let F102 = req.payload.F102
    let F103 = req.payload.F103

    if (F049 == 356) {
        F049 = 'INR'
    } else if (F049 == 840) {
        F049 = 'USD'
    } else if (F049 == 710) {
        F049 = 'ZAR'
    }

    let uuid = util.guid(F011);

    let request = {
        "transferId": uuid,
        "payee": {
            "partyIdInfo": {
                "partyIdType": "MSISDN",
                "partyIdentifier": F041
            },

        },
        "payer": {
            "partyIdType": "MSISDN",
            "partyIdentifier": F102
        },
        "amount": {
            "currency": F049,
            "amount": F004
        },
        "transactionType": {
            "scenario": "WITHDRAWAL",
            "initiator": "PAYEE",
            "initiatorType": "CONSUMER"
        },
        "authenticationType": {
            "Authentication": F103

        },
        "expiration": "2016-05-24T08:38:08.699-04:00"
    }

    const otp_url = host + '/validateOtp';
    const otp_request = {
            "phoneNo": F102,
            "inputOtp": F103
        }
        //goes to otp for validation
 
    return await fetch(otp_url, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(otp_request)
        })
        .then(function(res) {
            console.log('fetch res1')
            console.log(res)
            return res.json();
        })
        .then(function(res) {
            console.log('fetch res2')
            console.log(res)
            var res1;
            if (res.response == 'OTP invalid') {
                res1 = res.response;
                //return res.response;
            } else {
                const payee_url = host + '/payeefsp/transfers';
                res1 = fetch(payee_url, {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        method: "POST",
                        body: JSON.stringify(otp_request)
                    })
                    .then(function(res) {
                        console.log('fetch res1 payeefsp')
                        console.log(res)
                            //return res.json();
                        return 'Approved';
                    })
            }
            return res1;
        })

    .catch(function(res) {
        console.log(res)
        return res;
    });

    console.log(hi)

    return h.response().code(202)
}