import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './EventNotifications.css'

// Notification Channels
const CHANNELS = [
  { id: 'telegram', name: 'Telegram', icon: '📱', color: '#0088cc' },
  { id: 'sms', name: 'SMS', icon: '💬', color: '#10b981' },
  { id: 'email', name: 'Email', icon: '📧', color: '#6366f1' },
  { id: 'push', name: 'Push', icon: '🔔', color: '#f59e0b' }
]

// Reminder Timing Options
const REMINDER_TIMINGS = [
  { value: '15m', label: '15 daqiqa oldin' },
  { value: '30m', label: '30 daqiqa oldin' },
  { value: '1h', label: '1 soat oldin' },
  { value: '2h', label: '2 soat oldin' },
  { value: '1d', label: '1 kun oldin' },
  { value: '2d', label: '2 kun oldin' },
  { value: '1w', label: '1 hafta oldin' }
]

// Notification Status
const NOTIFICATION_STATUS = {
  pending: { label: 'Kutilmoqda', icon: '⏳', color: '#f59e0b' },
  sent: { label: 'Yuborildi', icon: '✅', color: '#10b981' },
  failed: { label: 'Xato', icon: '❌', color: '#ef4444' },
  scheduled: { label: 'Rejalashtirilgan', icon: '📅', color: '#3b82f6' }
}

// Notification History Item
function NotificationHistoryItem({ notification }) {
  const channel = CHANNELS.find(c => c.id === notification.channel)
  const status = NOTIFICATION_STATUS[notification.status] || NOTIFICATION_STATUS.pending

  return (
    <div className="notification-history-item">
      <span className="history-channel" style={{ color: channel?.color }}>
        {channel?.icon}
      </span>
      <div className="history-info">
        <span className="history-type">{notification.type}</span>
        <span className="history-time">
          {new Date(notification.sentAt).toLocaleString('uz-UZ')}
        </span>
      </div>
      <span className="history-recipients">
        {notification.recipientCount} ta
      </span>
      <span className="history-status" style={{ color: status.color }}>
        {status.icon} {status.label}
      </span>
    </div>
  )
}

// Reminder Settings Component
function ReminderSettings({ reminders = [], onChange }) {
  const [newReminder, setNewReminder] = useState({
    timing: '1d',
    channels: ['telegram']
  })

  const handleAddReminder = () => {
    if (newReminder.channels.length > 0) {
      onChange?.([...reminders, { ...newReminder, id: `reminder-${Date.now()}` }])
      setNewReminder({ timing: '1d', channels: ['telegram'] })
    }
  }

  const handleRemoveReminder = (id) => {
    onChange?.(reminders.filter(r => r.id !== id))
  }

  const handleChannelToggle = (channelId) => {
    setNewReminder(prev => ({
      ...prev,
      channels: prev.channels.includes(channelId)
        ? prev.channels.filter(c => c !== channelId)
        : [...prev.channels, channelId]
    }))
  }

  return (
    <div className="reminder-settings">
      <h4>⏰ Eslatmalar</h4>

      {/* Existing Reminders */}
      <div className="reminders-list">
        {reminders.map(reminder => {
          const timing = REMINDER_TIMINGS.find(t => t.value === reminder.timing)
          return (
            <div key={reminder.id} className="reminder-item">
              <span className="reminder-timing">{timing?.label}</span>
              <div className="reminder-channels">
                {reminder.channels.map(ch => {
                  const channel = CHANNELS.find(c => c.id === ch)
                  return (
                    <span key={ch} style={{ color: channel?.color }}>
                      {channel?.icon}
                    </span>
                  )
                })}
              </div>
              <button 
                className="remove-reminder"
                onClick={() => handleRemoveReminder(reminder.id)}
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>

      {/* Add New Reminder */}
      <div className="add-reminder">
        <select
          value={newReminder.timing}
          onChange={e => setNewReminder(prev => ({ ...prev, timing: e.target.value }))}
        >
          {REMINDER_TIMINGS.map(timing => (
            <option key={timing.value} value={timing.value}>
              {timing.label}
            </option>
          ))}
        </select>

        <div className="channel-toggles">
          {CHANNELS.map(channel => (
            <button
              key={channel.id}
              type="button"
              className={`channel-toggle ${newReminder.channels.includes(channel.id) ? 'active' : ''}`}
              onClick={() => handleChannelToggle(channel.id)}
              style={{ '--channel-color': channel.color }}
              title={channel.name}
            >
              {channel.icon}
            </button>
          ))}
        </div>

        <button 
          className="add-btn"
          onClick={handleAddReminder}
          disabled={newReminder.channels.length === 0}
        >
          ➕
        </button>
      </div>
    </div>
  )
}

// Send Notification Modal
function SendNotificationModal({ event, recipients = [], onSend, onClose }) {
  const [notificationData, setNotificationData] = useState({
    type: 'announcement',
    channels: ['telegram'],
    message: '',
    scheduleTime: ''
  })

  const notificationTypes = [
    { value: 'announcement', label: 'E\'lon', icon: '📢' },
    { value: 'reminder', label: 'Eslatma', icon: '⏰' },
    { value: 'update', label: 'Yangilanish', icon: '🔄' },
    { value: 'cancellation', label: 'Bekor qilish', icon: '❌' }
  ]

  const handleChannelToggle = (channelId) => {
    setNotificationData(prev => ({
      ...prev,
      channels: prev.channels.includes(channelId)
        ? prev.channels.filter(c => c !== channelId)
        : [...prev.channels, channelId]
    }))
  }

  const handleSend = () => {
    if (notificationData.channels.length > 0) {
      onSend?.({
        ...notificationData,
        eventId: event?.id,
        recipientCount: recipients.length
      })
      onClose()
    }
  }

  const defaultMessages = {
    announcement: `📢 "${event?.title}" tadbiriga taklif qilamiz!\n\n📅 ${event?.date}\n⏰ ${event?.startTime}\n📍 ${event?.location || 'Bog\'cha'}`,
    reminder: `⏰ Eslatma: "${event?.title}" tadbiri ertaga bo'lib o'tadi!\n\n📅 ${event?.date}\n⏰ ${event?.startTime}`,
    update: `🔄 "${event?.title}" tadbiri haqida yangilanish mavjud. Iltimos, tekshiring.`,
    cancellation: `❌ Afsuski, "${event?.title}" tadbiri bekor qilindi. Noqulaylik uchun uzr so'raymiz.`
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
        className="send-notification-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>📤 Xabar yuborish</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-content">
          {/* Event Info */}
          <div className="event-info-card">
            <h3>{event?.title}</h3>
            <p>📅 {event?.date} | ⏰ {event?.startTime}</p>
            <p>👥 {recipients.length} ta qabul qiluvchi</p>
          </div>

          {/* Notification Type */}
          <div className="form-group">
            <label>Xabar turi</label>
            <div className="type-options">
              {notificationTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  className={`type-btn ${notificationData.type === type.value ? 'active' : ''}`}
                  onClick={() => {
                    setNotificationData(prev => ({
                      ...prev,
                      type: type.value,
                      message: defaultMessages[type.value]
                    }))
                  }}
                >
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Channels */}
          <div className="form-group">
            <label>Yuborish kanallari</label>
            <div className="channel-options">
              {CHANNELS.map(channel => (
                <button
                  key={channel.id}
                  type="button"
                  className={`channel-btn ${notificationData.channels.includes(channel.id) ? 'active' : ''}`}
                  onClick={() => handleChannelToggle(channel.id)}
                  style={{ '--channel-color': channel.color }}
                >
                  <span>{channel.icon}</span>
                  <span>{channel.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="form-group">
            <label>Xabar matni</label>
            <textarea
              value={notificationData.message}
              onChange={e => setNotificationData(prev => ({ ...prev, message: e.target.value }))}
              placeholder={defaultMessages[notificationData.type]}
              rows={5}
            />
          </div>

          {/* Schedule */}
          <div className="form-group">
            <label>Rejalashtirish (ixtiyoriy)</label>
            <input
              type="datetime-local"
              value={notificationData.scheduleTime}
              onChange={e => setNotificationData(prev => ({ ...prev, scheduleTime: e.target.value }))}
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
            disabled={notificationData.channels.length === 0}
          >
            {notificationData.scheduleTime ? '📅 Rejalashtirish' : '📤 Yuborish'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}


// Main Event Notifications Component
function EventNotifications({
  event = null,
  recipients = [],
  notificationHistory = [],
  reminders = [],
  onSendNotification,
  onUpdateReminders
}) {
  const [showSendModal, setShowSendModal] = useState(false)

  // Statistics
  const stats = useMemo(() => {
    const total = notificationHistory.length
    const sent = notificationHistory.filter(n => n.status === 'sent').length
    const failed = notificationHistory.filter(n => n.status === 'failed').length
    const scheduled = notificationHistory.filter(n => n.status === 'scheduled').length

    return { total, sent, failed, scheduled }
  }, [notificationHistory])

  return (
    <div className="event-notifications">
      {/* Header */}
      <div className="notifications-header">
        <div className="header-info">
          <h2>🔔 Xabarnomalar</h2>
          {event && <span className="event-name">{event.title}</span>}
        </div>

        <button 
          className="send-btn"
          onClick={() => setShowSendModal(true)}
        >
          📤 Xabar yuborish
        </button>
      </div>

      {/* Quick Stats */}
      <div className="notification-stats">
        <div className="stat-item">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Jami</span>
        </div>
        <div className="stat-item sent">
          <span className="stat-value">{stats.sent}</span>
          <span className="stat-label">Yuborildi</span>
        </div>
        <div className="stat-item scheduled">
          <span className="stat-value">{stats.scheduled}</span>
          <span className="stat-label">Rejalashtirilgan</span>
        </div>
        <div className="stat-item failed">
          <span className="stat-value">{stats.failed}</span>
          <span className="stat-label">Xato</span>
        </div>
      </div>

      {/* Reminder Settings */}
      <ReminderSettings
        reminders={reminders}
        onChange={onUpdateReminders}
      />

      {/* Notification History */}
      <div className="history-section">
        <h4>📜 Yuborish tarixi</h4>
        
        {notificationHistory.length > 0 ? (
          <div className="history-list">
            {notificationHistory.map((notification, idx) => (
              <NotificationHistoryItem
                key={notification.id || idx}
                notification={notification}
              />
            ))}
          </div>
        ) : (
          <div className="empty-history">
            <span>📭</span>
            <p>Hali xabar yuborilmagan</p>
          </div>
        )}
      </div>

      {/* Send Notification Modal */}
      <AnimatePresence>
        {showSendModal && (
          <SendNotificationModal
            event={event}
            recipients={recipients}
            onSend={onSendNotification}
            onClose={() => setShowSendModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default EventNotifications
export {
  NotificationHistoryItem,
  ReminderSettings,
  SendNotificationModal,
  CHANNELS,
  REMINDER_TIMINGS,
  NOTIFICATION_STATUS
}
