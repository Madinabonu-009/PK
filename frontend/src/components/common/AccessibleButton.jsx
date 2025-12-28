/**
 * Accessible Button Component
 * Issues Fixed: #35, #36, #37, #39 - Keyboard navigation, focus, touch targets, ARIA
 */

import { forwardRef, useCallback, useRef } from 'react'
import './AccessibleButton.css'

const AccessibleButton = forwardRef(function AccessibleButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary', // primary, secondary, outline, ghost, danger
  size = 'medium', // small, medium, large
  fullWidth = false,
  icon,
  iconPosition = 'left',
  ariaLabel,
  ariaDescribedBy,
  ariaExpanded,
  ariaHaspopup,
  ariaControls,
  type = 'button',
  className = '',
  ...props
}, ref) {
  const buttonRef = useRef(null)
  const combinedRef = ref || buttonRef

  // Handle keyboard events
  const handleKeyDown = useCallback((e) => {
    // Enter or Space triggers click
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (!disabled && !loading) {
        onClick?.(e)
      }
    }
  }, [disabled, loading, onClick])

  // Handle click
  const handleClick = useCallback((e) => {
    if (!disabled && !loading) {
      onClick?.(e)
    }
  }, [disabled, loading, onClick])

  const classes = [
    'accessible-btn',
    `accessible-btn--${variant}`,
    `accessible-btn--${size}`,
    fullWidth && 'accessible-btn--full-width',
    loading && 'accessible-btn--loading',
    disabled && 'accessible-btn--disabled',
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      ref={combinedRef}
      type={type}
      className={classes}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-expanded={ariaExpanded}
      aria-haspopup={ariaHaspopup}
      aria-controls={ariaControls}
      aria-busy={loading}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      {...props}
    >
      {loading && (
        <span className="accessible-btn__spinner" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="spinner-icon">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="60" strokeLinecap="round" />
          </svg>
        </span>
      )}
      
      {icon && iconPosition === 'left' && !loading && (
        <span className="accessible-btn__icon accessible-btn__icon--left" aria-hidden="true">
          {icon}
        </span>
      )}
      
      <span className="accessible-btn__text">
        {loading ? (
          <span className="sr-only">Loading...</span>
        ) : null}
        {children}
      </span>
      
      {icon && iconPosition === 'right' && !loading && (
        <span className="accessible-btn__icon accessible-btn__icon--right" aria-hidden="true">
          {icon}
        </span>
      )}
    </button>
  )
})

export default AccessibleButton
