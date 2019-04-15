'use strict'

const Logger = require('@mojaloop/central-services-shared').Logger
const Shared = require('@mojaloop/central-services-shared')
const ErrorCategory = Shared.ErrorCategory

// Extract the error message between the "'@  @'" tags from the Joi payload error object
const parseErrorMessage = (payloadErrMsg) => {
  try {
    let regex = /("@\s).*?(.\s@")/
    let match = regex.exec(payloadErrMsg)
    match = match.toString().replace(/@/g, '')
    match = match.toString().replace(/,/g, '')
    match = match.toString().replace(/"/g, '')
    match = match.toString().replace(/\./g, '')
    let simplifiedErrorMessage = match.trim()
    return simplifiedErrorMessage
  } catch (err) {
    Logger.info('Function (parseErrorMessage) has failed to extract the user friendly error msg from the following Joi error object : ' + payloadErrMsg)
    return payloadErrMsg
  }
}

const reformatBoomError = (response) => {
  let errorId = response.output.payload.error.replace(/ /gi, '')
  errorId += (errorId.endsWith('Error')) ? '' : 'Error'

  // Check if it is a Joi/Boom err
  if (response.isJoi) {
    let simplifiedErrorMessage = parseErrorMessage(response.output.payload.message)

    response.output.payload = {
      errorInformation:
      {
        errorCode: response.output.statusCode,
        errorDescription: response.output.payload.error,
        extensionList:
        {
          extension:
          [
            {
              key: 'joiValidationError',
              value: simplifiedErrorMessage
            }
          ]
        }
      }
    }
  } else {
    response.output.payload = {
      id: errorId,
      message: response.output.payload.message || response.message
    }
  }
}

exports.onPreResponse = function (request, reply) {
  let response = request.response
  if (response.isBoom) {
    if (response.category) {
      response.output.statusCode = ErrorCategory.getStatusCode(response.category)
      response.output.payload = response.payload
      response.output.headers = response.headers
    } else {
      reformatBoomError(response)
    }
  }
  return reply.continue
}
