/**
 * Shared helper functions for backend
 */

/**
 * Normalize MongoDB document ID for frontend
 * Converts _id to id string
 */
export const normalizeId = (item) => {
  if (!item) return item
  const obj = item.toObject ? item.toObject() : { ...item }
  if (obj._id && !obj.id) {
    obj.id = obj._id.toString()
  }
  return obj
}

/**
 * Normalize array of documents
 */
export const normalizeIds = (items) => {
  if (!Array.isArray(items)) return items
  return items.map(normalizeId)
}

/**
 * Validate phone number (Uzbekistan format)
 */
export const isValidPhone = (phone) => {
  if (!phone) return false
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
  return /^\+?998[0-9]{9}$/.test(cleanPhone)
}

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  if (!email) return true // Optional field
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

/**
 * Validate name (2-100 chars)
 */
export const isValidName = (name) => {
  if (!name || typeof name !== 'string') return false
  const trimmed = name.trim()
  return trimmed.length >= 2 && trimmed.length <= 100
}

/**
 * Calculate age from birth date
 */
export const calculateAge = (birthDate) => {
  const today = new Date()
  const birth = new Date(birthDate)
  if (isNaN(birth.getTime())) return null
  return (today - birth) / (365.25 * 24 * 60 * 60 * 1000)
}

/**
 * Validate child age (1-7 years)
 */
export const isValidChildAge = (birthDate) => {
  const age = calculateAge(birthDate)
  return age !== null && age >= 1 && age <= 7
}

/**
 * Sanitize string input
 */
export const sanitizeString = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str.trim()
}

/**
 * Create error response object
 */
export const errorResponse = (message, details = null) => ({
  success: false,
  error: message,
  ...(details && { details })
})

/**
 * Create success response object
 */
export const successResponse = (data, message = null) => ({
  success: true,
  ...(message && { message }),
  ...data
})
