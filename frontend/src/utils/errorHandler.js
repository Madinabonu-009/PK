/**
 * Error Handler Utility
 * User-friendly error messages va error handling
 */

// Error tiplarini aniqlash
export const ERROR_TYPES = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  NOT_FOUND: 'not_found',
  SERVER: 'server',
  UNKNOWN: 'unknown'
}

// User-friendly error messages (3 til)
export const ERROR_MESSAGES = {
  uz: {
    network: 'Internet aloqasi yo\'q. Iltimos, ulanishni tekshiring.',
    validation: 'Kiritilgan ma\'lumotlar noto\'g\'ri. Iltimos, qaytadan tekshiring.',
    authentication: 'Tizimga kirish talab qilinadi. Iltimos, qaytadan kiring.',
    authorization: 'Sizda bu amalni bajarish uchun ruxsat yo\'q.',
    not_found: 'So\'ralgan ma\'lumot topilmadi.',
    server: 'Server xatoligi. Iltimos, keyinroq qaytadan urinib ko\'ring.',
    unknown: 'Kutilmagan xatolik yuz berdi. Iltimos, sahifani yangilang.',
    timeout: 'So\'rov vaqti tugadi. Iltimos, qaytadan urinib ko\'ring.',
    file_too_large: 'Fayl hajmi juda katta. Maksimal: 5MB',
    invalid_file_type: 'Noto\'g\'ri fayl turi. Faqat rasm fayllari qabul qilinadi.',
    form_error: 'Forma to\'ldirishda xatolik. Barcha maydonlarni to\'ldiring.',
    duplicate: 'Bu ma\'lumot allaqachon mavjud.',
    rate_limit: 'Juda ko\'p so\'rov yuborildi. Iltimos, biroz kuting.'
  },
  ru: {
    network: 'Нет подключения к интернету. Проверьте соединение.',
    validation: 'Введены неверные данные. Проверьте еще раз.',
    authentication: 'Требуется вход в систему. Пожалуйста, войдите снова.',
    authorization: 'У вас нет прав для выполнения этого действия.',
    not_found: 'Запрошенные данные не найдены.',
    server: 'Ошибка сервера. Попробуйте позже.',
    unknown: 'Произошла непредвиденная ошибка. Обновите страницу.',
    timeout: 'Истекло время ожидания запроса. Попробуйте снова.',
    file_too_large: 'Размер файла слишком большой. Максимум: 5МБ',
    invalid_file_type: 'Неверный тип файла. Принимаются только изображения.',
    form_error: 'Ошибка заполнения формы. Заполните все поля.',
    duplicate: 'Эти данные уже существуют.',
    rate_limit: 'Слишком много запросов. Подождите немного.'
  },
  en: {
    network: 'No internet connection. Please check your connection.',
    validation: 'Invalid data entered. Please check again.',
    authentication: 'Authentication required. Please log in again.',
    authorization: 'You don\'t have permission to perform this action.',
    not_found: 'Requested data not found.',
    server: 'Server error. Please try again later.',
    unknown: 'An unexpected error occurred. Please refresh the page.',
    timeout: 'Request timeout. Please try again.',
    file_too_large: 'File size too large. Maximum: 5MB',
    invalid_file_type: 'Invalid file type. Only images are accepted.',
    form_error: 'Form validation error. Fill in all fields.',
    duplicate: 'This data already exists.',
    rate_limit: 'Too many requests. Please wait a moment.'
  }
}

/**
 * API error'ni parse qilish va error type aniqlash
 */
export const parseApiError = (error) => {
  // Network error
  if (!error.response) {
    return {
      type: ERROR_TYPES.NETWORK,
      message: error.message,
      statusCode: null
    }
  }

  const { status, data } = error.response

  // Status code bo'yicha error type aniqlash
  let type = ERROR_TYPES.UNKNOWN
  
  if (status === 401) {
    type = ERROR_TYPES.AUTHENTICATION
  } else if (status === 403) {
    type = ERROR_TYPES.AUTHORIZATION
  } else if (status === 404) {
    type = ERROR_TYPES.NOT_FOUND
  } else if (status === 422 || status === 400) {
    type = ERROR_TYPES.VALIDATION
  } else if (status === 429) {
    type = 'rate_limit'
  } else if (status >= 500) {
    type = ERROR_TYPES.SERVER
  }

  return {
    type,
    message: data?.error || data?.message || error.message,
    statusCode: status,
    details: data?.details || null,
    field: data?.field || null
  }
}

/**
 * User-friendly error message olish
 */
export const getUserFriendlyMessage = (error, language = 'uz') => {
  const parsed = parseApiError(error)
  const messages = ERROR_MESSAGES[language] || ERROR_MESSAGES.uz
  
  // Custom message bo'lsa
  if (parsed.message && !parsed.message.includes('Error:') && !parsed.message.includes('Failed')) {
    return parsed.message
  }
  
  // Default message by type
  return messages[parsed.type] || messages.unknown
}

/**
 * Form validation error'larini format qilish
 */
export const formatValidationErrors = (errors) => {
  if (!errors || typeof errors !== 'object') return {}
  
  const formatted = {}
  Object.keys(errors).forEach(key => {
    const error = errors[key]
    if (typeof error === 'string') {
      formatted[key] = error
    } else if (error?.message) {
      formatted[key] = error.message
    } else if (Array.isArray(error) && error.length > 0) {
      formatted[key] = error[0]
    }
  })
  
  return formatted
}

/**
 * Error'ni console'ga log qilish (development uchun)
 */
export const logError = (error, context = {}) => {
  if (process.env.NODE_ENV === 'development') {
    console.group('🔴 Error Log')
    console.error('Error:', error)
    console.log('Context:', context)
    console.log('Timestamp:', new Date().toISOString())
    console.groupEnd()
  }
  
  // Production'da Sentry yoki boshqa service'ga yuborish
  if (process.env.NODE_ENV === 'production' && window.Sentry) {
    window.Sentry.captureException(error, {
      contexts: { custom: context }
    })
  }
}

/**
 * File upload error handling
 */
export const handleFileError = (file, maxSize = 5 * 1024 * 1024, allowedTypes = ['image/']) => {
  const errors = []
  
  // Size check
  if (file.size > maxSize) {
    errors.push({
      type: 'file_too_large',
      message: ERROR_MESSAGES.uz.file_too_large
    })
  }
  
  // Type check
  const isAllowed = allowedTypes.some(type => file.type.startsWith(type))
  if (!isAllowed) {
    errors.push({
      type: 'invalid_file_type',
      message: ERROR_MESSAGES.uz.invalid_file_type
    })
  }
  
  return errors
}

/**
 * Retry logic wrapper
 */
export const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      // Network error bo'lsa retry qilish
      if (!error.response && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
        continue
      }
      
      throw error
    }
  }
  
  throw lastError
}

/**
 * Safe JSON parse
 */
export const safeJsonParse = (json, fallback = null) => {
  try {
    return JSON.parse(json)
  } catch (error) {
    logError(error, { json })
    return fallback
  }
}

export default {
  ERROR_TYPES,
  ERROR_MESSAGES,
  parseApiError,
  getUserFriendlyMessage,
  formatValidationErrors,
  logError,
  handleFileError,
  retryOperation,
  safeJsonParse
}
