'use strict'

const BAD_REQUEST = 'BadRequest'
const UNAUTHORIZED = 'Unauthorized'
const FORBIDDEN = 'Forbidden'
const NOT_FOUND = 'NotFound'
const METHOD_NOT_ALLOWED = 'MethodNotAllowed'
const NOT_ACCEPTABLE = 'NotAcceptable'
const CONFLICT = 'Conflict'
const UNSUPPORTED_MEDIA_TYPE = 'UnsupportedMediaType'
const UNPROCESSABLE = 'Unprocessable'
const INTERNAL = 'Internal'
const NOT_IMPLEMENTED = 'NotImplemented'

module.exports = {
  BAD_REQUEST,
  UNAUTHORIZED,
  FORBIDDEN,
  NOT_FOUND,
  METHOD_NOT_ALLOWED,
  NOT_ACCEPTABLE,
  CONFLICT,
  UNSUPPORTED_MEDIA_TYPE,
  UNPROCESSABLE,
  INTERNAL,
  NOT_IMPLEMENTED,

  getStatusCode: (category) => {
    switch (category) {
      case BAD_REQUEST: return 400
      case UNAUTHORIZED: return 401
      case FORBIDDEN: return 403
      case NOT_FOUND: return 404
      case METHOD_NOT_ALLOWED: return 405
      case NOT_ACCEPTABLE: return 406
      case CONFLICT: return 409
      case UNSUPPORTED_MEDIA_TYPE: return 415
      case UNPROCESSABLE: return 422
      case INTERNAL: return 500
      case NOT_IMPLEMENTED: return 501
      default: return 500
    }
  }
}
