import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './EventForm.css'

// Event Categories with colors
const EVENT_CATEGORIES = [
  { id: 'holiday', name: 'Bayram', icon: '🎉', color: '#ef4444' },
  { id: 'meeting', name: 'Yig\'ilish', icon: '👥', color: '#3b82f6' },
  { id: 'activity', name: 'Faoliyat', icon: '🎨', color: '#10b981' },
  { id: 'excursion', name: 'Ekskursiya', icon: '🚌', color: '#f59e0b' },
  { id: 'performance', name: 'Konsert', icon: '🎭', color: '#8b5cf6' },
  { id: 'sports', name: 'Sport', icon: '⚽', color: '#06b6d4' },
  { id: 'health', name: 'Sog\'liq', icon: '🏥', color: '#ec4899' },
  { id: 'other', name: 'Boshqa', icon: '📌', color: '#6b7280' }
]

// Recurring Patterns
const RECURRING_PATTERNS = [
  { value: 'none', label: 'Takrorlanmaydi' },
  { value: 'daily', label: 'Har kuni' },
  { value: 'weekly', label: 'Har hafta' },
  { value: 'biweekly', label: 'Ikki haftada bir' },
  { value: 'monthly', label: 'Har oy' },
  { value: 'yearly', label: 'Har yil' }
]

// Attendee Groups
const ATTENDEE_GROUPS = [
  { id: 'all', name: 'Hammasi', icon: '👨‍👩‍👧‍👦' },
  { id: 'parents', name: 'Ota-onalar', icon: '👨‍👩‍👧' },
  { id: 'teachers', name: "O'qituvchilar", icon: '👩‍🏫' },
  { id: 'children', name: 'Bolalar', icon: '👶' },
  { id: 'staff', name: 'Xodimlar', icon: '👷' }
]

// Time Slots
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0')
  return [`${hour}:00`, `${hour}:30`]
}).flat()

// Event Form Component
function EventForm({
  event = null,
  selectedDate = null,
  groups = [],
  onSave,
  onCancel,
  onDelete
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'activity',
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    allDay: false,
    location: '',
    recurring: 'none',
    recurringEndDate: '',
    attendees: ['all'],
    selectedGroups: [],
    requiresRSVP: false,
    rsvpDeadline: '',
    maxAttendees: '',
    notes: '',
    color: '#10b981'
  })

  const [errors, setErrors] = useState({})
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Initialize form with event data or selected date
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        category: event.category || 'activity',
        date: event.date || '',
        startTime: event.startTime || '09:00',
        endTime: event.endTime || '10:00',
        allDay: event.allDay || false,
        location: event.location || '',
        recurring: event.recurring || 'none',
        recurringEndDate: event.recurringEndDate || '',
        attendees: event.attendees || ['all'],
        selectedGroups: event.selectedGroups || [],
        requiresRSVP: event.requiresRSVP || false,
        rsvpDeadline: event.rsvpDeadline || '',
        maxAttendees: event.maxAttendees || '',
        notes: event.notes || '',
        color: event.color || '#10b981'
      })
    } else if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: selectedDate
      }))
    }
  }, [event, selectedDate])

  // Update color when category changes
  useEffect(() => {
    const category = EVENT_CATEGORIES.find(c => c.id === formData.category)
    if (category) {
      setFormData(prev => ({ ...prev, color: category.color }))
    }
  }, [formData.category])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleAttendeeToggle = (attendeeId) => {
    if (attendeeId === 'all') {
      setFormData(prev => ({ ...prev, attendees: ['all'] }))
    } else {
      setFormData(prev => {
        const newAttendees = prev.attendees.filter(id => id !== 'all')
        if (newAttendees.includes(attendeeId)) {
          return { ...prev, attendees: newAttendees.filter(id => id !== attendeeId) }
        }
        return { ...prev, attendees: [...newAttendees, attendeeId] }
      })
    }
  }

  const handleGroupToggle = (groupId) => {
    setFormData(prev => {
      if (prev.selectedGroups.includes(groupId)) {
        return { ...prev, selectedGroups: prev.selectedGroups.filter(id => id !== groupId) }
      }
      return { ...prev, selectedGroups: [...prev.selectedGroups, groupId] }
    })
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = 'Sarlavha kiritilishi shart'
    if (!formData.date) newErrors.date = 'Sana tanlanishi shart'
    if (!formData.allDay && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'Tugash vaqti boshlanish vaqtidan keyin bo\'lishi kerak'
    }
    if (formData.recurring !== 'none' && !formData.recurringEndDate) {
      newErrors.recurringEndDate = 'Takrorlash tugash sanasi kiritilishi shart'
    }
    if (formData.requiresRSVP && !formData.rsvpDeadline) {
      newErrors.rsvpDeadline = 'RSVP muddati kiritilishi shart'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSave?.({
        ...formData,
        id: event?.id || `event-${Date.now()}`
      })
    }
  }

  const selectedCategory = EVENT_CATEGORIES.find(c => c.id === formData.category)

  return (
    <motion.div
      className="event-form-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <motion.div
        className="event-form-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="form-header" style={{ borderColor: formData.color }}>
          <div className="header-content">
            <span className="category-icon">{selectedCategory?.icon}</span>
            <h2>{event ? 'Tadbirni tahrirlash' : 'Yangi tadbir'}</h2>
          </div>
          <button className="close-btn" onClick={onCancel}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="event-form">
          {/* Basic Info */}
          <div className="form-section">
            <div className="form-group">
              <label>Sarlavha *</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => handleChange('title', e.target.value)}
                placeholder="Tadbir nomi"
                className={errors.title ? 'error' : ''}
              />
              {errors.title && <span className="error-text">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label>Tavsif</label>
              <textarea
                value={formData.description}
                onChange={e => handleChange('description', e.target.value)}
                placeholder="Tadbir haqida qisqacha ma'lumot"
                rows={3}
              />
            </div>
          </div>

          {/* Category Selection */}
          <div className="form-section">
            <label>Kategoriya</label>
            <div className="category-grid">
              {EVENT_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-btn ${formData.category === cat.id ? 'active' : ''}`}
                  onClick={() => handleChange('category', cat.id)}
                  style={{ '--cat-color': cat.color }}
                >
                  <span className="cat-icon">{cat.icon}</span>
                  <span className="cat-name">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="form-section">
            <div className="form-row">
              <div className="form-group">
                <label>Sana *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e => handleChange('date', e.target.value)}
                  className={errors.date ? 'error' : ''}
                />
                {errors.date && <span className="error-text">{errors.date}</span>}
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.allDay}
                    onChange={e => handleChange('allDay', e.target.checked)}
                  />
                  <span className="checkbox-mark">✓</span>
                  Kun bo'yi
                </label>
              </div>
            </div>

            {!formData.allDay && (
              <div className="form-row">
                <div className="form-group">
                  <label>Boshlanish vaqti</label>
                  <select
                    value={formData.startTime}
                    onChange={e => handleChange('startTime', e.target.value)}
                  >
                    {TIME_SLOTS.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Tugash vaqti</label>
                  <select
                    value={formData.endTime}
                    onChange={e => handleChange('endTime', e.target.value)}
                    className={errors.endTime ? 'error' : ''}
                  >
                    {TIME_SLOTS.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  {errors.endTime && <span className="error-text">{errors.endTime}</span>}
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Joylashuv</label>
              <input
                type="text"
                value={formData.location}
                onChange={e => handleChange('location', e.target.value)}
                placeholder="Masalan: Katta zal, Bog'cha hovlisi"
              />
            </div>
          </div>

          {/* Recurring */}
          <div className="form-section">
            <div className="form-row">
              <div className="form-group">
                <label>Takrorlash</label>
                <select
                  value={formData.recurring}
                  onChange={e => handleChange('recurring', e.target.value)}
                >
                  {RECURRING_PATTERNS.map(pattern => (
                    <option key={pattern.value} value={pattern.value}>
                      {pattern.label}
                    </option>
                  ))}
                </select>
              </div>

              {formData.recurring !== 'none' && (
                <div className="form-group">
                  <label>Tugash sanasi *</label>
                  <input
                    type="date"
                    value={formData.recurringEndDate}
                    onChange={e => handleChange('recurringEndDate', e.target.value)}
                    min={formData.date}
                    className={errors.recurringEndDate ? 'error' : ''}
                  />
                  {errors.recurringEndDate && (
                    <span className="error-text">{errors.recurringEndDate}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Attendees */}
          <div className="form-section">
            <label>Ishtirokchilar</label>
            <div className="attendee-options">
              {ATTENDEE_GROUPS.map(group => (
                <button
                  key={group.id}
                  type="button"
                  className={`attendee-btn ${formData.attendees.includes(group.id) ? 'active' : ''}`}
                  onClick={() => handleAttendeeToggle(group.id)}
                >
                  <span>{group.icon}</span>
                  <span>{group.name}</span>
                </button>
              ))}
            </div>

            {groups.length > 0 && !formData.attendees.includes('all') && (
              <div className="group-selection">
                <label>Guruhlar</label>
                <div className="group-chips">
                  {groups.map(group => (
                    <button
                      key={group.id}
                      type="button"
                      className={`group-chip ${formData.selectedGroups.includes(group.id) ? 'active' : ''}`}
                      onClick={() => handleGroupToggle(group.id)}
                    >
                      {group.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Advanced Options */}
          <div className="form-section">
            <button
              type="button"
              className="advanced-toggle"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <span>{showAdvanced ? '▼' : '▶'}</span>
              Qo'shimcha sozlamalar
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  className="advanced-options"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.requiresRSVP}
                        onChange={e => handleChange('requiresRSVP', e.target.checked)}
                      />
                      <span className="checkbox-mark">✓</span>
                      RSVP talab qilinadi
                    </label>
                  </div>

                  {formData.requiresRSVP && (
                    <div className="form-row">
                      <div className="form-group">
                        <label>RSVP muddati *</label>
                        <input
                          type="date"
                          value={formData.rsvpDeadline}
                          onChange={e => handleChange('rsvpDeadline', e.target.value)}
                          max={formData.date}
                          className={errors.rsvpDeadline ? 'error' : ''}
                        />
                        {errors.rsvpDeadline && (
                          <span className="error-text">{errors.rsvpDeadline}</span>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Maksimal ishtirokchilar</label>
                        <input
                          type="number"
                          value={formData.maxAttendees}
                          onChange={e => handleChange('maxAttendees', e.target.value)}
                          placeholder="Cheklanmagan"
                          min="1"
                        />
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Qo'shimcha izohlar</label>
                    <textarea
                      value={formData.notes}
                      onChange={e => handleChange('notes', e.target.value)}
                      placeholder="Ichki izohlar (faqat adminlar ko'radi)"
                      rows={2}
                    />
                  </div>

                  <div className="form-group">
                    <label>Rang</label>
                    <div className="color-picker">
                      {['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#6b7280'].map(color => (
                        <button
                          key={color}
                          type="button"
                          className={`color-btn ${formData.color === color ? 'active' : ''}`}
                          style={{ background: color }}
                          onClick={() => handleChange('color', color)}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            {event && onDelete && (
              <button
                type="button"
                className="btn-delete"
                onClick={() => onDelete(event.id)}
              >
                🗑️ O'chirish
              </button>
            )}
            <div className="action-right">
              <button type="button" className="btn-secondary" onClick={onCancel}>
                Bekor qilish
              </button>
              <button type="submit" className="btn-primary" style={{ background: formData.color }}>
                {event ? '💾 Saqlash' : '➕ Yaratish'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default EventForm
export {
  EVENT_CATEGORIES,
  RECURRING_PATTERNS,
  ATTENDEE_GROUPS,
  TIME_SLOTS
}
