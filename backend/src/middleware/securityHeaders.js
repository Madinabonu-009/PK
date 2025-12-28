/**
 * Security Headers Middleware
 * Additional security headers beyond Helmet
 */

import logger from '../utils/logger.js'

/**
 * Add custom security headers
 */
export const securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY')
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff')
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block')
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  
  // Content Security Policy (basic)
  const isProduction = process.env.NODE_ENV === 'production'
  const siteUrl = isProduction ? 'https://playk.onrender.com' : 'http://localhost:3000'
  
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://www.youtube.com https://s.ytimg.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    `connect-src 'self' ${siteUrl} wss://playk.onrender.com https://www.youtube.com`,
    "media-src 'self' https: blob:",
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
    "frame-ancestors 'none'"
  ].join('; ')
  
  res.setHeader('Content-Security-Policy', csp)
  
  next()
}

/**
 * Remove sensitive headers
 */
export const removeSensitiveHeaders = (req, res, next) => {
  // Remove server identification
  res.removeHeader('X-Powered-By')
  
  next()
}

/**
 * Add security context to response
 */
export const addSecurityContext = (req, res, next) => {
  // Add request ID for tracking
  req.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  res.setHeader('X-Request-ID', req.id)
  
  // Log security events
  if (req.path.includes('auth') || req.path.includes('login')) {
    logger.info(`Security event: ${req.method} ${req.path}`, {
      requestId: req.id,
      ip: req.ip,
      userAgent: req.get('user-agent')
    })
  }
  
  next()
}

export default {
  securityHeaders,
  removeSensitiveHeaders,
  addSecurityContext
}
