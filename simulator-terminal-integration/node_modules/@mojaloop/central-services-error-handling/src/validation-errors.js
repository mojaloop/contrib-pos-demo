'use strict'

const ValidationError = require('@mojaloop/central-services-shared').ValidationError

class InvalidBodyError extends ValidationError {
  constructor (...validationErrors) {
    super('Body does not match schema', validationErrors)
  }
}

class InvalidUriParameterError extends ValidationError {
  constructor (...validationErrors) {
    super('Error validating one or more uri parameters', validationErrors)
  }
}

class InvalidQueryParameterError extends ValidationError {
  constructor (...validationErrors) {
    super('Error validating one or more query parameters', validationErrors)
  }
}

class InvalidHeaderError extends ValidationError {
  constructor (...validationErrors) {
    super('Error validating one or more headers', validationErrors)
  }
}

module.exports = {
  InvalidBodyError,
  InvalidQueryParameterError,
  InvalidUriParameterError,
  InvalidHeaderError
}
