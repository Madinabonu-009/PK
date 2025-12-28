/**
 * AttendanceNotification - Davomat bo'yicha avtomatik bildirishnomalar
 * Task 11.4: Implement automatic notifications
 */
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './AttendanceNotification.css'

// Bildirishnoma turlari
const NOTIFICATION_TYPES = {
  ABSENT: {
    id: 'absent',
    name: "Qatnashmadi",
    icon: '❌',
    template: {
      uz: "Hurmatli ota-ona! {childName} bugun bog'chaga kelmadi. Iltimos, sababini bildiring.",
      ru: "Уважаемые родители! {childName} сегодня не пришёл в детский сад. Пожалуйста, сообщите причину.",
      en: "Dear parent! {childName} did not attend kindergarten today. Please let us know the reason."
    },
    color: '#ef4444'
  },
  LATE: {
    id: 'late',
    name: "Kechikdi",
    icon: '⏰',
    template: {
      uz: "Hurmatli ota-ona! {childName} bugun {time} da kechikib keldi.",
      ru: "Уважаемые родители! {childName} сегодня опоздал в {time}.",
      en: "Dear parent! {childName} arrived late today at {time}."
    },
    color: '#f59e0b'
  },
  PRESENT: {
    id: 'present',
    name: "Keldi",
    icon: '✅',
    template: {
      uz: "Hurmatli ota-ona! {childName} bugun {time} da bog'chaga keldi. Yaxshi kun tilaymiz! 🌟",
      ru: "Уважаемые родители! {childName} сегодня пришёл в {time}. Хорошего дня! 🌟",
      en: "Dear parent! {childName} arrived at kindergarten today at {time}. Have a great day! 🌟"
    },
    color: '#22c55e'
  },
  PICKUP: {
    id: 'pickup',
    name: "Olib ketildi",
    icon: '🏠',
    template: {
      uz: "Hurmatli ota-ona! {childName} bugun {time} da bog'chadan olib ketildi.",
      ru: "Уважаемые родители! {childName} сегодня забрали из детского сада в {time}.",
      en: "Dear parent! {childName} was picked up from kindergarten today at {time}."
    },
    color: '#3b82f6'
  }
}

// Sozlamalar
const DEFAULT_SETTINGS = {
  enableAbsentNotification: true,
  enableLateNotification: true,
  enablePresentNotification: false,
  enablePickupNotification: false,
  notificationDelay: 30, // daqiqa
  language: 'uz',
  telegramEnabled: true,
  smsEnabled: false
}

// Xabar formatlash
function formatMessage(template, data) {
  let message = template
  Object.keys(data).forEach(key => {
    message = message.replace(new RegExp(`{${key}}`, 'g'), data[key])
  })
  return message
}

// Vaqtni formatlash
function formatTime(date) {
  return new Date(date).toLocaleTimeString('uz-UZ', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Notification Queue komponenti
function NotificationQueue({ queue, onSend, onRemove, onSendAll }) {
  if (queue.length === 0) return null
  
  return (
    <div className="notification-queue">
      <div className="queue-header">
        <h4>📤 Yuborish navbati ({queue.length})</h4>
        <button className="send-all-btn" onClick={onSendAll}>
          Barchasini yuborish
        </button>
      </div>
      <div className="queue-list">
        <AnimatePresence>
          {queue.map(item => (
            <motion.div
              key={item.id}
              className="queue-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="queue-item-icon" style={{ color: item.type.color }}>
                {item.type.icon}
              </div>
              <div className="queue-item-content">
                <span className="queue-item-child">{item.childName}</span>
                <span className="queue-item-parent">{item.parentPhone}</span>
              </div>
              <div className="queue-item-actions">
                <button 
                  className="queue-send-btn"
                  onClick={() => onSend(item)}
                  title="Yuborish"
                >
                  📤
                </button>
                <button 
                  className="queue-remove-btn"
                  onClick={() => onRemove(item.id)}
                  title="O'chirish"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Yuborilgan bildirishnomalar tarixi
function NotificationHistory({ history }) {
  if (history.length === 0) {
    return (
      <div className="notification-history empty">
        <span className="empty-icon">📭</span>
        <p>Hali bildirishnoma yuborilmagan</p>
      </div>
    )
  }
  
  return (
    <div className="notification-history">
      <h4>📋 Yuborilgan bildirishnomalar</h4>
      <div className="history-list">
        {history.slice(0, 20).map(item => (
          <div key={item.id} className={`history-item ${item.status}`}>
            <div className="history-icon" style={{ color: item.type.color }}>
              {item.type.icon}
            </div>
            <div className="history-content">
              <span className="history-child">{item.childName}</span>
              <span className="history-message">{item.message.substring(0, 50)}...</span>
            </div>
            <div className="history-meta">
              <span className="history-time">{formatTime(item.sentAt)}</span>
              <span className={`history-status ${item.status}`}>
                {item.status === 'sent' ? '✓' : item.status === 'failed' ? '✗' : '⏳'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Sozlamalar paneli
function NotificationSettings({ settings, onChange }) {
  return (
    <div className="notification-settings">
      <h4>⚙️ Bildirishnoma sozlamalari</h4>
      
      <div className="settings-group">
        <label className="setting-label">Bildirishnoma turlari</label>
        
        <div className="setting-item">
          <input
            type="checkbox"
            id="enableAbsent"
            checked={settings.enableAbsentNotification}
            onChange={e => onChange({ ...settings, enableAbsentNotification: e.target.checked })}
          />
          <label htmlFor="enableAbsent">
            <span className="setting-icon">❌</span>
            Qatnashmagan bolalar haqida
          </label>
        </div>
        
        <div className="setting-item">
          <input
            type="checkbox"
            id="enableLate"
            checked={settings.enableLateNotification}
            onChange={e => onChange({ ...settings, enableLateNotification: e.target.checked })}
          />
          <label htmlFor="enableLate">
            <span className="setting-icon">⏰</span>
            Kechikkan bolalar haqida
          </label>
        </div>
        
        <div className="setting-item">
          <input
            type="checkbox"
            id="enablePresent"
            checked={settings.enablePresentNotification}
            onChange={e => onChange({ ...settings, enablePresentNotification: e.target.checked })}
          />
          <label htmlFor="enablePresent">
            <span className="setting-icon">✅</span>
            Kelgan bolalar haqida
          </label>
        </div>
        
        <div className="setting-item">
          <input
            type="checkbox"
            id="enablePickup"
            checked={settings.enablePickupNotification}
            onChange={e => onChange({ ...settings, enablePickupNotification: e.target.checked })}
          />
          <label htmlFor="enablePickup">
            <span className="setting-icon">🏠</span>
            Olib ketilganda
          </label>
        </div>
      </div>
      
      <div className="settings-group">
        <label className="setting-label">Yuborish kanallari</label>
        
        <div className="setting-item">
          <input
            type="checkbox"
            id="telegramEnabled"
            checked={settings.telegramEnabled}
            onChange={e => onChange({ ...settings, telegramEnabled: e.target.checked })}
          />
          <label htmlFor="telegramEnabled">
            <span className="setting-icon">📱</span>
            Telegram orqali
          </label>
        </div>
        
        <div className="setting-item">
          <input
            type="checkbox"
            id="smsEnabled"
            checked={settings.smsEnabled}
            onChange={e => onChange({ ...settings, smsEnabled: e.target.checked })}
          />
          <label htmlFor="smsEnabled">
            <span className="setting-icon">💬</span>
            SMS orqali
          </label>
        </div>
      </div>
      
      <div className="settings-group">
        <label className="setting-label">Kechikish vaqti (daqiqa)</label>
        <input
          type="number"
          min="0"
          max="120"
          value={settings.notificationDelay}
          onChange={e => onChange({ ...settings, notificationDelay: parseInt(e.target.value) || 0 })}
          className="delay-input"
        />
        <p className="setting-hint">
          Qatnashmagan bolalar haqida bildirishnoma qancha vaqtdan keyin yuborilsin
        </p>
      </div>
      
      <div className="settings-group">
        <label className="setting-label">Xabar tili</label>
        <select
          value={settings.language}
          onChange={e => onChange({ ...settings, language: e.target.value })}
          className="language-select"
        >
          <option value="uz">O'zbekcha</option>
          <option value="ru">Русский</option>
          <option value="en">English</option>
        </select>
      </div>
    </div>
  )
}

// Asosiy komponent
function AttendanceNotification({
  children = [],
  attendanceData = [],
  onSendNotification,
  onBulkSend
}) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [queue, setQueue] = useState([])
  const [history, setHistory] = useState([])
  const [showSettings, setShowSettings] = useState(false)
  const [sending, setSending] = useState(false)
  
  // Davomat o'zgarishini kuzatish
  useEffect(() => {
    if (!attendanceData.length) return
    
    const today = new Date().toISOString().split('T')[0]
    const todayAttendance = attendanceData.filter(a => a.date === today)
    
    // Qatnashmagan bolalarni aniqlash
    if (settings.enableAbsentNotification) {
      const absentChildren = children.filter(child => {
        const attendance = todayAttendance.find(a => a.childId === child.id)
        return !attendance || attendance.status === 'absent'
      })
      
      // Navbatga qo'shish
      absentChildren.forEach(child => {
        if (!queue.find(q => q.childId === child.id && q.type.id === 'absent')) {
          addToQueue(child, NOTIFICATION_TYPES.ABSENT)
        }
      })
    }
  }, [attendanceData, children, settings])
  
  // Navbatga qo'shish
  const addToQueue = useCallback((child, type, extraData = {}) => {
    const template = type.template[settings.language]
    const message = formatMessage(template, {
      childName: child.name,
      time: formatTime(new Date()),
      ...extraData
    })
    
    setQueue(prev => [...prev, {
      id: `${child.id}-${type.id}-${Date.now()}`,
      childId: child.id,
      childName: child.name,
      parentPhone: child.parentPhone,
      type,
      message,
      createdAt: new Date()
    }])
  }, [settings.language])
  
  // Bitta bildirishnoma yuborish
  const sendNotification = async (item) => {
    setSending(true)
    try {
      await onSendNotification?.({
        childId: item.childId,
        parentPhone: item.parentPhone,
        message: item.message,
        channel: settings.telegramEnabled ? 'telegram' : 'sms'
      })
      
      // Tarixga qo'shish
      setHistory(prev => [{
        ...item,
        status: 'sent',
        sentAt: new Date()
      }, ...prev])
      
      // Navbatdan o'chirish
      setQueue(prev => prev.filter(q => q.id !== item.id))
    } catch (error) {
      setHistory(prev => [{
        ...item,
        status: 'failed',
        sentAt: new Date(),
        error: error.message
      }, ...prev])
    } finally {
      setSending(false)
    }
  }
  
  // Barchasini yuborish
  const sendAll = async () => {
    setSending(true)
    try {
      await onBulkSend?.(queue.map(item => ({
        childId: item.childId,
        parentPhone: item.parentPhone,
        message: item.message,
        channel: settings.telegramEnabled ? 'telegram' : 'sms'
      })))
      
      // Tarixga qo'shish
      setHistory(prev => [
        ...queue.map(item => ({
          ...item,
          status: 'sent',
          sentAt: new Date()
        })),
        ...prev
      ])
      
      // Navbatni tozalash
      setQueue([])
    } catch (error) {
      console.error('Bulk send failed:', error)
    } finally {
      setSending(false)
    }
  }
  
  // Navbatdan o'chirish
  const removeFromQueue = (id) => {
    setQueue(prev => prev.filter(q => q.id !== id))
  }
  
  // Manual bildirishnoma qo'shish
  const addManualNotification = (child, typeId) => {
    const type = NOTIFICATION_TYPES[typeId.toUpperCase()]
    if (type && child) {
      addToQueue(child, type)
    }
  }
  
  return (
    <div className="attendance-notification">
      {/* Header */}
      <div className="notification-header">
        <div className="header-title">
          <span className="header-icon">🔔</span>
          <h3>Davomat Bildirishnomalari</h3>
        </div>
        <button 
          className={`settings-toggle ${showSettings ? 'active' : ''}`}
          onClick={() => setShowSettings(!showSettings)}
        >
          ⚙️ Sozlamalar
        </button>
      </div>
      
      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <NotificationSettings 
              settings={settings} 
              onChange={setSettings} 
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Quick Actions */}
      <div className="quick-actions">
        <h4>Tezkor bildirishnoma</h4>
        <div className="action-buttons">
          {Object.values(NOTIFICATION_TYPES).map(type => (
            <button
              key={type.id}
              className="action-btn"
              style={{ '--btn-color': type.color }}
              onClick={() => {
                // Modal ochish yoki dropdown ko'rsatish
              }}
            >
              <span className="action-icon">{type.icon}</span>
              <span className="action-name">{type.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Notification Queue */}
      <NotificationQueue
        queue={queue}
        onSend={sendNotification}
        onRemove={removeFromQueue}
        onSendAll={sendAll}
      />
      
      {/* Sending Indicator */}
      {sending && (
        <div className="sending-indicator">
          <span className="spinner">⏳</span>
          Yuborilmoqda...
        </div>
      )}
      
      {/* History */}
      <NotificationHistory history={history} />
    </div>
  )
}

export default AttendanceNotification
export { NOTIFICATION_TYPES, formatMessage, formatTime }
