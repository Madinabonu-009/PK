/**
 * Error Tracking Service
 * Centralized error logging and reporting
 */

import secureStorage from '../utils/secureStorage'

class ErrorTracker {
  constructor() {
    this.enabled = import.meta.env.PROD
    this.errors = []
    this.maxErrors = 100
    this.endpoint = '/api/errors'
  }

  /**
   * Initialize error tracking
   */
  init() {
    if (!this.enabled) return

    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError(event.error, {
        type: 'uncaught',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      })
    })

    // Unhandled promise rejection
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(event.reason, {
        type: 'unhandled-promise',
        promise: event.promise
      })
    })

    console.log('Error tracking initialized')
  }

  /**
   * Capture error
   */
  captureError(error, context = {}) {
    const errorData = {
      message: error?.message || String(error),
      stack: error?.stack,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      memory: this.getMemoryInfo(),
      user: this.getUserInfo()
    }

    // Store locally
    this.errors.push(errorData)
    if (this.errors.length > this.maxErrors) {
      this.errors.shift()
    }

    // Send to server
    this.sendError(errorData)

    // Log in development
    if (import.meta.env.DEV) {
      console.error('[Error Tracker]', errorData)
    }
  }

  /**
   * Capture message
   */
  captureMessage(message, level = 'info', context = {}) {
    const data = {
      message,
      level,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href
    }

    if (this.enabled) {
      this.sendError(data)
    }

    if (import.meta.env.DEV) {
      console.log(`[${level.toUpperCase()}]`, message, context)
    }
  }

  /**
   * Send error to server
   */
  async sendError(errorData) {
    if (!this.enabled) return

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorData)
      })
    } catch (e) {
      // Silently fail - don't want error tracking to cause more errors
      console.warn('Failed to send error to server:', e)
    }
  }

  /**
   * Get memory info
   */
  getMemoryInfo() {
    if (performance.memory) {
      return {
        usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1048576),
        totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1048576),
        jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
      }
    }
    return null
  }

  /**
   * Get user info (if available)
   */
  getUserInfo() {
    try {
      const userStr = secureStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        return {
          id: user.id,
          role: user.role
          // Don't send sensitive data
        }
      }
    } catch (e) {
      // Ignore
    }
    return null
  }

  /**
   * Set user context
   */
  setUser(user) {
    this.user = user ? {
      id: user.id,
      role: user.role,
      username: user.username
    } : null
  }

  /**
   * Add breadcrumb
   */
  addBreadcrumb(category, message, data = {}) {
    const breadcrumb = {
      category,
      message,
      data,
      timestamp: new Date().toISOString()
    }

    if (!this.breadcrumbs) {
      this.breadcrumbs = []
    }

    this.breadcrumbs.push(breadcrumb)
    if (this.breadcrumbs.length > 50) {
      this.breadcrumbs.shift()
    }
  }

  /**
   * Get all errors
   */
  getErrors() {
    return this.errors
  }

  /**
   * Clear errors
   */
  clearErrors() {
    this.errors = []
  }
}

// Export singleton
const errorTracker = new ErrorTracker()
export default errorTracker

// Convenience exports
export const captureError = (error, context) => errorTracker.captureError(error, context)
export const captureMessage = (message, level, context) => errorTracker.captureMessage(message, level, context)
export const setUser = (user) => errorTracker.setUser(user)
export const addBreadcrumb = (category, message, data) => errorTracker.addBreadcrumb(category, message, data)
