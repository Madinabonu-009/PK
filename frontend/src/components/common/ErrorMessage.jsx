/**
 * Error Message Component
 * Issue #5, #32: Error handling va error states
 */

import { memo } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { ERROR_MESSAGES } from '../../constants'
import './ErrorMessage.css'

const ErrorMessage = memo(function ErrorMessage({ 
  error, 
  onRetry, 
  fullPage = false,
  showIcon = true 
}) {
  const { language } = useLanguage()
  const messages = ERROR_MESSAGES[language] || ERROR_MESSAGES.en

  // Parse error to user-friendly message
  const getMessage = () => {
    if (!error) return messages.SERVER_ERROR

    // Network error
    if (error.message === 'Network Error' || !navigator.onLine) {
      return messages.NETWORK_ERROR
    }

    // HTTP status codes
    if (error.response) {
      const status = error.response.status
      switch (status) {
        case 400: return messages.VALIDATION_ERROR
        case 401: return messages.UNAUTHORIZED
        case 403: return messages.FORBIDDEN
        case 404: return messages.NOT_FOUND
        case 413: return messages.FILE_TOO_LARGE
        case 429: return language === 'uz' ? "Juda ko'p so'rov. Biroz kuting." : 
                         language === 'ru' ? "Слишком много запросов. Подождите." : 
                         "Too many requests. Please wait."
        case 500:
        case 502:
        case 503:
        case 504:
          return messages.SERVER_ERROR
        default:
          return error.response.data?.error || messages.SERVER_ERROR
      }
    }

    // Custom error message
    if (typeof error === 'string') return error
    if (error.message) return error.message

    return messages.SERVER_ERROR
  }

  const retryText = language === 'uz' ? "Qayta urinish" : 
                    language === 'ru' ? "Повторить" : "Try Again"

  if (fullPage) {
    return (
      <div className="error-page">
        <div className="error-content">
          {showIcon && <span className="error-icon">😕</span>}
          <h2>{language === 'uz' ? "Xatolik yuz berdi" : 
               language === 'ru' ? "Произошла ошибка" : "An error occurred"}</h2>
          <p className="error-message">{getMessage()}</p>
          {onRetry && (
            <button className="error-retry-btn" onClick={onRetry}>
              🔄 {retryText}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="error-inline" role="alert">
      {showIcon && <span className="error-icon-small">⚠️</span>}
      <span className="error-text">{getMessage()}</span>
      {onRetry && (
        <button className="error-retry-btn-small" onClick={onRetry}>
          {retryText}
        </button>
      )}
    </div>
  )
})

export default ErrorMessage
