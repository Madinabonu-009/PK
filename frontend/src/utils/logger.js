/**
 * Logger Utility
 * Issue #41: Console.log - Production'da disable
 */

const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development'

const styles = {
  info: 'color: #3b82f6; font-weight: bold;',
  success: 'color: #22c55e; font-weight: bold;',
  warn: 'color: #f59e0b; font-weight: bold;',
  error: 'color: #ef4444; font-weight: bold;',
  debug: 'color: #8b5cf6; font-weight: bold;'
}

const logger = {
  info: (...args) => {
    if (isDev) {
      console.log('%c[INFO]', styles.info, ...args)
    }
  },

  success: (...args) => {
    if (isDev) {
      console.log('%c[SUCCESS]', styles.success, ...args)
    }
  },

  warn: (...args) => {
    if (isDev) {
      console.warn('%c[WARN]', styles.warn, ...args)
    }
  },

  error: (...args) => {
    // Errors always logged
    console.error('%c[ERROR]', styles.error, ...args)
    
    // Send to error tracking in production
    if (!isDev && typeof window !== 'undefined') {
      // Could integrate with Sentry, LogRocket, etc.
      try {
        const errorData = {
          message: args[0]?.message || args[0],
          stack: args[0]?.stack,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent
        }
        
        // Store locally for debugging
        const errors = JSON.parse(localStorage.getItem('app_errors') || '[]')
        errors.push(errorData)
        // Keep only last 50 errors
        if (errors.length > 50) errors.shift()
        localStorage.setItem('app_errors', JSON.stringify(errors))
      } catch (e) {
        // Ignore storage errors
      }
    }
  },

  debug: (...args) => {
    if (isDev) {
      console.log('%c[DEBUG]', styles.debug, ...args)
    }
  },

  table: (data) => {
    if (isDev) {
      console.table(data)
    }
  },

  group: (label, fn) => {
    if (isDev) {
      console.group(label)
      fn()
      console.groupEnd()
    }
  },

  time: (label) => {
    if (isDev) {
      console.time(label)
    }
  },

  timeEnd: (label) => {
    if (isDev) {
      console.timeEnd(label)
    }
  },

  // Performance logging
  perf: (label, fn) => {
    if (isDev) {
      const start = performance.now()
      const result = fn()
      const end = performance.now()
      console.log(`%c[PERF] ${label}: ${(end - start).toFixed(2)}ms`, styles.debug)
      return result
    }
    return fn()
  },

  // Async performance logging
  perfAsync: async (label, fn) => {
    if (isDev) {
      const start = performance.now()
      const result = await fn()
      const end = performance.now()
      console.log(`%c[PERF] ${label}: ${(end - start).toFixed(2)}ms`, styles.debug)
      return result
    }
    return fn()
  },

  // Get stored errors (for debugging)
  getStoredErrors: () => {
    try {
      return JSON.parse(localStorage.getItem('app_errors') || '[]')
    } catch {
      return []
    }
  },

  // Clear stored errors
  clearStoredErrors: () => {
    try {
      localStorage.removeItem('app_errors')
    } catch {
      // Ignore
    }
  }
}

// Replace console in production to prevent accidental logs
if (!isDev && typeof window !== 'undefined') {
  const noop = () => {}
  
  // Store original console for errors
  const originalError = console.error
  const originalWarn = console.warn
  
  // Override console methods
  window.console = {
    ...console,
    log: noop,
    info: noop,
    debug: noop,
    table: noop,
    group: noop,
    groupEnd: noop,
    time: noop,
    timeEnd: noop,
    warn: originalWarn, // Keep warnings
    error: originalError // Keep errors
  }
}

export default logger
