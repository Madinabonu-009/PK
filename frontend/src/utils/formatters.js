/**
 * Formatting Utilities
 * Common formatting functions for dates, numbers, and strings
 */

/**
 * Format date to locale string
 * @param {string|Date} date - Date to format
 * @param {string} locale - Locale (default: 'uz-UZ')
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date
 */
export const formatDate = (date, locale = 'uz-UZ', options = {}) => {
  if (!date) return ''
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  }
  
  try {
    return new Date(date).toLocaleDateString(locale, defaultOptions)
  } catch (error) {
    console.error('Date formatting error:', error)
    return String(date)
  }
}

/**
 * Format date to short format
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date (DD.MM.YYYY)
 */
export const formatDateShort = (date) => {
  if (!date) return ''
  
  try {
    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}.${month}.${year}`
  } catch (error) {
    return String(date)
  }
}

/**
 * Format time
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted time (HH:MM)
 */
export const formatTime = (date) => {
  if (!date) return ''
  
  try {
    const d = new Date(date)
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  } catch (error) {
    return String(date)
  }
}

/**
 * Format date and time
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date and time
 */
export const formatDateTime = (date) => {
  if (!date) return ''
  return `${formatDateShort(date)} ${formatTime(date)}`
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return ''
  
  const now = new Date()
  const then = new Date(date)
  const diffMs = now - then
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffWeek = Math.floor(diffDay / 7)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  if (diffSec < 60) return 'hozirgina'
  if (diffMin < 60) return `${diffMin} daqiqa oldin`
  if (diffHour < 24) return `${diffHour} soat oldin`
  if (diffDay < 7) return `${diffDay} kun oldin`
  if (diffWeek < 4) return `${diffWeek} hafta oldin`
  if (diffMonth < 12) return `${diffMonth} oy oldin`
  return `${diffYear} yil oldin`
}

/**
 * Format number with thousand separators
 * @param {number} num - Number to format
 * @param {string} locale - Locale (default: 'uz-UZ')
 * @returns {string} Formatted number
 */
export const formatNumber = (num, locale = 'uz-UZ') => {
  if (num === null || num === undefined) return ''
  
  try {
    return new Intl.NumberFormat(locale).format(num)
  } catch (error) {
    return String(num)
  }
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'UZS')
 * @param {string} locale - Locale (default: 'uz-UZ')
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, currency = 'UZS', locale = 'uz-UZ') => {
  if (amount === null || amount === undefined) return ''
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  } catch (error) {
    return `${formatNumber(amount)} ${currency}`
  }
}

/**
 * Format phone number
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export const formatPhone = (phone) => {
  if (!phone) return ''
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '')
  
  // Format as +998 XX XXX XX XX
  if (digits.length === 12 && digits.startsWith('998')) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`
  }
  
  if (digits.length === 9) {
    return `+998 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`
  }
  
  return phone
}

/**
 * Format file size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = (bytes / Math.pow(1024, i)).toFixed(2)
  
  return `${size} ${units[i]}`
}

/**
 * Format percentage
 * @param {number} value - Value
 * @param {number} total - Total
 * @param {number} decimals - Decimal places (default: 1)
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, total, decimals = 1) => {
  if (!total || total === 0) return '0%'
  
  const percentage = (value / total) * 100
  return `${percentage.toFixed(decimals)}%`
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  
  return text.slice(0, maxLength).trim() + '...'
}

/**
 * Capitalize first letter
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export const capitalize = (text) => {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Format name (First Last)
 * @param {object} person - Person object with firstName and lastName
 * @returns {string} Formatted name
 */
export const formatName = (person) => {
  if (!person) return ''
  
  const { firstName, lastName, name } = person
  
  if (name) return name
  if (firstName && lastName) return `${firstName} ${lastName}`
  if (firstName) return firstName
  if (lastName) return lastName
  
  return ''
}

/**
 * Format age from birthdate
 * @param {string|Date} birthDate - Birth date
 * @returns {string} Age string
 */
export const formatAge = (birthDate) => {
  if (!birthDate) return ''
  
  const birth = new Date(birthDate)
  const now = new Date()
  
  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()
  
  if (months < 0) {
    years--
    months += 12
  }
  
  if (years === 0) {
    return `${months} oy`
  }
  
  if (months === 0) {
    return `${years} yosh`
  }
  
  return `${years} yosh ${months} oy`
}

/**
 * Format duration in minutes to hours and minutes
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes === 0) return '0 daqiqa'
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) return `${mins} daqiqa`
  if (mins === 0) return `${hours} soat`
  
  return `${hours} soat ${mins} daqiqa`
}

export default {
  formatDate,
  formatDateShort,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  formatNumber,
  formatCurrency,
  formatPhone,
  formatFileSize,
  formatPercentage,
  truncateText,
  capitalize,
  formatName,
  formatAge,
  formatDuration
}
