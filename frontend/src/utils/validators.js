/**
 * Validation Utilities
 * Client-side validation functions
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid
 */
export const isValidEmail = (email) => {
  if (!email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number (Uzbekistan format)
 * @param {string} phone - Phone to validate
 * @returns {boolean} Is valid
 */
export const isValidPhone = (phone) => {
  if (!phone) return false
  const digits = phone.replace(/\D/g, '')
  // Uzbekistan phone: 998XXXXXXXXX (12 digits) or 9XXXXXXXX (9 digits)
  return digits.length === 12 || digits.length === 9
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with score and messages
 */
export const validatePassword = (password) => {
  const result = {
    isValid: false,
    score: 0,
    messages: []
  }

  if (!password) {
    result.messages.push('Parol kiritilishi shart')
    return result
  }

  // Length check
  if (password.length < 8) {
    result.messages.push('Parol kamida 8 ta belgidan iborat bo\'lishi kerak')
  } else {
    result.score += 1
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    result.messages.push('Kamida bitta katta harf bo\'lishi kerak')
  } else {
    result.score += 1
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    result.messages.push('Kamida bitta kichik harf bo\'lishi kerak')
  } else {
    result.score += 1
  }

  // Number check
  if (!/\d/.test(password)) {
    result.messages.push('Kamida bitta raqam bo\'lishi kerak')
  } else {
    result.score += 1
  }

  // Special character check (bonus)
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    result.score += 1
  }

  result.isValid = result.score >= 4
  result.strength = getPasswordStrength(result.score)

  return result
}

/**
 * Get password strength label
 * @param {number} score - Password score
 * @returns {string} Strength label
 */
const getPasswordStrength = (score) => {
  if (score <= 1) return 'Juda zaif'
  if (score === 2) return 'Zaif'
  if (score === 3) return 'O\'rtacha'
  if (score === 4) return 'Kuchli'
  return 'Juda kuchli'
}

/**
 * Validate required field
 * @param {any} value - Value to check
 * @returns {boolean} Is valid
 */
export const isRequired = (value) => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

/**
 * Validate minimum length
 * @param {string} value - Value to check
 * @param {number} min - Minimum length
 * @returns {boolean} Is valid
 */
export const minLength = (value, min) => {
  if (!value) return false
  return value.length >= min
}

/**
 * Validate maximum length
 * @param {string} value - Value to check
 * @param {number} max - Maximum length
 * @returns {boolean} Is valid
 */
export const maxLength = (value, max) => {
  if (!value) return true
  return value.length <= max
}

/**
 * Validate number range
 * @param {number} value - Value to check
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} Is valid
 */
export const inRange = (value, min, max) => {
  const num = Number(value)
  if (isNaN(num)) return false
  return num >= min && num <= max
}

/**
 * Validate date is in the past
 * @param {string|Date} date - Date to check
 * @returns {boolean} Is valid
 */
export const isPastDate = (date) => {
  if (!date) return false
  return new Date(date) < new Date()
}

/**
 * Validate date is in the future
 * @param {string|Date} date - Date to check
 * @returns {boolean} Is valid
 */
export const isFutureDate = (date) => {
  if (!date) return false
  return new Date(date) > new Date()
}

/**
 * Validate age (for children: 1-7 years)
 * @param {string|Date} birthDate - Birth date
 * @param {number} minAge - Minimum age (default: 1)
 * @param {number} maxAge - Maximum age (default: 7)
 * @returns {boolean} Is valid
 */
export const isValidAge = (birthDate, minAge = 1, maxAge = 7) => {
  if (!birthDate) return false
  
  const birth = new Date(birthDate)
  const now = new Date()
  
  let age = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--
  }
  
  return age >= minAge && age <= maxAge
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} Is valid
 */
export const isValidUrl = (url) => {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate file type
 * @param {File} file - File to validate
 * @param {string[]} allowedTypes - Allowed MIME types
 * @returns {boolean} Is valid
 */
export const isValidFileType = (file, allowedTypes) => {
  if (!file || !allowedTypes) return false
  return allowedTypes.includes(file.type)
}

/**
 * Validate file size
 * @param {File} file - File to validate
 * @param {number} maxSizeBytes - Maximum size in bytes
 * @returns {boolean} Is valid
 */
export const isValidFileSize = (file, maxSizeBytes) => {
  if (!file) return false
  return file.size <= maxSizeBytes
}

/**
 * Validate image file
 * @param {File} file - File to validate
 * @param {number} maxSizeMB - Maximum size in MB (default: 5)
 * @returns {object} Validation result
 */
export const validateImage = (file, maxSizeMB = 5) => {
  const result = {
    isValid: true,
    errors: []
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const maxSizeBytes = maxSizeMB * 1024 * 1024

  if (!file) {
    result.isValid = false
    result.errors.push('Fayl tanlanmagan')
    return result
  }

  if (!isValidFileType(file, allowedTypes)) {
    result.isValid = false
    result.errors.push('Faqat JPEG, PNG, GIF yoki WebP formatdagi rasmlar qabul qilinadi')
  }

  if (!isValidFileSize(file, maxSizeBytes)) {
    result.isValid = false
    result.errors.push(`Fayl hajmi ${maxSizeMB}MB dan oshmasligi kerak`)
  }

  return result
}

/**
 * Create form validator
 * @param {object} rules - Validation rules
 * @returns {function} Validator function
 */
export const createValidator = (rules) => {
  return (values) => {
    const errors = {}

    Object.keys(rules).forEach((field) => {
      const fieldRules = rules[field]
      const value = values[field]

      fieldRules.forEach((rule) => {
        if (errors[field]) return // Skip if already has error

        if (rule.required && !isRequired(value)) {
          errors[field] = rule.message || `${field} kiritilishi shart`
        }

        if (rule.email && value && !isValidEmail(value)) {
          errors[field] = rule.message || 'Email formati noto\'g\'ri'
        }

        if (rule.phone && value && !isValidPhone(value)) {
          errors[field] = rule.message || 'Telefon raqami noto\'g\'ri'
        }

        if (rule.minLength && value && !minLength(value, rule.minLength)) {
          errors[field] = rule.message || `Kamida ${rule.minLength} ta belgi bo'lishi kerak`
        }

        if (rule.maxLength && value && !maxLength(value, rule.maxLength)) {
          errors[field] = rule.message || `Ko'pi bilan ${rule.maxLength} ta belgi bo'lishi kerak`
        }

        if (rule.pattern && value && !rule.pattern.test(value)) {
          errors[field] = rule.message || 'Format noto\'g\'ri'
        }

        if (rule.custom && !rule.custom(value, values)) {
          errors[field] = rule.message || 'Qiymat noto\'g\'ri'
        }
      })
    })

    return errors
  }
}

export default {
  isValidEmail,
  isValidPhone,
  validatePassword,
  isRequired,
  minLength,
  maxLength,
  inRange,
  isPastDate,
  isFutureDate,
  isValidAge,
  isValidUrl,
  isValidFileType,
  isValidFileSize,
  validateImage,
  createValidator
}
