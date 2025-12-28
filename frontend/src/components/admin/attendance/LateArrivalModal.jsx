import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './LateArrivalModal.css'

// Predefined late reasons
const LATE_REASONS = [
  { id: 'traffic', label: 'Yo\'l tiqilishi', icon: '🚗' },
  { id: 'health', label: 'Sog\'lik sababi', icon: '🏥' },
  { id: 'family', label: 'Oilaviy sabab', icon: '👨‍👩‍👧' },
  { id: 'weather', label: 'Ob-havo', icon: '🌧️' },
  { id: 'transport', label: 'Transport muammosi', icon: '🚌' },
  { id: 'other', label: 'Boshqa sabab', icon: '📝' }
]

function LateArrivalModal({
  isOpen,
  onClose,
  onConfirm,
  child,
  defaultTime = null
}) {
  const [arrivalTime, setArrivalTime] = useState('')
  const [selectedReason, setSelectedReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [notifyParent, setNotifyParent] = useState(true)

  // Set default time to current time
  useEffect(() => {
    if (isOpen) {
      const now = defaultTime || new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      setArrivalTime(`${hours}:${minutes}`)
      setSelectedReason('')
      setCustomReason('')
      setNotifyParent(true)
    }
  }, [isOpen, defaultTime])

  const handleConfirm = () => {
    const reason = selectedReason === 'other' ? customReason : 
      LATE_REASONS.find(r => r.id === selectedReason)?.label || ''
    
    onConfirm({
      childId: child?.id,
      arrivalTime,
      reason,
      reasonId: selectedReason,
      notifyParent,
      timestamp: new Date().toISOString()
    })
    onClose()
  }

  // Calculate how late
  const calculateLateDuration = () => {
    if (!arrivalTime) return null
    const [hours, minutes] = arrivalTime.split(':').map(Number)
    const arrivalMinutes = hours * 60 + minutes
    const startTime = 8 * 60 // 8:00 AM default start
    const lateMinutes = arrivalMinutes - startTime
    
    if (lateMinutes <= 0) return null
    
    const lateHours = Math.floor(lateMinutes / 60)
    const lateMins = lateMinutes % 60
    
    if (lateHours > 0) {
      return `${lateHours} soat ${lateMins} daqiqa kechikdi`
    }
    return `${lateMins} daqiqa kechikdi`
  }

  const lateDuration = calculateLateDuration()

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="late-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="late-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="late-modal-header">
            <div className="late-modal-icon">⏰</div>
            <h3>Kech kelish qayd etish</h3>
            <button className="late-modal-close" onClick={onClose}>×</button>
          </div>

          {child && (
            <div className="late-modal-child">
              <div className="late-child-avatar">
                {child.photo ? (
                  <img src={child.photo} alt={child.firstName} />
                ) : (
                  <span>{child.firstName?.[0]}{child.lastName?.[0]}</span>
                )}
              </div>
              <div className="late-child-info">
                <span className="late-child-name">
                  {child.firstName} {child.lastName}
                </span>
                <span className="late-child-group">{child.groupName}</span>
              </div>
            </div>
          )}

          <div className="late-modal-body">
            {/* Arrival Time */}
            <div className="late-form-group">
              <label className="late-form-label">
                <span className="label-icon">🕐</span>
                Kelish vaqti
              </label>
              <input
                type="time"
                className="late-time-input"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
              />
              {lateDuration && (
                <span className="late-duration">{lateDuration}</span>
              )}
            </div>

            {/* Reason Selection */}
            <div className="late-form-group">
              <label className="late-form-label">
                <span className="label-icon">📋</span>
                Kechikish sababi
              </label>
              <div className="late-reasons-grid">
                {LATE_REASONS.map(reason => (
                  <button
                    key={reason.id}
                    className={`late-reason-btn ${selectedReason === reason.id ? 'active' : ''}`}
                    onClick={() => setSelectedReason(reason.id)}
                  >
                    <span className="reason-icon">{reason.icon}</span>
                    <span className="reason-label">{reason.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Reason */}
            {selectedReason === 'other' && (
              <motion.div
                className="late-form-group"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <label className="late-form-label">Sabab tafsiloti</label>
                <textarea
                  className="late-custom-reason"
                  placeholder="Kechikish sababini yozing..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  rows={3}
                />
              </motion.div>
            )}

            {/* Notify Parent */}
            <div className="late-form-group late-notify-group">
              <label className="late-checkbox-label">
                <input
                  type="checkbox"
                  checked={notifyParent}
                  onChange={(e) => setNotifyParent(e.target.checked)}
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-text">
                  <span className="checkbox-icon">📱</span>
                  Ota-onaga xabar yuborish
                </span>
              </label>
            </div>
          </div>

          <div className="late-modal-footer">
            <button className="late-btn late-btn--cancel" onClick={onClose}>
              Bekor qilish
            </button>
            <button 
              className="late-btn late-btn--confirm"
              onClick={handleConfirm}
              disabled={!arrivalTime}
            >
              <span>⏰</span>
              Qayd etish
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default LateArrivalModal
export { LATE_REASONS }
