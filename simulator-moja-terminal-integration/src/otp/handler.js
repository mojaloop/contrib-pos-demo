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
const Const = require('../utils/constant');

const Logger = require('@mojaloop/central-services-shared').Logger
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

                    //return generateOTPa(phoneNo);
                    var otp = generateOTPa(phoneNo, null);
                    return resolve(otp);
                    return resolve('doc null');
                    // throw new Error('doc null')
                    // reject(function (){throw new Error('doc null')});
                }

            })



        //});
    });

}

exports.sendOtp2 = async function (request, h) {
    const input = request.payload;
    console.log(input);
    //const phoneNo = input.phoneNo.toString();
    const phoneNo = input.phoneNo;
    console.log(phoneNo);
    return new Promise((resolve, reject) => {
        var userPromise = findUserQuery(phoneNo);
        userPromise.then(
            function (result) {
                console.log(`result: ${result}`)
      
                if (result != 'no user') {
                    console.log('Phone number exists in db');
                    console.log(result);
                    var currentTime = new Date();
                    console.log(`currentTime: ${currentTime.toISOString()}`)

                    var otpToSend;
                    //const isOtpvalid = isOTPValid(currentTime, doc[0].expiresAt);
                    switch (isOTPValid(currentTime, result.expiresAt)) {
                        case (Const.OTP_VALID):
                            console.log('withinTimeLimit; OTP valid')
                            otpToSend = result.otp;
                            break;
                        case (Const.OTP_EXPIRED):
                            console.log('outside time limit; OTP expired');
                            var user_id = result._id;
                            console.log(`user_id: ${user_id}`);
                            //update otp for this phoneNo
                            otpToSend = generateOTPa(phoneNo, user_id);
                            break;

                    }
                    return resolve(otpToSend);
                }
                //console.log('no user detected');
                var otp = generateOTPa(phoneNo, null);
                return resolve(otp);

            },
            function (error) {
                return reject(error);

            }
        );
    });

   
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
                    //console.log(result.lastErrorObject);
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
        //----------------------
        //db.getDB().collection(collection).findOne({ "phoneNo": phoneNo }, function (err, doc) {
        db.getDB().collection(collection).find({ "phoneNo": phoneNo }).sort({ $natural: -1 }).limit(1)
            .toArray(function (err, doc) {
                if (err) {
                    // handle error
                    console.log(err);
                    console.log('error from db query')
                    return reject(err);
                    //h.response('Database error').code(500);
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
                                    //body = JSON.stringify({ response: Const.OTP_EXPIRED });
                                    body = JSON.stringify({ status: Const.OTP_EXPIRED, response: "OTP expired!!" });
                            }
                         
                        }
                        else {
                            console.log('OTP invalid!!')
                            console.log('------')
                            body = JSON.stringify({ status : Const.OTP_INVALID, response: "OTP invalid" });
                            //return resolve('OTP invalid')

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
    var expiresAt = Util.addMinutes(createdAt, 1);
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

    var response;

    Logger.info('In validateotp(). Connected to db ' + db.dbname);
    console.log(`input phoneNo ${phoneNo}`)
    console.log(`inputOtp ${inputOtp}`)
    return validateOtpQuery(phoneNo, inputOtp);

}