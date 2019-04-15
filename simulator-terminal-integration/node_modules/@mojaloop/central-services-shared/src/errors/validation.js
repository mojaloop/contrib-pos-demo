'use strict'

const BaseError = require('./base')
const ErrorCategory = require('./category')

class ValidationError extends BaseError {
  constructor (message, validationErrors) {
    super(ErrorCategory.BAD_REQUEST, message)
    this.payload.validationErrors = validationErrors
  }
}

module.exports = ValidationError
