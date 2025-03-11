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

const guid = () => {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

//console.log(guid());




function guid1(stan) {
    console.log(`stan: ${stan}`)

    function _p8(s) {
        var p = (stan.toString(16) + "000000000").substr(2, 8);
        return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
    }
    return _p8() + _p8(true) + _p8(true) + _p8();
}

//console.log(guid1(121212));
function addMinutes(date, minutes){
    return new Date(date.getTime() + minutes*60000);
}
function generateOTP() {

    // Declare a digits variable
    // which stores all digits
    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 4; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    if (OTP.length == 4) {
        //console.log(`in utils otp: ${OTP}`)
       return OTP;
    }
    else{
        //console.log(`in utils generating new otp`)
        generateOTP();
    }s
    //return +OTP;
    //return {}
}

module.exports = {
    guid: guid1,
    guidRandom: guid,
    generateOTP,
    addMinutes, 
    

};