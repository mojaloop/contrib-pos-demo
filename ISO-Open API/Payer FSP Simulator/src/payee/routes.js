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
 - Murthy Kakarlamudi murthy@modusbox.com
*****/

const Handler = require('./handler')
const tags = ['api', 'metadata']

module.exports = [{
        method: 'GET',
        path: '/payeefsp/',
        handler: Handler.metadata,
        options: {
            tags: tags,
            description: 'Metadata'
        }
    },
    {
        method: 'POST',
        path: '/payeefsp/parties/{type}/{id}',
        handler: Handler.postPartiesByTypeAndId,
        config: {
            id: 'add_parties',
            tags: tags,
            auth: null,
            description: 'Transfer API.',
            payload: {
                failAction: 'error',
                output: 'data'
            }
        }
    },
    {
        method: 'GET',
        path: '/payeefsp/parties/{type}/{id}',
        handler: Handler.getPartiesByTypeAndId,
        options: {
            tags: tags,
            description: 'Add users to payer simulator'
        }
    },
    {
        method: 'POST',
        path: '/payeefsp/quotes',
        handler: Handler.postQuotes,
        options: {
            tags: tags,
            description: 'Add users to payer simulator'
        }
    },
    {
        method: 'POST',
        path: '/payeefsp/transfers',
        handler: Handler.postTransfers,
        options: {
            tags: tags,
            description: 'Add users to payer simulator'
        }
    },
    {
        method: 'PUT',
        path: '/payeefsp/transfers/{id}',
        handler: Handler.putTransfersById,
        options: {
            tags: tags,
            description: 'Metadata'
        }
    },
    {
        method: 'PUT',
        path: '/payeefsp/transfers/{id}/error',
        handler: Handler.putTransfersByIdError,
        options: {
            tags: tags,
            description: 'Metadata'
        }
    },
    {
        method: 'GET',
        path: '/payeefsp/correlationid/{id}',
        handler: Handler.getcorrelationId,
        options: {
            tags: tags,
            description: 'Get details based on correlationid'
        }
    },
    {
        method: 'GET',
        path: '/payeefsp/requests/{id}',
        handler: Handler.getRequestById,
        options: {
            tags: tags,
            description: 'Get details based on request id'
        }
    },
    {
        method: 'GET',
        path: '/payeefsp/callbacks/{id}',
        handler: Handler.getCallbackById,
        options: {
            tags: tags,
            description: 'Get details based on callback id'
        }
    }
]