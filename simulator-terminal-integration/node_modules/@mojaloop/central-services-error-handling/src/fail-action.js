'use strict'

const ValidationErrors = require('./validation-errors')
const InvalidBodyError = ValidationErrors.InvalidBodyError
const InvalidQueryParameterError = ValidationErrors.InvalidQueryParameterError
const InvalidUriParameterError = ValidationErrors.InvalidUriParameterError
const InvalidHeaderError = ValidationErrors.InvalidHeaderError

const reformatValidationError = (source, error) => {
  let data = error.data
  let details = (data.details || []).map(d => ({ message: d.message, params: d.context }))
  switch (source) {
    case 'payload':
      return new InvalidBodyError(...details)
    case 'query':
      return new InvalidQueryParameterError(...details)
    case 'params':
      return new InvalidUriParameterError(...details)
    case 'headers':
      return new InvalidHeaderError(...details)
    default:
      return error
  }
}

module.exports = (request, reply, source, error) => {
  if (!error) return reply.continue()
  if (error && error.data && error.data.name === 'ValidationError') {
    return reply(reformatValidationError(source, error))
  }
  return reply(error)
}
