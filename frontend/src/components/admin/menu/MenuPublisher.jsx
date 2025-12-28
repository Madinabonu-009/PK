import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './MenuPublisher.css'

// Publishing Channels
const CHANNELS = [
  { id: 'telegram', name: 'Telegram', icon: '📱', color: '#0088cc' },
  { id: 'sms', name: 'SMS', icon: '💬', color: '#10b981' },
  { id: 'email', name: 'Email', icon: '📧', color: '#6366f1' }
]

// Recipient Groups
const RECIPIENT_GROUPS = [
  { id: 'all_parents', name: 'Barcha ota-onalar', icon: '👨‍👩‍👧‍👦' },
  { id: 'group_1', name: 'Kichik guruh', icon: '🐣' },
  { id: 'group_2', name: "O'rta guruh", icon: '🐥' },
  { id: 'group_3', name: 'Katta guruh', icon: '🐔' },
  { id: 'group_4', name: 'Tayyorlov guruh', icon: '🎓' }
]

// Menu Preview Card
function MenuPreviewCard({ weekMenu, weekRange }) {
  const mealTypes = ['breakfast', 'lunch', 'snack']
  const mealLabels = {
    breakfast: 'Nonushta',
    lunch: 'Tushlik',
    snack: 'Poldnik'
  }
  const weekDays = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma']

  return (
    <div className="menu-preview-card">
      <div className="preview-header">
        <h3>📋 Haftalik menyu</h3>
        <span className="week-range">{weekRange}</span>
      </div>

      <div className="preview-table">
        <div className="table-header">
          <div className="day-cell header">Kun</div>
          {mealTypes.map(type => (
            <div key={type} className="meal-cell header">{mealLabels[type]}</div>
          ))}
        </div>

        {weekDays.map((day, idx) => {
          const dayKey = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'][idx]
          const dayMeals = weekMenu?.[dayKey] || {}

          return (
            <div key={day} className="table-row">
              <div className="day-cell">{day}</div>
              {mealTypes.map(type => (
                <div key={type} className="meal-cell">
                  {dayMeals[type]?.name || '-'}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Schedule Modal
function ScheduleModal({ onSchedule, onClose }) {
  const [scheduleData, setScheduleData] = useState({
    date: '',
    time: '09:00',
    repeat: 'none'
  })

  const repeatOptions = [
    { value: 'none', label: 'Bir marta' },
    { value: 'weekly', label: 'Har hafta' },
    { value: 'monthly', label: 'Har oy' }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (scheduleData.date) {
      onSchedule?.(scheduleData)
      onClose()
    }
  }

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="schedule-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>⏰ Rejalashtirish</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="schedule-form">
          <div className="form-group">
            <label>Sana</label>
            <input
              type="date"
              value={scheduleData.date}
              onChange={e => setScheduleData(prev => ({ ...prev, date: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label>Vaqt</label>
            <input
              type="time"
              value={scheduleData.time}
              onChange={e => setScheduleData(prev => ({ ...prev, time: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label>Takrorlash</label>
            <select
              value={scheduleData.repeat}
              onChange={e => setScheduleData(prev => ({ ...prev, repeat: e.target.value }))}
            >
              {repeatOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Bekor qilish
            </button>
            <button type="submit" className="btn-primary">
              ⏰ Rejalashtirish
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}


// Publishing History Item
function HistoryItem({ item }) {
  const channel = CHANNELS.find(c => c.id === item.channel)
  const statusColors = {
    sent: '#10b981',
    scheduled: '#f59e0b',
    failed: '#ef4444'
  }
  const statusLabels = {
    sent: 'Yuborildi',
    scheduled: 'Rejalashtirilgan',
    failed: 'Xato'
  }

  return (
    <div className="history-item">
      <span className="history-channel" style={{ color: channel?.color }}>
        {channel?.icon}
      </span>
      <div className="history-info">
        <span className="history-date">
          {new Date(item.date).toLocaleDateString('uz-UZ')}
        </span>
        <span className="history-recipients">
          {item.recipientCount} ta qabul qiluvchi
        </span>
      </div>
      <span 
        className="history-status"
        style={{ color: statusColors[item.status] }}
      >
        {statusLabels[item.status]}
      </span>
    </div>
  )
}

// Main Menu Publisher Component
function MenuPublisher({
  weekMenu = {},
  weekRange = '',
  groups = [],
  onPublish,
  onSchedule,
  publishHistory = []
}) {
  const [selectedChannels, setSelectedChannels] = useState(['telegram'])
  const [selectedRecipients, setSelectedRecipients] = useState(['all_parents'])
  const [customMessage, setCustomMessage] = useState('')
  const [includeImage, setIncludeImage] = useState(true)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  // Calculate recipient count
  const recipientCount = useMemo(() => {
    if (selectedRecipients.includes('all_parents')) {
      return groups.reduce((sum, g) => sum + (g.childrenCount || 0), 0)
    }
    return selectedRecipients.reduce((sum, id) => {
      const group = groups.find(g => g.id === id)
      return sum + (group?.childrenCount || 0)
    }, 0)
  }, [selectedRecipients, groups])

  const handleChannelToggle = (channelId) => {
    setSelectedChannels(prev => 
      prev.includes(channelId)
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    )
  }

  const handleRecipientToggle = (recipientId) => {
    if (recipientId === 'all_parents') {
      setSelectedRecipients(['all_parents'])
    } else {
      setSelectedRecipients(prev => {
        const newRecipients = prev.filter(id => id !== 'all_parents')
        if (newRecipients.includes(recipientId)) {
          return newRecipients.filter(id => id !== recipientId)
        }
        return [...newRecipients, recipientId]
      })
    }
  }

  const handlePublish = async () => {
    if (selectedChannels.length === 0 || selectedRecipients.length === 0) return

    setIsPublishing(true)
    try {
      await onPublish?.({
        channels: selectedChannels,
        recipients: selectedRecipients,
        customMessage,
        includeImage,
        weekMenu,
        weekRange
      })
    } finally {
      setIsPublishing(false)
    }
  }

  const handleScheduleSubmit = (scheduleData) => {
    onSchedule?.({
      ...scheduleData,
      channels: selectedChannels,
      recipients: selectedRecipients,
      customMessage,
      includeImage,
      weekMenu,
      weekRange
    })
  }

  const defaultMessage = `🍽️ Haftalik menyu (${weekRange})\n\nHurmatli ota-onalar! Kelgusi hafta uchun bog'chamiz menyusi tayyor. Batafsil ma'lumot quyida.`

  return (
    <div className="menu-publisher">
      {/* Header */}
      <div className="publisher-header">
        <div className="header-title">
          <h2>📤 Menyu nashr qilish</h2>
          <span className="week-badge">{weekRange}</span>
        </div>
      </div>

      <div className="publisher-content">
        {/* Left Column - Settings */}
        <div className="publisher-settings">
          {/* Channel Selection */}
          <div className="settings-section">
            <h3>📱 Yuborish kanali</h3>
            <div className="channel-options">
              {CHANNELS.map(channel => (
                <button
                  key={channel.id}
                  className={`channel-btn ${selectedChannels.includes(channel.id) ? 'active' : ''}`}
                  onClick={() => handleChannelToggle(channel.id)}
                  style={{ '--channel-color': channel.color }}
                >
                  <span className="channel-icon">{channel.icon}</span>
                  <span className="channel-name">{channel.name}</span>
                  {selectedChannels.includes(channel.id) && (
                    <span className="check-icon">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Recipient Selection */}
          <div className="settings-section">
            <h3>👥 Qabul qiluvchilar</h3>
            <div className="recipient-options">
              {RECIPIENT_GROUPS.map(group => (
                <button
                  key={group.id}
                  className={`recipient-btn ${selectedRecipients.includes(group.id) ? 'active' : ''}`}
                  onClick={() => handleRecipientToggle(group.id)}
                >
                  <span className="recipient-icon">{group.icon}</span>
                  <span className="recipient-name">{group.name}</span>
                  {selectedRecipients.includes(group.id) && (
                    <span className="check-icon">✓</span>
                  )}
                </button>
              ))}
            </div>
            <div className="recipient-count">
              <span>Jami:</span>
              <strong>{recipientCount} ta oila</strong>
            </div>
          </div>

          {/* Message Options */}
          <div className="settings-section">
            <h3>✉️ Xabar sozlamalari</h3>
            
            <div className="option-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={includeImage}
                  onChange={e => setIncludeImage(e.target.checked)}
                />
                <span className="checkbox-mark">✓</span>
                <span>Menyu rasmini qo'shish</span>
              </label>
            </div>

            <div className="form-group">
              <label>Qo'shimcha xabar (ixtiyoriy)</label>
              <textarea
                value={customMessage}
                onChange={e => setCustomMessage(e.target.value)}
                placeholder={defaultMessage}
                rows={4}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              className="btn-schedule"
              onClick={() => setShowScheduleModal(true)}
              disabled={selectedChannels.length === 0 || selectedRecipients.length === 0}
            >
              ⏰ Rejalashtirish
            </button>
            <button 
              className="btn-publish"
              onClick={handlePublish}
              disabled={isPublishing || selectedChannels.length === 0 || selectedRecipients.length === 0}
            >
              {isPublishing ? (
                <>⏳ Yuborilmoqda...</>
              ) : (
                <>📤 Hozir yuborish</>
              )}
            </button>
          </div>
        </div>

        {/* Right Column - Preview & History */}
        <div className="publisher-preview">
          {/* Menu Preview */}
          <MenuPreviewCard weekMenu={weekMenu} weekRange={weekRange} />

          {/* Publishing History */}
          <div className="history-section">
            <h3>📜 Yuborish tarixi</h3>
            {publishHistory.length > 0 ? (
              <div className="history-list">
                {publishHistory.slice(0, 5).map((item, idx) => (
                  <HistoryItem key={idx} item={item} />
                ))}
              </div>
            ) : (
              <div className="history-empty">
                <span>📭</span>
                <p>Hali yuborilmagan</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <ScheduleModal
            onSchedule={handleScheduleSubmit}
            onClose={() => setShowScheduleModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default MenuPublisher
export {
  MenuPreviewCard,
  ScheduleModal,
  HistoryItem,
  CHANNELS,
  RECIPIENT_GROUPS
}
