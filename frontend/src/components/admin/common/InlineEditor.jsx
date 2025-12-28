import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './InlineEditor.css'

// Inline Text Editor
export function InlineTextEditor({
  value,
  onSave,
  onCancel,
  placeholder = "Matn kiriting...",
  validation,
  autoFocus = true,
  multiline = false
}) {
  const [editValue, setEditValue] = useState(value || '')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [autoFocus])

  const validate = (val) => {
    if (validation) {
      const result = validation(val)
      if (result !== true) {
        setError(result)
        return false
      }
    }
    setError(null)
    return true
  }

  const handleSave = async () => {
    if (!validate(editValue)) return
    
    setSaving(true)
    try {
      await onSave(editValue)
    } catch (err) {
      setError(err.message || 'Xatolik yuz berdi')
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      onCancel?.()
    }
  }

  const InputComponent = multiline ? 'textarea' : 'input'

  return (
    <div className="inline-editor">
      <InputComponent
        ref={inputRef}
        type="text"
        className={`inline-editor-input ${error ? 'error' : ''} ${multiline ? 'multiline' : ''}`}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => validate(editValue)}
        placeholder={placeholder}
        disabled={saving}
      />
      
      <div className="inline-editor-actions">
        <button
          className="inline-editor-btn save"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? '...' : '✓'}
        </button>
        <button
          className="inline-editor-btn cancel"
          onClick={onCancel}
          disabled={saving}
        >
          ✕
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.span
            className="inline-editor-error"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

// Inline Select Editor
export function InlineSelectEditor({
  value,
  options = [],
  onSave,
  onCancel,
  placeholder = "Tanlang..."
}) {
  const [editValue, setEditValue] = useState(value || '')
  const [saving, setSaving] = useState(false)
  const selectRef = useRef(null)

  useEffect(() => {
    if (selectRef.current) {
      selectRef.current.focus()
    }
  }, [])

  const handleChange = async (e) => {
    const newValue = e.target.value
    setEditValue(newValue)
    
    setSaving(true)
    try {
      await onSave(newValue)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="inline-editor inline-editor--select">
      <select
        ref={selectRef}
        className="inline-editor-select"
        value={editValue}
        onChange={handleChange}
        onBlur={onCancel}
        disabled={saving}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {saving && <span className="inline-editor-spinner" />}
    </div>
  )
}

// Inline Number Editor
export function InlineNumberEditor({
  value,
  onSave,
  onCancel,
  min,
  max,
  step = 1,
  suffix = '',
  validation
}) {
  const [editValue, setEditValue] = useState(value || 0)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [])

  const validate = (val) => {
    const num = Number(val)
    if (isNaN(num)) {
      setError('Raqam kiriting')
      return false
    }
    if (min !== undefined && num < min) {
      setError(`Minimal: ${min}`)
      return false
    }
    if (max !== undefined && num > max) {
      setError(`Maksimal: ${max}`)
      return false
    }
    if (validation) {
      const result = validation(num)
      if (result !== true) {
        setError(result)
        return false
      }
    }
    setError(null)
    return true
  }

  const handleSave = async () => {
    if (!validate(editValue)) return
    
    setSaving(true)
    try {
      await onSave(Number(editValue))
    } catch (err) {
      setError(err.message || 'Xatolik yuz berdi')
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      onCancel?.()
    }
  }

  return (
    <div className="inline-editor">
      <div className="inline-editor-number-wrapper">
        <input
          ref={inputRef}
          type="number"
          className={`inline-editor-input inline-editor-number ${error ? 'error' : ''}`}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => validate(editValue)}
          min={min}
          max={max}
          step={step}
          disabled={saving}
        />
        {suffix && <span className="inline-editor-suffix">{suffix}</span>}
      </div>
      
      <div className="inline-editor-actions">
        <button
          className="inline-editor-btn save"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? '...' : '✓'}
        </button>
        <button
          className="inline-editor-btn cancel"
          onClick={onCancel}
          disabled={saving}
        >
          ✕
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.span
            className="inline-editor-error"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

// Inline Date Editor
export function InlineDateEditor({
  value,
  onSave,
  onCancel,
  min,
  max
}) {
  const [editValue, setEditValue] = useState(value || '')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(editValue)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      onCancel?.()
    }
  }

  return (
    <div className="inline-editor">
      <input
        ref={inputRef}
        type="date"
        className="inline-editor-input inline-editor-date"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        min={min}
        max={max}
        disabled={saving}
      />
      
      <div className="inline-editor-actions">
        <button
          className="inline-editor-btn save"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? '...' : '✓'}
        </button>
        <button
          className="inline-editor-btn cancel"
          onClick={onCancel}
          disabled={saving}
        >
          ✕
        </button>
      </div>
    </div>
  )
}

// Editable Cell Wrapper
export function EditableCell({
  value,
  type = 'text',
  editable = true,
  onSave,
  options,
  ...props
}) {
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = async (newValue) => {
    await onSave(newValue)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  if (!editable) {
    return <span className="editable-cell-value">{value}</span>
  }

  if (isEditing) {
    switch (type) {
      case 'select':
        return (
          <InlineSelectEditor
            value={value}
            options={options}
            onSave={handleSave}
            onCancel={handleCancel}
            {...props}
          />
        )
      case 'number':
        return (
          <InlineNumberEditor
            value={value}
            onSave={handleSave}
            onCancel={handleCancel}
            {...props}
          />
        )
      case 'date':
        return (
          <InlineDateEditor
            value={value}
            onSave={handleSave}
            onCancel={handleCancel}
            {...props}
          />
        )
      default:
        return (
          <InlineTextEditor
            value={value}
            onSave={handleSave}
            onCancel={handleCancel}
            {...props}
          />
        )
    }
  }

  return (
    <span 
      className="editable-cell-value editable"
      onClick={() => setIsEditing(true)}
      title="Tahrirlash uchun bosing"
    >
      {value || <span className="editable-cell-empty">—</span>}
      <span className="editable-cell-icon">✏️</span>
    </span>
  )
}

export default {
  InlineTextEditor,
  InlineSelectEditor,
  InlineNumberEditor,
  InlineDateEditor,
  EditableCell
}
