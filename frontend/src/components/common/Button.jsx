import { memo, forwardRef } from 'react'
import PropTypes from 'prop-types'
import './Button.css'

const Button = memo(forwardRef(function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  ariaLabel,
  ariaDescribedBy,
  ariaExpanded,
  ariaControls,
  ariaPressed,
  ...props
}, ref) {
  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault()
      return
    }
    onClick?.(e)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick(e)
    }
  }

  const buttonClasses = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth && 'btn-full-width',
    loading && 'btn-loading-state',
    icon && !children && 'btn-icon-only',
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-pressed={ariaPressed}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="btn-loading" role="status">
          <span className="btn-spinner" aria-hidden="true" />
          <span className="btn-loading-text">Yuklanmoqda...</span>
        </span>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="btn-icon btn-icon-left" aria-hidden="true">{icon}</span>
          )}
          {children && <span className="btn-text">{children}</span>}
          {icon && iconPosition === 'right' && (
            <span className="btn-icon btn-icon-right" aria-hidden="true">{icon}</span>
          )}
        </>
      )}
    </button>
  )
}))

Button.propTypes = {
  children: PropTypes.node,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success', 'warning', 'ghost', 'link']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  fullWidth: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  ariaLabel: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
  ariaExpanded: PropTypes.bool,
  ariaControls: PropTypes.string,
  ariaPressed: PropTypes.bool
}

export default Button
