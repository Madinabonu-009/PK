import { forwardRef } from 'react'
import './Select.css'

const Select = forwardRef(({
  label,
  name,
  value,
  onChange,
  onBlur,
  options = [],
  placeholder = 'Tanlang...',
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`select-group ${error ? 'select-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={name} className="select-label">
          {label}
          {required && <span className="select-required">*</span>}
        </label>
      )}
      <div className="select-wrapper">
        <select
          ref={ref}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className="select-field"
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="select-arrow">▼</span>
      </div>
      {error && (
        <span id={`${name}-error`} className="select-error-message">
          {error}
        </span>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Select
