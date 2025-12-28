/**
 * Utils Index
 * Centralized exports for all utility functions
 */

// Security
export { default as secureStorage } from './secureStorage'
export { 
  sanitizeString, 
  sanitizeHTML, 
  sanitizeEmail, 
  sanitizePhone,
  sanitizeObject 
} from './sanitize'

// Logging
export { default as logger } from './logger'

// Font loading
export { 
  preloadFonts, 
  loadFontsAsync, 
  areFontsLoaded, 
  waitForFonts 
} from './fontLoader'

// Common utilities
export const formatDate = (date, locale = 'uz-UZ') => {
  if (!date) return ''
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const formatTime = (date, locale = 'uz-UZ') => {
  if (!date) return ''
  return new Date(date).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatCurrency = (amount, currency = 'UZS') => {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0
  }).format(amount)
}

export const formatNumber = (num) => {
  return new Intl.NumberFormat('uz-UZ').format(num)
}

export const truncate = (str, length = 100) => {
  if (!str || str.length <= length) return str
  return str.slice(0, length) + '...'
}

export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const slugify = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

export const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

export const shuffleArray = (array) => {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key]
    result[group] = result[group] || []
    result[group].push(item)
    return result
  }, {})
}

export const debounce = (fn, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export const throttle = (fn, limit) => {
  let inThrottle
  return (...args) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const isValidPhone = (phone) => {
  return /^[\d\s+\-()]{7,20}$/.test(phone)
}

export const getInitials = (name) => {
  if (!name) return ''
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const getAgeFromBirthDate = (birthDate) => {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}
