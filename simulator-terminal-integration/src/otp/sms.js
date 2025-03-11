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

var msg91 = require('msg91-sms');

//Authentication Key 
var authkey = '271268AhZtJOCBI5ca9aac9';
var number;

function sendMessage(number, otp, callback) {
    var message = 'Your OTP is: ' + otp + '. OTP valid for 5 minutes.'
    //Sender ID
    var senderid = '001081';

    //Route
    var route = '4';

    //Country dial code
    var dialcode = '91';

    //send to single number

    msg91.sendOne(authkey, number, message, senderid, route, dialcode, function (response) {

        //Returns Message ID, If Sent Successfully or the appropriate Error Message
        callback(response);
        //console.log(response);
    
    });
};

//send to multiple numbers
// msg91.sendMultiple(authkey, numbers, message, senderid, route, dialcode, function (response) {
//     //Returns Message ID, If Sent Successfully or the appropriate Error Message
//     console.log(response);
// });

module.exports = {
    sendMessage
}