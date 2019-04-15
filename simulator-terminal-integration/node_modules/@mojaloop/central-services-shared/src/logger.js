'use strict'

const { createLogger, format, transports } = require('winston')
const { combine, timestamp, colorize, printf } = format
const level = process.env.LOG_LEVEL || 'info'

const customFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} - ${level}: ${message}`
})

const Logger = createLogger({
  level,
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    perf: 3,
    verbose: 4,
    debug: 5,
    silly: 6
  },
  format: combine(
    timestamp(),
    colorize(),
    customFormat
  ),
  transports: [
    new transports.Console()
  ],
  exceptionHandlers: [
    new transports.Console()
  ],
  exitOnError: false
})

module.exports = Logger
