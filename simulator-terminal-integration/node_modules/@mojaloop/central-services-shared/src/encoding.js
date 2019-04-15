'use strict'

exports.toBase64 = (value) => {
  return Buffer.from(value).toString('base64')
}

exports.fromBase64 = (value) => {
  return Buffer.from(value, 'base64').toString('utf8')
}
