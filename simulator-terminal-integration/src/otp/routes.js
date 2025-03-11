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

const Handler = require('./handler')
const tags = ['api', 'metadata']

module.exports = [
    {
        method: 'POST',
        path: '/sendOtp',
        handler: Handler.generateOTP,
        options: {
            tags: tags,
            description: 'To generate OTP'
        }
    },
    {
        method: 'POST',
        path: '/validateOtp',
        handler: Handler.validateOtpreto,
        options: {
            tags: tags,
            description: 'To validte OTP'
        }
    }
]