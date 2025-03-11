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
 - Renjith Palamattom  <renjith@coil.com>
*****/

'use strict'
const iso8583 = require('iso_8583');
const Utils = require('../utils/util');

const NodeCache = require('node-cache')
const myCache = new NodeCache()
const fetch = require('node-fetch')
const Logger = require('@mojaloop/central-services-shared').Logger
const Metrics = require('../lib/metrics')

//const hostname = process.env.HOSTNAME;
const host = 'http://localhost:8444'
const partiesEndpoint = process.env.PARTIES_ENDPOINT || 'http://localhost:8444'
const quotesEndpoint = process.env.QUOTES_ENDPOINT || 'http://localhost:8444'
const transfersEndpoint = process.env.TRANSFERS_ENDPOINT || 'http://localhost:8444'
const transfersFulfilResponseDisabled = (process.env.TRANSFERS_FULFIL_RESPONSE_DISABLED !== undefined && process.env.TRANSFERS_FULFIL_RESPONSE_DISABLED !== 'false')
const transfersFulfilment = process.env.TRANSFERS_FULFILMENT || 'XoSz1cL0tljJSCp_VtIYmPNw-zFUgGfbUqf69AagUzY'
const transfersCondition = process.env.TRANSFERS_CONDITION || 'HOr22-H3AfTDHrSkPjJtVPRdKouuMkDXTR4ejlQa8Ks'
const transfersIlpPacket = process.env.TRANSFERS_ILPPACKET || 'AQAAAAAAAADIEHByaXZhdGUucGF5ZWVmc3CCAiB7InRyYW5zYWN0aW9uSWQiOiIyZGY3NzRlMi1mMWRiLTRmZjctYTQ5NS0yZGRkMzdhZjdjMmMiLCJxdW90ZUlkIjoiMDNhNjA1NTAtNmYyZi00NTU2LThlMDQtMDcwM2UzOWI4N2ZmIiwicGF5ZWUiOnsicGFydHlJZEluZm8iOnsicGFydHlJZFR5cGUiOiJNU0lTRE4iLCJwYXJ0eUlkZW50aWZpZXIiOiIyNzcxMzgwMzkxMyIsImZzcElkIjoicGF5ZWVmc3AifSwicGVyc29uYWxJbmZvIjp7ImNvbXBsZXhOYW1lIjp7fX19LCJwYXllciI6eyJwYXJ0eUlkSW5mbyI6eyJwYXJ0eUlkVHlwZSI6Ik1TSVNETiIsInBhcnR5SWRlbnRpZmllciI6IjI3NzEzODAzOTExIiwiZnNwSWQiOiJwYXllcmZzcCJ9LCJwZXJzb25hbEluZm8iOnsiY29tcGxleE5hbWUiOnt9fX0sImFtb3VudCI6eyJjdXJyZW5jeSI6IlVTRCIsImFtb3VudCI6IjIwMCJ9LCJ0cmFuc2FjdGlvblR5cGUiOnsic2NlbmFyaW8iOiJERVBPU0lUIiwic3ViU2NlbmFyaW8iOiJERVBPU0lUIiwiaW5pdGlhdG9yIjoiUEFZRVIiLCJpbml0aWF0b3JUeXBlIjoiQ09OU1VNRVIiLCJyZWZ1bmRJbmZvIjp7fX19'

exports.posToILP = async function(req, h) {
    let phoneNo = req.payload.phoneNo;
    let amount = req.payload.amount;
    let geoCode = req.payload.geocode;
    let quote = req.payload.quote;
    let inputOtp = req.payload.inputOtp;
    // let quote = req.payload.quote;
    console.log(" ****** ")
    console.log(`phoneNo:  ${phoneNo}`)
    console.log(`amount requested: ${amount}`)
    //console.log(`geoCode ${geoCode}`)
    //console.log(`quote ${quote}`)
    console.log(`inputOtp: ${inputOtp}`)
    console.log(" ****** ")

    let uuid = Utils.guidRandom();
    //"transactionRequestId"
    let payee_request = {
        "transferId": uuid,
        "payee": {
            "partyIdInfo": {
                "partyIdType": "MSISDN",
                "partyIdentifier": "kkkk"
            },
        },
        "payer": {
            "partyIdType": "MSISDN",
            "partyIdentifier": phoneNo
        },
        "amount": {
            "currency": "INR",
            "amount": quote
        },
        "transactionType": {
            "scenario": "PAYMENT",
            "initiator": "PAYER",
            "initiatorType": "CONSUMER"
        },
        "geoCode": geoCode,
        "authenticationType": {
            "Authentication": "OTP"
        },
        "expiration": "2016-05-24T08:38:08.699-04:00"
    }


    const otp_url = host + '/validateOtp';
    const otp_request = {
            "phoneNo": phoneNo,
            "inputOtp": inputOtp
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
            console.log('Response from OTPValidate 1')
            console.log(res)
            console.log(" ****** ")
            return res.json();
        })
        .then(function(res) {
            console.log('Response from OTPValidate 2')

            var res1;
            if (res.response == 'OTP invalid') {
                res1 = res.response;

            } else {
                const payee_url = host + '/payeefsp/transfers';
                res1 = fetch(payee_url, {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        method: "POST",
                        body: JSON.stringify(payee_request)
                    })
                    .then(function(res) {
                        console.log('Response from Payeefsp for POS Txn...')
                        console.log(res);
                        console.log(" ****** ")
                        return 'Approved';
                    })
            }
            return res1;
            console.log(res1)
            console.log(" ****** ")
        })
        
    .catch(function(res) {
        return res;
    });

    console.log(hi)
    return h.response().code(202)
}

exports.getQuote = async function(req, h) {
    const phoneNo = req.payload.phoneNo;
    const amount = req.payload.amount;
    const sl_no = req.payload.sl_no;
    let uuid = Utils.guidRandom();

    let test_req = {
        "quoteId": "7c23e80c-d078-4077-8263-2c047876fcf6",
        "transactionId": uuid,
        "payee": {
            "partyIdInfo": {
                "partyIdType": "MSISDN",
                "partyIdentifier": phoneNo,
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
                "partyIdentifier": sl_no,
                "fspId": "BankNrOne"
            }
        },
        "amountType": "RECEIVE",
        "amount": {
            "amount": amount,
            "currency": "USD"
        },
        "transactionType": {
            "scenario": "TRANSFER",
            "initiator": "PAYER",
            "initiatorType": "CONSUMER"
        },
        "note": "From Mats",
        "expiration": "2017-11-15T22:17:28.985-01:00"
    }

    const quote_url = quotesEndpoint + '/payeefsp/quotes'

    return fetch(quote_url, {
            headers: {
                'Accept': 'application/vnd.interoperability.quotes+json;version=1',
                'Content-Type': 'application/vnd.interoperability.quotes+json;version=1.0',
                'FSPIOP-Source': 'pos',
                'FSPIOP-Destination': 'payeefsp',
                'Date': new Date().toISOString()
            },
            method: "POST",
            body: JSON.stringify(test_req)
        })
        .then(function(res) {
            console.log(" ****** ")
            console.log('Response from PAYEEFSP on POS getQuote 1')
            console.log(res)
            console.log(" ****** ")
            return res.json();
        })
        .then(function(res) {
            console.log('Response from PAYEEFSP on POS getQuote 2')
            console.log(res)
            console.log(" ****** ")
                //return res.QuoteAmount;
            //return res;
            return res.quoteAmount.amount;
        })
        .catch(function(err) {
            console.log(`POS getQuote handler error ${err}`)
        });
}

/*
exports.quote = async function(req, h) {
    let mobileNo = req.payload.phoneNo;
    let amount = req.payload.amount;

    console.log('mobileNo')
    console.log(mobileNo)
    console.log('amount')
    console.log(amount)

    return h.response('545.00').code(202)
}
*/