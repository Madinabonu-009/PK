import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './ScheduledMessages.css'

// Scheduled Message Card
function ScheduledMessageCard({ message, onEdit, onCancel, onSendNow }) {
  const scheduledDate = new Date(message.scheduledTime)
  const isOverdue = scheduledDate < new Date()

  return (
    <motion.div
      className={`scheduled-card ${isOverdue ? 'overdue' : ''}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      layout
    >
      <div className="card-header">
        <div className="schedule-time">
          <span className="time-icon">⏰</span>
          <div className="time-info">
            <span className="time-date">
              {scheduledDate.toLocaleDateString('uz-UZ', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
              })}
            </span>
            <span className="time-hour">
              {scheduledDate.toLocaleTimeString('uz-UZ', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>

        {isOverdue && (
          <span className="overdue-badge">⚠️ Muddati o'tgan</span>
        )}

        <div className="card-actions">
          <button 
            className="action-btn edit"
            onClick={() => onEdit?.(message)}
            title="Tahrirlash"
          >
            ✏️
          </button>
          <button 
            className="action-btn cancel"
            onClick={() => onCancel?.(message.id)}
            title="Bekor qilish"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="card-content">
        {message.subject && (
          <h4 className="message-subject">{message.subject}</h4>
        )}
        <p className="message-preview">
          {message.content?.substring(0, 150)}
          {message.content?.length > 150 && '...'}
        </p>
      </div>

      <div className="card-footer">
        <div className="recipient-info">
          <span className="recipient-icon">👥</span>
          <span>{message.recipientCount || 0} ta qabul qiluvchi</span>
        </div>

        <div className="channel-badges">
          {message.channels?.map(channel => (
            <span key={channel} className={`channel-badge ${channel}`}>
              {channel === 'telegram' && '📱'}
              {channel === 'sms' && '💬'}
              {channel === 'push' && '🔔'}
            </span>
          ))}
        </div>

        <button 
          className="send-now-btn"
          onClick={() => onSendNow?.(message.id)}
        >
          📤 Hozir yuborish
        </button>
      </div>
    </motion.div>
  )
}

// Schedule Form Modal
function ScheduleFormModal({ message = null, onSave, onClose }) {
  const [formData, setFormData] = useState({
    subject: message?.subject || '',
    content: message?.content || '',
    scheduledTime: message?.scheduledTime 
      ? new Date(message.scheduledTime).toISOString().slice(0, 16)
      : '',
    channels: message?.channels || ['telegram'],
    recipientType: message?.recipientType || 'all_parents'
  })

  const channels = [
    { id: 'telegram', name: 'Telegram', icon: '📱' },
    { id: 'sms', name: 'SMS', icon: '💬' },
    { id: 'push', name: 'Push', icon: '🔔' }
  ]

  const handleChannelToggle = (channelId) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channelId)
        ? prev.channels.filter(c => c !== channelId)
        : [...prev.channels, channelId]
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.content && formData.scheduledTime && formData.channels.length > 0) {
      onSave?.({
        ...formData,
        id: message?.id || `scheduled-${Date.now()}`
      })
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
        className="schedule-form-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{message ? '✏️ Tahrirlash' : '📅 Rejalashtirish'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="schedule-form">
          <div className="form-group">
            <label>Yuborish vaqti *</label>
            <input
              type="datetime-local"
              value={formData.scheduledTime}
              onChange={e => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
              min={new Date().toISOString().slice(0, 16)}
              required
            />
          </div>

          <div className="form-group">
            <label>Mavzu (ixtiyoriy)</label>
            <input
              type="text"
              value={formData.subject}
              onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Xabar mavzusi"
            />
          </div>

          <div className="form-group">
            <label>Xabar matni *</label>
            <textarea
              value={formData.content}
              onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Xabar matnini kiriting..."
              rows={5}
              required
            />
          </div>

          <div className="form-group">
            <label>Yuborish kanallari *</label>
            <div className="channel-options">
              {channels.map(channel => (
                <button
                  key={channel.id}
                  type="button"
                  className={`channel-btn ${formData.channels.includes(channel.id) ? 'active' : ''}`}
                  onClick={() => handleChannelToggle(channel.id)}
                >
                  <span>{channel.icon}</span>
                  <span>{channel.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Bekor qilish
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={!formData.content || !formData.scheduledTime || formData.channels.length === 0}
            >
              {message ? '💾 Saqlash' : '📅 Rejalashtirish'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// Main Scheduled Messages Component
function ScheduledMessages({
  scheduledMessages = [],
  onSchedule,
  onEdit,
  onCancel,
  onSendNow
}) {
  const [showForm, setShowForm] = useState(false)
  const [editingMessage, setEditingMessage] = useState(null)
  const [filterPeriod, setFilterPeriod] = useState('all')

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

    let filtered = scheduledMessages

    if (filterPeriod === 'today') {
      filtered = scheduledMessages.filter(m => {
        const d = new Date(m.scheduledTime)
        return d >= today && d < tomorrow
      })
    } else if (filterPeriod === 'week') {
      filtered = scheduledMessages.filter(m => {
        const d = new Date(m.scheduledTime)
        return d >= today && d < nextWeek
      })
    }

    return filtered.sort((a, b) => 
      new Date(a.scheduledTime) - new Date(b.scheduledTime)
    )
  }, [scheduledMessages, filterPeriod])

  const handleEdit = (message) => {
    setEditingMessage(message)
    setShowForm(true)
  }

  const handleSave = (data) => {
    if (editingMessage) {
      onEdit?.(data)
    } else {
      onSchedule?.(data)
    }
    setEditingMessage(null)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingMessage(null)
  }

  return (
    <div className="scheduled-messages">
      {/* Header */}
      <div className="scheduled-header">
        <div className="header-info">
          <h2>📅 Rejalashtirilgan xabarlar</h2>
          <span className="message-count">{scheduledMessages.length} ta</span>
        </div>

        <button 
          className="schedule-btn"
          onClick={() => setShowForm(true)}
        >
          ➕ Yangi rejalashtirish
        </button>
      </div>

      {/* Filters */}
      <div className="period-filters">
        <button
          className={`period-btn ${filterPeriod === 'all' ? 'active' : ''}`}
          onClick={() => setFilterPeriod('all')}
        >
          Barchasi
        </button>
        <button
          className={`period-btn ${filterPeriod === 'today' ? 'active' : ''}`}
          onClick={() => setFilterPeriod('today')}
        >
          Bugun
        </button>
        <button
          className={`period-btn ${filterPeriod === 'week' ? 'active' : ''}`}
          onClick={() => setFilterPeriod('week')}
        >
          Bu hafta
        </button>
      </div>

      {/* Messages List */}
      <div className="messages-list">
        <AnimatePresence>
          {groupedMessages.map(message => (
            <ScheduledMessageCard
              key={message.id}
              message={message}
              onEdit={handleEdit}
              onCancel={onCancel}
              onSendNow={onSendNow}
            />
          ))}
        </AnimatePresence>

        {groupedMessages.length === 0 && (
          <div className="empty-state">
            <span>📭</span>
            <h3>Rejalashtirilgan xabarlar yo'q</h3>
            <p>Yangi xabar rejalashtirishni boshlang</p>
            <button 
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
              ➕ Rejalashtirish
            </button>
          </div>
        )}
      </div>

      {/* Schedule Form Modal */}
      <AnimatePresence>
        {showForm && (
          <ScheduleFormModal
            message={editingMessage}
            onSave={handleSave}
            onClose={handleCloseForm}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default ScheduledMessages
export {
  ScheduledMessageCard,
  ScheduleFormModal
}
