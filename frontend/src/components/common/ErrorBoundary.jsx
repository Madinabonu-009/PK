import React from 'react'
import './ErrorBoundary.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }))

    // Send to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo)
    }
  }

  logErrorToService = (error, errorInfo) => {
    // TODO: Integrate with Sentry, LogRocket, etc.
    try {
      const errorData = {
        message: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      }

      // Send to backend
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData)
      }).catch(() => {
        // Silently fail if error logging fails
      })
    } catch (e) {
      // Prevent error logging from causing more errors
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })

    // Optionally reload the page if errors persist
    if (this.state.errorCount > 3) {
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      const { fallback, showDetails = false } = this.props
      const { error, errorInfo, errorCount } = this.state

      // Custom fallback UI
      if (fallback) {
        return fallback({ error, errorInfo, reset: this.handleReset })
      }

      // Default error UI
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-icon">⚠️</div>
            <h1>Nimadir xato ketdi</h1>
            <p>Kechirasiz, kutilmagan xatolik yuz berdi.</p>

            {errorCount > 2 && (
              <div className="error-warning">
                <p>Ko'p xatolar aniqlandi. Sahifani yangilash tavsiya etiladi.</p>
              </div>
            )}

            <div className="error-actions">
              <button onClick={this.handleReset} className="btn-primary">
                Qayta urinish
              </button>
              <button onClick={() => window.location.href = '/'} className="btn-secondary">
                Bosh sahifaga qaytish
              </button>
            </div>

            {(showDetails || process.env.NODE_ENV === 'development') && error && (
              <details className="error-details">
                <summary>Texnik ma'lumotlar</summary>
                <div className="error-stack">
                  <h3>Xato:</h3>
                  <pre>{error.toString()}</pre>

                  {error.stack && (
                    <>
                      <h3>Stack Trace:</h3>
                      <pre>{error.stack}</pre>
                    </>
                  )}

                  {errorInfo && errorInfo.componentStack && (
                    <>
                      <h3>Component Stack:</h3>
                      <pre>{errorInfo.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

// HOC for wrapping components with error boundary
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  return (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )
}
