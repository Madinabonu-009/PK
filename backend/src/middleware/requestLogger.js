/**
 * Request Logging Middleware
 * Logs all HTTP requests with Winston
 */

import morgan from 'morgan'
import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create logs directory
const logsDir = path.join(__dirname, '../../logs')

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'play-kids-api' },
  transports: [
    // Error logs
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true
    }),
    
    // Combined logs
    new DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true
    }),
    
    // Access logs
    new DailyRotateFile({
      filename: path.join(logsDir, 'access-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      zippedArchive: true,
      level: 'http'
    })
  ]
})

// Console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }))
}

// Morgan stream for Winston
const stream = {
  write: (message) => {
    logger.http(message.trim())
  }
}

// Custom Morgan token for response time in ms
morgan.token('response-time-ms', (req) => {
  if (!req._startTime) return '0'
  const diff = Date.now() - req._startTime
  return diff.toFixed(2)
})

// Custom Morgan token for user ID
morgan.token('user-id', (req) => {
  return req.user?.id || 'anonymous'
})

// Custom Morgan token for request ID
morgan.token('request-id', (req) => {
  return req.requestId || '-'
})

// Custom Morgan token for request body (sanitized)
morgan.token('body', (req) => {
  if (!req.body || Object.keys(req.body).length === 0) return '-'
  
  // Sanitize sensitive fields
  const sanitized = { ...req.body }
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey']
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***'
    }
  })
  
  return JSON.stringify(sanitized)
})

// Morgan format for development
const devFormat = ':method :url :status :response-time-ms ms - :res[content-length]'

// Morgan format for production
const prodFormat = ':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time-ms ms'

// Request logger middleware
export const requestLogger = morgan(
  process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  { stream }
)

// Log request start time
export const logRequestStart = (req, res, next) => {
  req._startTime = Date.now()
  next()
}

// Log request details
export const logRequestDetails = (req, res, next) => {
  logger.info('Request received', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id
  })
  next()
}

// Log response
export const logResponse = (req, res, next) => {
  const originalSend = res.send
  
  res.send = function(data) {
    res.send = originalSend
    
    // Log response
    logger.info('Response sent', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: req._startTime ? `${Date.now() - req._startTime}ms` : 'N/A'
    })
    
    return res.send(data)
  }
  
  next()
}

// Log errors
export const logError = (err, req, res, next) => {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: req.user?.id,
    requestId: req.requestId,
    body: req.body
  })
  
  next(err)
}

// Generate request ID middleware
export const generateRequestId = (req, res, next) => {
  req.requestId = crypto.randomUUID()
  res.setHeader('X-Request-ID', req.requestId)
  next()
}

// Export logger for use in other modules
export { logger }

export default {
  requestLogger,
  logRequestStart,
  logRequestDetails,
  logResponse,
  logError,
  generateRequestId,
  logger
}
