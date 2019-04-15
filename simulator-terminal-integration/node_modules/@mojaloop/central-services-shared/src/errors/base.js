'use strict'

class BaseError extends Error {
  constructor (category, message = '') {
    super(message)
    this.category = category
    this.name = this.constructor.name
    this.payload = {
      id: this.name,
      message: message
    }

    this.headers = {}

    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = BaseError
