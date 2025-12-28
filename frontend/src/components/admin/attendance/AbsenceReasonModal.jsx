import { useState } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import './AbsenceReasonModal.css'

const PREDEFINED_REASONS = [
  { id: 'sick', icon: '🤒', label: 'Kasal' },
  { id: 'family', icon: '👨‍👩‍👧', label: 'Oilaviy sabab' },
  { id: 'vacation', icon: '🏖️', label: 'Ta\'til' },
  { id: 'doctor', icon: '🏥', label: 'Shifokor' },
  { id: 'weather', icon: '🌧️', label: 'Ob-havo' },
  { id: 'transport', icon: '🚗', label: 'Transport' },
  { id: 'other', icon: '📝', label: 'Boshqa' }
]

export default function AbsenceReasonModal({ 
  isOpen, 
  onClose, 
  child, 
  onSave,
  initialReason = null
}) {
  const [selectedReason, setSelectedReason] = useState(initialReason?.id || '')
  const [customReason, setCustomReason] = useState(initialReason?.custom || '')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState('')
  const [notifyParent, setNotifyParent] = useState(true)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!selectedReason) return
    
    setSaving(true)
    try {
      const reason = PREDEFINED_REASONS.find(r => r.id === selectedReason)
      await onSave({
        childId: child.id,
        reasonId: selectedReason,
        reasonLabel: reason?.label || 'Boshqa',
        customReason: selectedReason === 'other' ? customReason : '',
        startDate,
        endDate: endDate || startDate,
        notifyParent
      })
      onClose()
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen || !child) return null

  return (
    <AnimatePresence>
      <motion.div
        className="absence-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absence-modal__backdrop" onClick={onClose} />
        
        <motion.div
          className="absence-modal__content"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <div className="absence-modal__header">
            <img 
              src={child.photo || '/default-avatar.png'} 
              alt={child.name}
              className="absence-modal__avatar"
            />
            <div className="absence-modal__child-info">
              <div className="absence-modal__child-name">{child.name}</div>
              <div className="absence-modal__child-group">{child.group}</div>
            </div>
            <button className="absence-modal__close" onClick={onClose}>×</button>
          </div>

          <div className="absence-modal__body">
            <h4 className="absence-modal__section-title">Sabab tanlang</h4>
            <div className="absence-modal__reasons">
              {PREDEFINED_REASONS.map(reason => (
                <button
                  key={reason.id}
                  className={`absence-modal__reason ${selectedReason === reason.id ? 'absence-modal__reason--selected' : ''}`}
                  onClick={() => setSelectedReason(reason.id)}
                >
                  <span className="absence-modal__reason-icon">{reason.icon}</span>
                  <span className="absence-modal__reason-text">{reason.label}</span>
                </button>
              ))}
            </div>

            {selectedReason === 'other' && (
              <div className="absence-modal__custom">
                <label className="absence-modal__custom-label">Boshqa sabab</label>
                <textarea
                  className="absence-modal__custom-input"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Sababni kiriting..."
                  rows={3}
                />
              </div>
            )}

            <div className="absence-modal__dates">
              <div className="absence-modal__date-field">
                <label className="absence-modal__date-label">Boshlanish sanasi</label>
                <input
                  type="date"
                  className="absence-modal__date-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="absence-modal__date-field">
                <label className="absence-modal__date-label">Tugash sanasi (ixtiyoriy)</label>
                <input
                  type="date"
                  className="absence-modal__date-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                />
              </div>
            </div>

            <label className="absence-modal__notify">
              <input
                type="checkbox"
                className="absence-modal__notify-checkbox"
                checked={notifyParent}
                onChange={(e) => setNotifyParent(e.target.checked)}
              />
              <span className="absence-modal__notify-label">
                Ota-onaga Telegram orqali xabar berish
              </span>
            </label>
          </div>

          <div className="absence-modal__footer">
            <button className="absence-modal__btn absence-modal__btn--cancel" onClick={onClose}>
              Bekor qilish
            </button>
            <button 
              className="absence-modal__btn absence-modal__btn--save"
              onClick={handleSave}
              disabled={!selectedReason || saving}
            >
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

AbsenceReasonModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  child: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    group: PropTypes.string,
    photo: PropTypes.string
  }),
  onSave: PropTypes.func.isRequired,
  initialReason: PropTypes.object
}
