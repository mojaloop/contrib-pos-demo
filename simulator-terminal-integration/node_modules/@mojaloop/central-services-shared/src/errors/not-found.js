'use strict'

const BaseError = require('./base')
const ErrorCategory = require('./category')

class NotFoundError extends BaseError {
  constructor (message) {
    super(ErrorCategory.NOT_FOUND, message)
  }
}

module.exports = NotFoundError
