import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import ThemeToggle from '../../components/common/ThemeToggle'
import LanguageSelector from '../../components/common/LanguageSelector'
import { adminTranslations } from '../../i18n/admin'
import './LoginPage.css'

function LoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated, loading: authLoading } = useAuth()
  const { language } = useLanguage()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Get translations
  const t = (key) => adminTranslations.login?.[language]?.[key] || adminTranslations.login?.en?.[key] || key
  const tc = (key) => adminTranslations.common?.[language]?.[key] || adminTranslations.common?.en?.[key] || key

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [isAuthenticated, authLoading, navigate])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.username.trim()) {
      newErrors.username = tc('required')
    }
    
    if (!formData.password) {
      newErrors.password = tc('required')
    } else if (formData.password.length < 3) {
      newErrors.password = `${tc('minLength') || 'Kamida'} 3 ${tc('characters') || 'belgi'}`
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    if (serverError) {
      setServerError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setServerError('')

    try {
      const result = await login({ username: formData.username, password: formData.password })
      if (result.success) {
        navigate('/admin/dashboard', { replace: true })
      } else {
        setServerError(result.error || t('invalidCredentials'))
      }
    } catch (error) {
      setServerError(t('invalidCredentials'))
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="login-page">
        <div className="login-background">
          <div className="login-shapes">
            <div className="login-shape"></div>
            <div className="login-shape"></div>
            <div className="login-shape"></div>
            <div className="login-shape"></div>
          </div>
        </div>
        <div className="login-container">
          <div className="login-loading">
            <div className="login-spinner"></div>
            <p>{tc('loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  // Don't render if authenticated (will redirect)
  if (isAuthenticated) {
    return null
  }

  return (
    <div className="login-page">
      {/* Animated Background */}
      <div className="login-background">
        <div className="login-shapes">
          <div className="login-shape"></div>
          <div className="login-shape"></div>
          <div className="login-shape"></div>
          <div className="login-shape"></div>
        </div>
      </div>

      {/* Theme & Language Controls */}
      <div className="login-controls">
        <LanguageSelector />
        <ThemeToggle />
      </div>
      
      <div className="login-container">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
        </div>

        {/* Header */}
        <div className="login-header">
          <h1 className="login-title">{t('title')}</h1>
          <p className="login-subtitle">{t('subtitle')}</p>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          {serverError && (
            <div className="login-error-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              {serverError}
            </div>
          )}

          {/* Username Input */}
          <div className="login-input-group">
            <label htmlFor="username">{t('username')}</label>
            <div className={`login-input-wrapper ${errors.username ? 'has-error' : ''}`}>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="admin"
                disabled={isLoading}
                autoComplete="username"
              />
              <span className="login-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
            </div>
            {errors.username && (
              <span className="login-input-error">{errors.username}</span>
            )}
          </div>

          {/* Password Input */}
          <div className="login-input-group">
            <label htmlFor="password">{t('password')}</label>
            <div className={`login-input-wrapper ${errors.password ? 'has-error' : ''}`}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <span className="login-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <span className="login-input-error">{errors.password}</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="login-btn-spinner"></span>
                {tc('loading')}
              </>
            ) : (
              t('loginButton')
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <Link to="/" className="back-link">
            ← {t('backToHome')}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
