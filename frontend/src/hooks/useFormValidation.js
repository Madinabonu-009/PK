/**
 * Form Validation Hook
 * Issue #4, #34: Input validation va real-time feedback
 */

import { useState, useCallback, useMemo } from 'react'
import { VALIDATION } from '../constants'
import { sanitizeString, sanitizeEmail, sanitizePhone } from '../utils/sanitize'

// Validation rules
const validators = {
  required: (value) => {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim().length > 0
    if (Array.isArray(value)) return value.length > 0
    return true
  },

  email: (value) => {
    if (!value) return true // Let required handle empty
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value.trim())
  },

  phone: (value) => {
    if (!value) return true
    const phoneRegex = /^[\d\s+\-()]{7,20}$/
    return phoneRegex.test(value.trim())
  },

  minLength: (min) => (value) => {
    if (!value) return true
    return value.length >= min
  },

  maxLength: (max) => (value) => {
    if (!value) return true
    return value.length <= max
  },

  min: (minVal) => (value) => {
    if (value === '' || value === null || value === undefined) return true
    return Number(value) >= minVal
  },

  max: (maxVal) => (value) => {
    if (value === '' || value === null || value === undefined) return true
    return Number(value) <= maxVal
  },

  pattern: (regex) => (value) => {
    if (!value) return true
    return regex.test(value)
  },

  match: (fieldName) => (value, values) => {
    if (!value) return true
    return value === values[fieldName]
  },

  password: (value) => {
    if (!value) return true
    // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    return passwordRegex.test(value)
  },

  url: (value) => {
    if (!value) return true
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  },

  date: (value) => {
    if (!value) return true
    const date = new Date(value)
    return !isNaN(date.getTime())
  },

  custom: (fn) => fn
}

// Error messages
const errorMessages = {
  uz: {
    required: "Bu maydon to'ldirilishi shart",
    email: "Email manzil noto'g'ri",
    phone: "Telefon raqam noto'g'ri",
    minLength: (min) => `Kamida ${min} ta belgi bo'lishi kerak`,
    maxLength: (max) => `Ko'pi bilan ${max} ta belgi bo'lishi mumkin`,
    min: (min) => `Qiymat ${min} dan kam bo'lmasligi kerak`,
    max: (max) => `Qiymat ${max} dan oshmasligi kerak`,
    pattern: "Format noto'g'ri",
    match: "Qiymatlar mos kelmaydi",
    password: "Parol kamida 8 ta belgi, 1 katta harf, 1 kichik harf va 1 raqam bo'lishi kerak",
    url: "URL manzil noto'g'ri",
    date: "Sana noto'g'ri"
  },
  ru: {
    required: "Это поле обязательно",
    email: "Неверный email",
    phone: "Неверный номер телефона",
    minLength: (min) => `Минимум ${min} символов`,
    maxLength: (max) => `Максимум ${max} символов`,
    min: (min) => `Значение не менее ${min}`,
    max: (max) => `Значение не более ${max}`,
    pattern: "Неверный формат",
    match: "Значения не совпадают",
    password: "Пароль: минимум 8 символов, 1 заглавная, 1 строчная буква и 1 цифра",
    url: "Неверный URL",
    date: "Неверная дата"
  },
  en: {
    required: "This field is required",
    email: "Invalid email address",
    phone: "Invalid phone number",
    minLength: (min) => `Minimum ${min} characters`,
    maxLength: (max) => `Maximum ${max} characters`,
    min: (min) => `Value must be at least ${min}`,
    max: (max) => `Value must be at most ${max}`,
    pattern: "Invalid format",
    match: "Values do not match",
    password: "Password: min 8 chars, 1 uppercase, 1 lowercase, 1 number",
    url: "Invalid URL",
    date: "Invalid date"
  }
}

export function useFormValidation(initialValues, validationSchema, language = 'uz') {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const messages = errorMessages[language] || errorMessages.en

  // Validate single field
  const validateField = useCallback((name, value, allValues = values) => {
    const rules = validationSchema[name]
    if (!rules) return ''

    for (const rule of rules) {
      let isValid = true
      let errorMsg = ''

      if (typeof rule === 'string') {
        // Simple rule like 'required', 'email'
        isValid = validators[rule]?.(value, allValues) ?? true
        errorMsg = messages[rule]
      } else if (typeof rule === 'object') {
        // Rule with params like { minLength: 8 }
        const [ruleName, param] = Object.entries(rule)[0]
        const validator = validators[ruleName]
        
        if (typeof validator === 'function') {
          const validatorFn = validator(param)
          isValid = typeof validatorFn === 'function' ? validatorFn(value, allValues) : validatorFn
        }
        
        const msgFn = messages[ruleName]
        errorMsg = typeof msgFn === 'function' ? msgFn(param) : msgFn
      }

      if (!isValid) {
        return errorMsg || 'Invalid value'
      }
    }

    return ''
  }, [validationSchema, values, messages])

  // Validate all fields
  const validateAll = useCallback(() => {
    const newErrors = {}
    let isValid = true

    for (const name of Object.keys(validationSchema)) {
      const error = validateField(name, values[name], values)
      if (error) {
        newErrors[name] = error
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }, [validationSchema, values, validateField])

  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value

    setValues(prev => ({ ...prev, [name]: newValue }))

    // Validate on change if field was touched
    if (touched[name]) {
      const error = validateField(name, newValue)
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }, [touched, validateField])

  // Handle blur
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    
    const error = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: error }))
  }, [validateField])

  // Set field value programmatically
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }))
    if (touched[name]) {
      const error = validateField(name, value)
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }, [touched, validateField])

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  // Handle submit
  const handleSubmit = useCallback((onSubmit) => async (e) => {
    e?.preventDefault()
    
    // Touch all fields
    const allTouched = Object.keys(validationSchema).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {})
    setTouched(allTouched)

    const isValid = validateAll()
    if (!isValid) return

    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } finally {
      setIsSubmitting(false)
    }
  }, [validationSchema, validateAll, values])

  // Computed values
  const isValid = useMemo(() => {
    return Object.keys(errors).every(key => !errors[key])
  }, [errors])

  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues)
  }, [values, initialValues])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setValues,
    setErrors,
    resetForm,
    validateField,
    validateAll
  }
}

export default useFormValidation
