import { forwardRef } from 'react'
import './TextArea.css'

const TextArea = forwardRef(({
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required = false,
  disabled = false,
  rows = 4,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`textarea-group ${error ? 'textarea-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={name} className="textarea-label">
          {label}
          {required && <span className="textarea-required">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className="textarea-field"
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        {...props}
      />
      {error && (
        <span id={`${name}-error`} className="textarea-error-message">
          {error}
        </span>
      )}
    </div>
  )
})

TextArea.displayName = 'TextArea'

export default TextArea
