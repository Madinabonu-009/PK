import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './RSVPTracker.css'

// RSVP Status Types
const RSVP_STATUS = {
  pending: { label: 'Kutilmoqda', icon: '⏳', color: '#f59e0b' },
  accepted: { label: 'Qabul qildi', icon: '✅', color: '#10b981' },
  declined: { label: 'Rad etdi', icon: '❌', color: '#ef4444' },
  maybe: { label: 'Balki', icon: '🤔', color: '#6366f1' }
}

// RSVP Response Card
function RSVPResponseCard({ response, onResend }) {
  const status = RSVP_STATUS[response.status] || RSVP_STATUS.pending

  return (
    <motion.div
      className="rsvp-response-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <div className="response-avatar">
        {response.avatar ? (
          <img src={response.avatar} alt={response.name} />
        ) : (
          <span>{response.name?.charAt(0) || '?'}</span>
        )}
      </div>

      <div className="response-info">
        <span className="response-name">{response.name}</span>
        <span className="response-role">{response.role || 'Ota-ona'}</span>
        {response.childName && (
          <span className="response-child">👶 {response.childName}</span>
        )}
      </div>

      <div className="response-status" style={{ color: status.color }}>
        <span className="status-icon">{status.icon}</span>
        <span className="status-label">{status.label}</span>
      </div>

      {response.status === 'pending' && (
        <button 
          className="resend-btn"
          onClick={() => onResend?.(response.id)}
          title="Qayta yuborish"
        >
          🔄
        </button>
      )}

      {response.respondedAt && (
        <span className="response-time">
          {new Date(response.respondedAt).toLocaleDateString('uz-UZ')}
        </span>
      )}
    </motion.div>
  )
}

// Send RSVP Modal
function SendRSVPModal({ event, recipients = [], onSend, onClose }) {
  const [selectedRecipients, setSelectedRecipients] = useState([])
  const [message, setMessage] = useState('')
  const [deadline, setDeadline] = useState(event?.rsvpDeadline || '')

  const handleToggleRecipient = (id) => {
    setSelectedRecipients(prev => 
      prev.includes(id) 
        ? prev.filter(r => r !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedRecipients.length === recipients.length) {
      setSelectedRecipients([])
    } else {
      setSelectedRecipients(recipients.map(r => r.id))
    }
  }

  const handleSend = () => {
    if (selectedRecipients.length > 0) {
      onSend?.({
        recipients: selectedRecipients,
        message,
        deadline,
        eventId: event?.id
      })
      onClose()
    }
  }

  const defaultMessage = `Hurmatli ota-ona!\n\n"${event?.title}" tadbiriga taklif qilamiz.\n\n📅 Sana: ${event?.date}\n⏰ Vaqt: ${event?.startTime} - ${event?.endTime}\n📍 Joy: ${event?.location || 'Bog\'cha'}\n\nIltimos, ishtirok etishingizni tasdiqlang.`

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="send-rsvp-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>📨 RSVP yuborish</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-content">
          {/* Event Info */}
          <div className="event-summary">
            <h3>{event?.title}</h3>
            <p>📅 {event?.date} | ⏰ {event?.startTime}</p>
          </div>

          {/* Recipients */}
          <div className="recipients-section">
            <div className="section-header">
              <label>Qabul qiluvchilar</label>
              <button className="select-all-btn" onClick={handleSelectAll}>
                {selectedRecipients.length === recipients.length ? 'Bekor qilish' : 'Hammasini tanlash'}
              </button>
            </div>

            <div className="recipients-list">
              {recipients.map(recipient => (
                <label key={recipient.id} className="recipient-item">
                  <input
                    type="checkbox"
                    checked={selectedRecipients.includes(recipient.id)}
                    onChange={() => handleToggleRecipient(recipient.id)}
                  />
                  <span className="checkbox-mark">✓</span>
                  <span className="recipient-name">{recipient.name}</span>
                  {recipient.childName && (
                    <span className="recipient-child">({recipient.childName})</span>
                  )}
                </label>
              ))}
            </div>

            <div className="selected-count">
              {selectedRecipients.length} ta tanlangan
            </div>
          </div>

          {/* Deadline */}
          <div className="form-group">
            <label>Javob berish muddati</label>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              max={event?.date}
            />
          </div>

          {/* Message */}
          <div className="form-group">
            <label>Xabar</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={defaultMessage}
              rows={6}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Bekor qilish
          </button>
          <button 
            className="btn-primary"
            onClick={handleSend}
            disabled={selectedRecipients.length === 0}
          >
            📨 Yuborish ({selectedRecipients.length})
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}


// Main RSVP Tracker Component
function RSVPTracker({
  event = null,
  responses = [],
  recipients = [],
  onSendRSVP,
  onResend,
  onExport
}) {
  const [showSendModal, setShowSendModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Calculate statistics
  const stats = useMemo(() => {
    const total = responses.length
    const accepted = responses.filter(r => r.status === 'accepted').length
    const declined = responses.filter(r => r.status === 'declined').length
    const pending = responses.filter(r => r.status === 'pending').length
    const maybe = responses.filter(r => r.status === 'maybe').length

    return { total, accepted, declined, pending, maybe }
  }, [responses])

  // Filter responses
  const filteredResponses = useMemo(() => {
    let filtered = responses

    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(r => 
        r.name?.toLowerCase().includes(query) ||
        r.childName?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [responses, filterStatus, searchQuery])

  // Calculate response rate
  const responseRate = stats.total > 0 
    ? Math.round(((stats.accepted + stats.declined + stats.maybe) / stats.total) * 100)
    : 0

  return (
    <div className="rsvp-tracker">
      {/* Header */}
      <div className="tracker-header">
        <div className="header-info">
          <h2>📋 RSVP Kuzatuvi</h2>
          {event && <span className="event-name">{event.title}</span>}
        </div>

        <div className="header-actions">
          <button className="action-btn" onClick={() => onExport?.('excel')}>
            📊 Export
          </button>
          <button 
            className="action-btn primary"
            onClick={() => setShowSendModal(true)}
          >
            📨 RSVP yuborish
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="rsvp-stats">
        <div className="stat-card total">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Jami</span>
        </div>
        <div className="stat-card accepted">
          <span className="stat-icon">✅</span>
          <span className="stat-value">{stats.accepted}</span>
          <span className="stat-label">Qabul qildi</span>
        </div>
        <div className="stat-card declined">
          <span className="stat-icon">❌</span>
          <span className="stat-value">{stats.declined}</span>
          <span className="stat-label">Rad etdi</span>
        </div>
        <div className="stat-card pending">
          <span className="stat-icon">⏳</span>
          <span className="stat-value">{stats.pending}</span>
          <span className="stat-label">Kutilmoqda</span>
        </div>
        <div className="stat-card maybe">
          <span className="stat-icon">🤔</span>
          <span className="stat-value">{stats.maybe}</span>
          <span className="stat-label">Balki</span>
        </div>
      </div>

      {/* Response Rate */}
      <div className="response-rate-section">
        <div className="rate-header">
          <span>Javob berish darajasi</span>
          <span className="rate-value">{responseRate}%</span>
        </div>
        <div className="rate-bar">
          <motion.div
            className="rate-fill accepted"
            initial={{ width: 0 }}
            animate={{ width: `${stats.total > 0 ? (stats.accepted / stats.total) * 100 : 0}%` }}
          />
          <motion.div
            className="rate-fill declined"
            initial={{ width: 0 }}
            animate={{ width: `${stats.total > 0 ? (stats.declined / stats.total) * 100 : 0}%` }}
          />
          <motion.div
            className="rate-fill maybe"
            initial={{ width: 0 }}
            animate={{ width: `${stats.total > 0 ? (stats.maybe / stats.total) * 100 : 0}%` }}
          />
        </div>
        <div className="rate-legend">
          <span className="legend-item accepted">✅ Qabul qildi</span>
          <span className="legend-item declined">❌ Rad etdi</span>
          <span className="legend-item maybe">🤔 Balki</span>
          <span className="legend-item pending">⏳ Kutilmoqda</span>
        </div>
      </div>

      {/* Filters */}
      <div className="tracker-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Qidirish..."
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            Barchasi
          </button>
          {Object.entries(RSVP_STATUS).map(([key, value]) => (
            <button
              key={key}
              className={`filter-btn ${filterStatus === key ? 'active' : ''}`}
              onClick={() => setFilterStatus(key)}
              style={{ '--status-color': value.color }}
            >
              {value.icon} {value.label}
            </button>
          ))}
        </div>
      </div>

      {/* Responses List */}
      <div className="responses-list">
        <AnimatePresence>
          {filteredResponses.map(response => (
            <RSVPResponseCard
              key={response.id}
              response={response}
              onResend={onResend}
            />
          ))}
        </AnimatePresence>

        {filteredResponses.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>Javoblar topilmadi</h3>
            <p>
              {responses.length === 0 
                ? 'Hali RSVP yuborilmagan'
                : 'Filtr bo\'yicha natija yo\'q'}
            </p>
          </div>
        )}
      </div>

      {/* Send RSVP Modal */}
      <AnimatePresence>
        {showSendModal && (
          <SendRSVPModal
            event={event}
            recipients={recipients}
            onSend={onSendRSVP}
            onClose={() => setShowSendModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default RSVPTracker
export {
  RSVPResponseCard,
  SendRSVPModal,
  RSVP_STATUS
}
