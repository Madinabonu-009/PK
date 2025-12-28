/**
 * Input validation utilities
 */

export const validatePhone = (phone) => {
  // Uzbekistan phone format: +998XXXXXXXXX
  const phoneRegex = /^\+998[0-9]{9}$/
  return phoneRegex.test(phone?.trim())
}

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email?.trim())
}

export const validatePassword = (password) => {
  // Strong password policy:
  // - Minimum 8 characters
  // - At least one uppercase letter
  // - At least one lowercase letter
  // - At least one number
  // - At least one special character (optional but recommended)
  
  if (!password || password.length < 8) {
    return {
      valid: false,
      message: 'Password must be at least 8 characters long'
    }
  }
  
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one uppercase letter'
    }
  }
  
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one lowercase letter'
    }
  }
  
  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one number'
    }
  }
  
  // Check for common weak passwords
  const weakPasswords = [
    'password', 'password123', '12345678', 'qwerty123',
    'admin123', 'welcome123', 'letmein123'
  ]
  
  if (weakPasswords.includes(password.toLowerCase())) {
    return {
      valid: false,
      message: 'Password is too common. Please choose a stronger password'
    }
  }
  
  return { valid: true }
}

export const getPasswordStrength = (password) => {
  let strength = 0
  
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++
  
  if (strength <= 2) return 'weak'
  if (strength <= 4) return 'medium'
  return 'strong'
}

export const sanitizeString = (str) => {
  if (!str) return ''
  // Remove potential XSS attacks
  return str.toString().trim()
    .replace(/[<>]/g, '') // Remove < and >
    .substring(0, 1000) // Limit length
}

export const validateRequired = (value, fieldName) => {
  if (!value || value.toString().trim() === '') {
    throw new Error(`${fieldName} is required`)
  }
  return true
}

export const validateAge = (age) => {
  const numAge = parseInt(age)
  return !isNaN(numAge) && numAge >= 0 && numAge <= 10
}

export const validateDate = (dateString) => {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date)
}
