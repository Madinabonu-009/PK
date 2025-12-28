import { Component } from 'react'
import { motion } from 'framer-motion'
import './ErrorBoundary.css'

// Error Fallback Component
function ErrorFallback({ error, resetError, componentName }) {
  return (
    <motion.div
      className="error-fallback"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="error-icon">⚠️</div>
      <h3 className="error-title">Xatolik yuz berdi</h3>
      <p className="error-message">
        {componentName && <span className="error-component">{componentName}:</span>}
        {error?.message || "Kutilmagan xatolik yuz berdi"}
      </p>
      
      {process.env.NODE_ENV === 'development' && error?.stack && (
        <details className="error-details">
          <summary>Texnik ma'lumot</summary>
          <pre className="error-stack">{error.stack}</pre>
        </details>
      )}

      <div className="error-actions">
        <button className="error-btn retry" onClick={resetError}>
          🔄 Qayta urinish
        </button>
        <button className="error-btn reload" onClick={() => window.location.reload()}>
          🔃 Sahifani yangilash
        </button>
      </div>
    </motion.div>
  )
}

// Error Boundary Class Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Call onError callback if provided
    this.props.onError?.(error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback({ error: this.state.error, resetError: this.resetError })
          : this.props.fallback
      }

      return (
        <ErrorFallback
          error={this.state.error}
          resetError={this.resetError}
          componentName={this.props.componentName}
        />
      )
    }

    return this.props.children
  }
}

// Inline Error Component (for smaller errors)
function InlineError({ message, onRetry }) {
  return (
    <div className="inline-error">
      <span className="inline-error-icon">⚠️</span>
      <span className="inline-error-message">{message}</span>
      {onRetry && (
        <button className="inline-error-retry" onClick={onRetry}>
          Qayta urinish
        </button>
      )}
    </div>
  )
}

// Toast Error Component
function ToastError({ message, onClose, autoClose = 5000 }) {
  return (
    <motion.div
      className="toast-error"
      initial={{ opacity: 0, y: 50, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: 50, x: '-50%' }}
      transition={{ duration: 0.3 }}
    >
      <span className="toast-icon">❌</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>✕</button>
    </motion.div>
  )
}

// Network Error Component
function NetworkError({ onRetry }) {
  return (
    <div className="network-error">
      <div className="network-error-icon">📡</div>
      <h3>Internet aloqasi yo'q</h3>
      <p>Iltimos, internet aloqangizni tekshiring va qayta urinib ko'ring.</p>
      <button className="network-error-btn" onClick={onRetry}>
        🔄 Qayta urinish
      </button>
    </div>
  )
}

// 404 Not Found Component
function NotFound({ message = "Sahifa topilmadi", onGoBack }) {
  return (
    <div className="not-found">
      <div className="not-found-code">404</div>
      <h3 className="not-found-title">{message}</h3>
      <p className="not-found-desc">Siz qidirayotgan sahifa mavjud emas yoki o'chirilgan.</p>
      <button className="not-found-btn" onClick={onGoBack || (() => window.history.back())}>
        ← Orqaga qaytish
      </button>
    </div>
  )
}

// Empty State Component
function EmptyState({ 
  icon = '📭', 
  title = "Ma'lumot topilmadi", 
  description,
  action,
  actionLabel 
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-desc">{description}</p>}
      {action && (
        <button className="empty-state-btn" onClick={action}>
          {actionLabel || "Qo'shish"}
        </button>
      )}
    </div>
  )
}

export default ErrorBoundary
export { 
  ErrorBoundary, 
  ErrorFallback, 
  InlineError, 
  ToastError, 
  NetworkError, 
  NotFound, 
  EmptyState 
}
