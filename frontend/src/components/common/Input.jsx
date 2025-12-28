import { forwardRef, useState, useCallback, memo, useId } from 'react'
import PropTypes from 'prop-types'
import './Input.css'

const Input = memo(forwardRef(function Input({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  readOnly = false,
  className = '',
  size = 'medium',
  variant = 'outlined',
  icon,
  iconPosition = 'left',
  clearable = false,
  onClear,
  maxLength,
  showCharCount = false,
  validate,
  validateOnBlur = true,
  validateOnChange = false,
  autoComplete,
  inputMode,
  pattern,
  min,
  max,
  step,
  ...props
}, ref) {
  const uniqueId = useId()
  const inputId = name || uniqueId
  const errorId = `${inputId}-error`
  const helperId = `${inputId}-helper`
  
  const [isFocused, setIsFocused] = useState(false)
  const [localError, setLocalError] = useState('')
  const [touched, setTouched] = useState(false)

  const displayError = error || localError

  // Validation
  const runValidation = useCallback((val) => {
    if (!validate) return ''
    const result = validate(val)
    return typeof result === 'string' ? result : ''
  }, [validate])

  const handleChange = useCallback((e) => {
    const newValue = e.target.value
    onChange?.(e)
    
    if (validateOnChange && touched) {
      setLocalError(runValidation(newValue))
    }
  }, [onChange, validateOnChange, touched, runValidation])

  const handleBlur = useCallback((e) => {
    setIsFocused(false)
    setTouched(true)
    onBlur?.(e)
    
    if (validateOnBlur) {
      setLocalError(runValidation(e.target.value))
    }
  }, [onBlur, validateOnBlur, runValidation])

  const handleFocus = useCallback((e) => {
    setIsFocused(true)
    onFocus?.(e)
  }, [onFocus])

  const handleClear = useCallback(() => {
    const syntheticEvent = {
      target: { name, value: '' },
      currentTarget: { name, value: '' }
    }
    onChange?.(syntheticEvent)
    onClear?.()
    setLocalError('')
  }, [name, onChange, onClear])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && clearable && value) {
      handleClear()
    }
  }, [clearable, value, handleClear])

  const inputClasses = [
    'input-group',
    `input-${size}`,
    `input-${variant}`,
    displayError && 'input-error',
    isFocused && 'input-focused',
    disabled && 'input-disabled',
    readOnly && 'input-readonly',
    icon && `input-with-icon input-icon-${iconPosition}`,
    className
  ].filter(Boolean).join(' ')

  const charCount = value?.length || 0

  return (
    <div className={inputClasses}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="input-required" aria-hidden="true">*</span>}
        </label>
      )}
      
      <div className="input-wrapper">
        {icon && iconPosition === 'left' && (
          <span className="input-icon" aria-hidden="true">{icon}</span>
        )}
        
        <input
          ref={ref}
          type={type}
          id={inputId}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          maxLength={maxLength}
          autoComplete={autoComplete}
          inputMode={inputMode}
          pattern={pattern}
          min={min}
          max={max}
          step={step}
          className="input-field"
          aria-invalid={!!displayError}
          aria-describedby={[
            displayError && errorId,
            helperText && helperId
          ].filter(Boolean).join(' ') || undefined}
          aria-required={required}
          {...props}
        />
        
        {icon && iconPosition === 'right' && !clearable && (
          <span className="input-icon" aria-hidden="true">{icon}</span>
        )}
        
        {clearable && value && !disabled && !readOnly && (
          <button
            type="button"
            className="input-clear"
            onClick={handleClear}
            aria-label="Tozalash"
            tabIndex={-1}
          >
            ×
          </button>
        )}
      </div>

      <div className="input-footer">
        {displayError && (
          <span id={errorId} className="input-error-message" role="alert">
            {displayError}
          </span>
        )}
        
        {!displayError && helperText && (
          <span id={helperId} className="input-helper-text">
            {helperText}
          </span>
        )}
        
        {showCharCount && maxLength && (
          <span className={`input-char-count ${charCount >= maxLength ? 'at-limit' : ''}`}>
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  )
}))

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  className: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['outlined', 'filled', 'underlined']),
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  clearable: PropTypes.bool,
  onClear: PropTypes.func,
  maxLength: PropTypes.number,
  showCharCount: PropTypes.bool,
  validate: PropTypes.func,
  validateOnBlur: PropTypes.bool,
  validateOnChange: PropTypes.bool,
  autoComplete: PropTypes.string,
  inputMode: PropTypes.string,
  pattern: PropTypes.string,
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  step: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}

export default Input
