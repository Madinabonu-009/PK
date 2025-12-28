/**
 * Performance Monitoring Middleware
 * Tracks request/response times and system metrics
 */

import logger from '../utils/logger.js'

// Store metrics in memory (use Redis in production)
const metrics = {
  requests: [],
  errors: [],
  slowRequests: []
}

const MAX_STORED_METRICS = 1000
const SLOW_REQUEST_THRESHOLD = 1000 // 1 second

/**
 * Performance monitoring middleware
 */
export const performanceMonitor = (req, res, next) => {
  const startTime = process.hrtime.bigint()
  const startMemory = process.memoryUsage()

  // Capture response
  const originalSend = res.send
  res.send = function(data) {
    const endTime = process.hrtime.bigint()
    const duration = Number(endTime - startTime) / 1000000 // Convert to ms
    const endMemory = process.memoryUsage()

    // Calculate memory delta
    const memoryDelta = {
      rss: endMemory.rss - startMemory.rss,
      heapUsed: endMemory.heapUsed - startMemory.heapUsed
    }

    // Store metric
    const metric = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: Math.round(duration * 100) / 100,
      memoryDelta: Math.round(memoryDelta.heapUsed / 1024), // KB
      timestamp: new Date().toISOString(),
      userAgent: req.get('user-agent'),
      ip: req.ip
    }

    // Add to metrics
    metrics.requests.push(metric)
    if (metrics.requests.length > MAX_STORED_METRICS) {
      metrics.requests.shift()
    }

    // Track slow requests
    if (duration > SLOW_REQUEST_THRESHOLD) {
      metrics.slowRequests.push(metric)
      if (metrics.slowRequests.length > 100) {
        metrics.slowRequests.shift()
      }

      logger.warn('Slow request detected', {
        method: req.method,
        url: req.url,
        duration: `${duration.toFixed(2)}ms`
      })
    }

    // Track errors
    if (res.statusCode >= 400) {
      metrics.errors.push(metric)
      if (metrics.errors.length > 100) {
        metrics.errors.shift()
      }
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      const color = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m'
      const reset = '\x1b[0m'
      console.log(
        `${color}${req.method} ${req.url} ${res.statusCode}${reset} - ${duration.toFixed(2)}ms`
      )
    }

    return originalSend.call(this, data)
  }

  next()
}

/**
 * Get performance metrics
 */
export const getMetrics = () => {
  const now = Date.now()
  const last5Minutes = now - 5 * 60 * 1000
  const last1Hour = now - 60 * 60 * 1000

  // Filter recent requests
  const recent5min = metrics.requests.filter(
    m => new Date(m.timestamp).getTime() > last5Minutes
  )
  const recent1hour = metrics.requests.filter(
    m => new Date(m.timestamp).getTime() > last1Hour
  )

  // Calculate averages
  const avg5min = recent5min.length > 0
    ? recent5min.reduce((sum, m) => sum + m.duration, 0) / recent5min.length
    : 0

  const avg1hour = recent1hour.length > 0
    ? recent1hour.reduce((sum, m) => sum + m.duration, 0) / recent1hour.length
    : 0

  // Calculate percentiles
  const p95_5min = calculatePercentile(recent5min.map(m => m.duration), 95)
  const p99_5min = calculatePercentile(recent5min.map(m => m.duration), 99)

  // Error rate
  const errors5min = recent5min.filter(m => m.statusCode >= 400).length
  const errorRate5min = recent5min.length > 0
    ? (errors5min / recent5min.length) * 100
    : 0

  return {
    summary: {
      totalRequests: metrics.requests.length,
      totalErrors: metrics.errors.length,
      totalSlowRequests: metrics.slowRequests.length
    },
    last5Minutes: {
      requests: recent5min.length,
      avgDuration: Math.round(avg5min * 100) / 100,
      p95Duration: Math.round(p95_5min * 100) / 100,
      p99Duration: Math.round(p99_5min * 100) / 100,
      errors: errors5min,
      errorRate: Math.round(errorRate5min * 100) / 100
    },
    last1Hour: {
      requests: recent1hour.length,
      avgDuration: Math.round(avg1hour * 100) / 100
    },
    slowRequests: metrics.slowRequests.slice(-10), // Last 10
    recentErrors: metrics.errors.slice(-10), // Last 10
    systemMetrics: getSystemMetrics()
  }
}

/**
 * Calculate percentile
 */
const calculatePercentile = (values, percentile) => {
  if (values.length === 0) return 0
  
  const sorted = values.slice().sort((a, b) => a - b)
  const index = Math.ceil((percentile / 100) * sorted.length) - 1
  return sorted[index] || 0
}

/**
 * Get system metrics
 */
const getSystemMetrics = () => {
  const memory = process.memoryUsage()
  const uptime = process.uptime()

  return {
    memory: {
      rss: Math.round(memory.rss / 1024 / 1024), // MB
      heapUsed: Math.round(memory.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memory.heapTotal / 1024 / 1024), // MB
      external: Math.round(memory.external / 1024 / 1024) // MB
    },
    uptime: {
      seconds: Math.floor(uptime),
      formatted: formatUptime(uptime)
    },
    cpu: process.cpuUsage()
  }
}

/**
 * Format uptime
 */
const formatUptime = (seconds) => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  parts.push(`${secs}s`)

  return parts.join(' ')
}

/**
 * Reset metrics
 */
export const resetMetrics = () => {
  metrics.requests = []
  metrics.errors = []
  metrics.slowRequests = []
}

/**
 * Metrics endpoint handler
 */
export const metricsHandler = (req, res) => {
  res.json(getMetrics())
}

export default {
  performanceMonitor,
  getMetrics,
  resetMetrics,
  metricsHandler
}
