/**
 * Logger utility for consistent logging across the application
 */

const isDev = process.env.NODE_ENV !== 'production'
const logLevel = process.env.LOG_LEVEL || (isDev ? 'debug' : 'info')

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  success: 2,
  debug: 3
}

const shouldLog = (level) => {
  return levels[level] <= levels[logLevel]
}

const logger = {
  info: (...args) => {
    if (shouldLog('info')) {
      console.log('[INFO]', new Date().toISOString(), ...args)
    }
  },

  error: (...args) => {
    if (shouldLog('error')) {
      console.error('[ERROR]', new Date().toISOString(), ...args)
    }
  },

  warn: (...args) => {
    if (shouldLog('warn')) {
      console.warn('[WARN]', new Date().toISOString(), ...args)
    }
  },

  debug: (...args) => {
    if (shouldLog('debug')) {
      console.debug('[DEBUG]', new Date().toISOString(), ...args)
    }
  },

  success: (...args) => {
    if (shouldLog('success')) {
      console.log('[SUCCESS]', new Date().toISOString(), ...args)
    }
  }
}

export default logger
