/**
 * Validation utilities for backend
 */

/**
 * Validate phone number (Uzbekistan format)
 */
export function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false
  const phoneRegex = /^\+998[0-9]{9}$/
  return phoneRegex.test(phone.trim())
}

/**
 * Validate email
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Validate date string (YYYY-MM-DD)
 */
export function isValidDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return false
  const date = new Date(dateStr)
  return !isNaN(date.getTime())
}

/**
 * Validate child age (2-6 years)
 */
export function isValidChildAge(birthDate) {
  if (!isValidDate(birthDate)) return false
  
  const birth = new Date(birthDate)
  const today = new Date()
  
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age >= 2 && age <= 6
}

/**
 * Sanitize string input
 */
export function sanitizeString(str) {
  if (!str || typeof str !== 'string') return ''
  return str.trim().replace(/[<>]/g, '')
}

/**
 * Validate required fields
 */
export function validateRequired(data, fields) {
  const errors = []
  
  for (const field of fields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors.push(`${field} is required`)
    }
  }
  
  return errors
}

export default {
  isValidPhone,
  isValidEmail,
  isValidDate,
  isValidChildAge,
  sanitizeString,
  validateRequired
}
