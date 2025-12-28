/**
 * Shared Validation Utilities
 * Used by both frontend forms and can be synced with backend
 */

// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Phone validation (Uzbekistan format)
export const isValidPhone = (phone) => {
  const phoneRegex = /^\+998[0-9]{9}$/
  return phoneRegex.test(phone?.replace(/\s/g, ''))
}

// Name validation (min 2 chars, letters only)
export const isValidName = (name) => {
  return name && name.trim().length >= 2 && /^[a-zA-Zа-яА-ЯёЁ\s'-]+$/.test(name)
}

// Password validation (min 6 chars)
export const isValidPassword = (password) => {
  return password && password.length >= 6
}

// Strong password (8+ chars, uppercase, lowercase, number)
export const isStrongPassword = (password) => {
  return password && 
    password.length >= 8 && 
    /[A-Z]/.test(password) && 
    /[a-z]/.test(password) && 
    /[0-9]/.test(password)
}

// Age validation (0-18 for children)
export const isValidChildAge = (birthDate) => {
  if (!birthDate) return false
  const age = calculateAge(birthDate)
  return age >= 0 && age <= 18
}

// Calculate age from birth date
export const calculateAge = (birthDate) => {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

// Required field
export const isRequired = (value) => {
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return value !== null && value !== undefined
}

// Min length
export const minLength = (value, min) => {
  return value && value.length >= min
}

// Max length
export const maxLength = (value, max) => {
  return !value || value.length <= max
}

// Number range
export const inRange = (value, min, max) => {
  const num = Number(value)
  return !isNaN(num) && num >= min && num <= max
}

// Date validation
export const isValidDate = (dateStr) => {
  const date = new Date(dateStr)
  return date instanceof Date && !isNaN(date)
}

// Future date
export const isFutureDate = (dateStr) => {
  return isValidDate(dateStr) && new Date(dateStr) > new Date()
}

// Past date
export const isPastDate = (dateStr) => {
  return isValidDate(dateStr) && new Date(dateStr) < new Date()
}

// Form validation helper
export const validateForm = (data, rules) => {
  const errors = {}
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field]
    
    for (const rule of fieldRules) {
      const error = rule(value, data)
      if (error) {
        errors[field] = error
        break
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Common validation rules factory
export const rules = {
  required: (message = 'Bu maydon majburiy') => (value) => 
    !isRequired(value) ? message : null,
  
  email: (message = 'Email noto\'g\'ri') => (value) => 
    value && !isValidEmail(value) ? message : null,
  
  phone: (message = 'Telefon raqam noto\'g\'ri') => (value) => 
    value && !isValidPhone(value) ? message : null,
  
  minLength: (min, message) => (value) => 
    value && value.length < min ? (message || `Kamida ${min} ta belgi`) : null,
  
  maxLength: (max, message) => (value) => 
    value && value.length > max ? (message || `Ko'pi bilan ${max} ta belgi`) : null,
  
  password: (message = 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak') => (value) => 
    value && !isValidPassword(value) ? message : null,
  
  match: (fieldName, message = 'Maydonlar mos kelmaydi') => (value, data) => 
    value !== data[fieldName] ? message : null
}
