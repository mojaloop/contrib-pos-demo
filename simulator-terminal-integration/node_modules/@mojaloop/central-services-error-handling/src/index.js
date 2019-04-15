'use strict'

const Handler = require('./handler')
const ValidationErrors = require('./validation-errors')

exports.plugin = {
  name: 'error-handler',
  register: function (server) {
    server.ext('onPreResponse', Handler.onPreResponse)
  }
}

exports.validateRoutes = (options = {}) => {
  options.abortEarly = false
  let language = options.language || {}
  language.key = '{{!key}} '
  options.language = language
  return options
}

exports.InvalidBodyError = ValidationErrors.InvalidBodyError
exports.InvalidQueryParameterError = ValidationErrors.InvalidQueryParameterError
exports.InvalidUriParameterError = ValidationErrors.InvalidUriParameterError
exports.InvalidHeaderError = ValidationErrors.InvalidHeaderError
