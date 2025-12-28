/**
 * Security Utilities
 * XSS prevention, input validation, and security helpers
 */

// HTML entity encoding for XSS prevention
export const escapeHtml = (str) => {
  if (!str) return ''
  const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  }
  return String(str).replace(/[&<>"'`=/]/g, char => htmlEntities[char])
}

// Sanitize user input
export const sanitizeInput = (input) => {
  if (!input) return ''
  return String(input)
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
}

// URL validation
export const isValidUrl = (url) => {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Phone validation (Uzbekistan format)
export const isValidPhone = (phone) => {
  const phoneRegex = /^\+998[0-9]{9}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

// Password strength checker
export const checkPasswordStrength = (password) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  }

  const score = Object.values(checks).filter(Boolean).length

  return {
    checks,
    score,
    strength: score <= 2 ? 'weak' : score <= 3 ? 'fair' : score <= 4 ? 'good' : 'strong'
  }
}

// CSRF token management
export const getCSRFToken = () => {
  return document.querySelector('meta[name="csrf-token"]')?.content || 
         localStorage.getItem('csrf_token')
}

export const setCSRFToken = (token) => {
  localStorage.setItem('csrf_token', token)
}

// Rate limiting helper (client-side)
const rateLimitStore = new Map()

export const checkRateLimit = (key, maxAttempts = 5, windowMs = 60000) => {
  const now = Date.now()
  const record = rateLimitStore.get(key) || { attempts: 0, resetTime: now + windowMs }

  if (now > record.resetTime) {
    record.attempts = 0
    record.resetTime = now + windowMs
  }

  record.attempts++
  rateLimitStore.set(key, record)

  return {
    allowed: record.attempts <= maxAttempts,
    remaining: Math.max(0, maxAttempts - record.attempts),
    resetTime: record.resetTime
  }
}

// Secure random string generator
export const generateSecureId = (length = 32) => {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Input validation rules
export const validators = {
  required: (value) => ({
    valid: value !== null && value !== undefined && value !== '',
    message: 'Bu maydon to\'ldirilishi shart'
  }),
  
  minLength: (min) => (value) => ({
    valid: String(value).length >= min,
    message: `Kamida ${min} ta belgi bo'lishi kerak`
  }),
  
  maxLength: (max) => (value) => ({
    valid: String(value).length <= max,
    message: `Ko'pi bilan ${max} ta belgi bo'lishi mumkin`
  }),
  
  pattern: (regex, message) => (value) => ({
    valid: regex.test(value),
    message
  }),
  
  email: (value) => ({
    valid: isValidEmail(value),
    message: 'Email manzil noto\'g\'ri'
  }),
  
  phone: (value) => ({
    valid: isValidPhone(value),
    message: 'Telefon raqam noto\'g\'ri formatda'
  }),
  
  url: (value) => ({
    valid: !value || isValidUrl(value),
    message: 'URL manzil noto\'g\'ri'
  }),
  
  number: (value) => ({
    valid: !isNaN(Number(value)),
    message: 'Raqam kiriting'
  }),
  
  min: (minValue) => (value) => ({
    valid: Number(value) >= minValue,
    message: `Qiymat ${minValue} dan katta bo'lishi kerak`
  }),
  
  max: (maxValue) => (value) => ({
    valid: Number(value) <= maxValue,
    message: `Qiymat ${maxValue} dan kichik bo'lishi kerak`
  })
}

// Validate form data
export const validateForm = (data, rules) => {
  const errors = {}
  let isValid = true

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field]
    
    for (const rule of fieldRules) {
      const result = rule(value)
      if (!result.valid) {
        errors[field] = result.message
        isValid = false
        break
      }
    }
  }

  return { isValid, errors }
}

// Content Security Policy nonce generator
export const generateNonce = () => {
  return btoa(generateSecureId(16))
}

export default {
  escapeHtml,
  sanitizeInput,
  isValidUrl,
  isValidEmail,
  isValidPhone,
  checkPasswordStrength,
  getCSRFToken,
  setCSRFToken,
  checkRateLimit,
  generateSecureId,
  validators,
  validateForm,
  generateNonce
}
