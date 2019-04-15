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
const Util = require('../utils/util')
const SMS = require('./sms');
const db = require('./db/db');
const Logger = require('@mojaloop/central-services-shared').Logger
const collection = "otp";

exports.generateOTP = function(request, h) {
    const input = request.payload;
    //console.log(input);
    const phoneNo = input.phoneNo.toString();
    console.log('Input Phone Number is : ' + phoneNo);
    const otp = Util.generateOTP(phoneNo).toString();

    Logger.info('Sendotp Connected to db ' + db.dbname);
    db.getDB().collection(collection).insertOne({
        "createdAt": new Date(),
        "phoneNo": +phoneNo,
        "otp": +otp
    });
    console.log("Generated OTP for phone number: " + phoneNo + " is : " + otp);

    return h.response(otp).code(200);
}

var response1 = 'null';
exports.validateOtp = function(request, h) {
    const input = request.payload;
    console.log('Input Values')
    //console.log(input)
    const phoneNo = input.phoneNo;
    console.log('phoneNo: '+ phoneNo)
    const inputOtp = input.inputOtp;
    console.log('inputOtp: ' + inputOtp)

    Logger.info(' in validate OTP, Connected to db ' + db.dbname);

    //----------------------
    let res = db.getDB().collection(collection).findOne({ "phoneNo": +phoneNo }, function(err, doc) {
            if (err) {
                // handle error
                console.log('error from db query')
            }
            if (doc != null) {
                if (!doc.phoneNo) {
                    //handle case
                    console.log('!doc.phoneNo')
                } else {
                    //handle case
                    console.log(`valid.phoneNo: ${doc.phoneNo}`);
                    console.log(`valid.otp: ${doc.otp}`);
                    //console.log(`inputOtp: ${inputOtp}`);
                    if (doc.otp == inputOtp) {
                        global.response1 = 'OTP Verified';
                        console.log(global.response1);
                        console.log(`User ${phoneNo} is verified`);
                    } else {
                        console.log(`User ${phoneNo} is unverified`);
                        global.response1 = 'OTP Unverified';
                        console.log(global.response1);
                    }
                }
            }
        }
    );

    // response = 'verified';
    console.log(`User1 ${global.response1} `);
    return h.response(global.response1).code(200);
}

exports.validateOtpreto = function(request, h) {
    const input = request.payload;
    const phoneNo = input.phoneNo;
    const inputOtp = input.inputOtp;

    var response;

    Logger.info(' in validate OTP atm & pos, Connected to db ' + db.dbname);
    //console.log(`input ${input}`)
    console.log(`phoneNo ${phoneNo}`)
    console.log(`inputOtp ${inputOtp}`)

    return new Promise((resolve, reject) => {
        //----------------------
        db.getDB().collection(collection).findOne({ "phoneNo": +phoneNo }, function(err, doc) {
            if (err) {
                // handle error
                console.log(err);
                console.log('error from db query')
                return reject(err);
                //h.response('Database error').code(500);
            }
            if (doc != null) {
                if (!doc.phoneNo) {
                    //handle case
                    console.log('!doc.phoneNo')
                    return reject('no phno');
                } else {
                    //handle case
                    console.log(`valid.phoneNo: ${doc.phoneNo}`);
                    console.log(`valid.otp: ${doc.otp}`);
                    console.log(`inputOtp: ${inputOtp}`);
                    if (doc.otp == inputOtp) {
                        console.log(`User ${phoneNo} is verified`);
                        response = 'Approved!!'

                        // return resolve(response);

                        var body = JSON.stringify({ response: "Verified" })
                        return resolve(body);
                        //return h.response('verified').code(200);
                    } else {
                        console.log(`User ${phoneNo} is unverified`);
                        response = 'Rejected!!';

                        var body = JSON.stringify({ response: "OTP invalid" })
                        return resolve(body);
                        //return h.response('unverified').code(200);
                    }
                }
            }
        });
    });
}