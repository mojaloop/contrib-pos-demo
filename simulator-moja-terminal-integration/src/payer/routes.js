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

module.exports = [
  {
    method: 'GET',
    path: '/payerfsp/',
    handler: Handler.metadata,
    options: {
      tags: tags,
      description: 'Metadata'
    }
  },
  {
    method: 'PUT',
    path: '/payerfsp/participants/{type}/{id}',
    handler: Handler.putParticipantsByTypeId,
    options: {
      tags: tags,
      description: 'Metadata'
    }
  },
  {
    method: 'PUT',
    path: '/payerfsp/parties/{type}/{id}',
    handler: Handler.putPartiesByTypeId,
    options: {
      tags: tags,
      description: 'Metadata'
    }
  },
  {
    method: 'PUT',
    path: '/payerfsp/quotes/{id}',
    handler: Handler.putQuotesById,
    options: {
      tags: tags,
      description: 'Metadata'
    }
  },
  {
    method: 'PUT',
    path: '/payerfsp/transfers/{id}',
    handler: Handler.putTransfersById,
    options: {
      tags: tags,
      description: 'Metadata'
    }
  },
  {
    method: 'PUT',
    path: '/payerfsp/transfers/{id}/error',
    handler: Handler.putTransfersByIdError,
    options: {
      tags: tags,
      description: 'Metadata'
    }
  },
  {
    method: 'GET',
    path: '/payerfsp/correlationid/{id}',
    handler: Handler.getcorrelationId,
    options: {
      tags: tags,
      description: 'Get details based on correlationid'
    }
  },
  {
      method: 'GET',
      path: '/payerfsp/requests/{id}',
      handler: Handler.getRequestById,
      options: {
          tags: tags,
          description: 'Get details based on request id'
      }
  },
  {
      method: 'GET',
      path: '/payerfsp/callbacks/{id}',
      handler: Handler.getCallbackById,
      options: {
          tags: tags,
          description: 'Get details based on callback id'
      }
  }
]
