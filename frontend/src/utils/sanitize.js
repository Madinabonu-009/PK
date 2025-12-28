/**
 * Sanitization Utility - XSS himoyasi
 * Issue #1: XSS Zaiflik - to'liq sanitizatsiya
 */

// HTML entities encode
const htmlEntities = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
}

/**
 * Escape HTML special characters
 */
export const escapeHtml = (str) => {
  if (typeof str !== 'string') return ''
  return str.replace(/[&<>"'`=/]/g, char => htmlEntities[char])
}

/**
 * Sanitize string for safe display
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return ''
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

/**
 * Sanitize object recursively
 */
export const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) return obj
  if (typeof obj === 'string') return sanitizeString(obj)
  if (typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(sanitizeObject)
  
  const sanitized = {}
  for (const [key, value] of Object.entries(obj)) {
    sanitized[sanitizeString(key)] = sanitizeObject(value)
  }
  return sanitized
}

/**
 * Sanitize URL
 */
export const sanitizeUrl = (url) => {
  if (typeof url !== 'string') return ''
  const trimmed = url.trim().toLowerCase()
  if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:') || trimmed.startsWith('vbscript:')) {
    return ''
  }
  return url
}

/**
 * Sanitize filename
 */
export const sanitizeFilename = (filename) => {
  if (typeof filename !== 'string') return ''
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 255)
}

/**
 * Validate and sanitize email
 */
export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return ''
  const trimmed = email.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(trimmed) ? trimmed : ''
}

/**
 * Sanitize phone number
 */
export const sanitizePhone = (phone) => {
  if (typeof phone !== 'string') return ''
  return phone.replace(/[^\d+\-\s()]/g, '').trim()
}

/**
 * Create safe HTML content (for dangerouslySetInnerHTML)
 */
export const createSafeHtml = (html) => {
  if (typeof html !== 'string') return { __html: '' }
  
  // Remove dangerous tags and attributes
  const safe = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/style\s*=\s*["'][^"']*expression[^"']*["']/gi, '')
  
  return { __html: safe }
}

export default {
  escapeHtml,
  sanitizeString,
  sanitizeObject,
  sanitizeUrl,
  sanitizeFilename,
  sanitizeEmail,
  sanitizePhone,
  createSafeHtml
}
