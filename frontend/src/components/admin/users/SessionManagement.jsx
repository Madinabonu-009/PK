import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './SessionManagement.css'

// Session Status
const SESSION_STATUS = {
  active: { label: 'Faol', color: '#10b981', icon: '🟢' },
  idle: { label: 'Kutish', color: '#f59e0b', icon: '🟡' },
  expired: { label: 'Muddati tugagan', color: '#ef4444', icon: '🔴' }
}

// Device Types
const DEVICE_TYPES = {
  desktop: { label: 'Kompyuter', icon: '💻' },
  mobile: { label: 'Telefon', icon: '📱' },
  tablet: { label: 'Planshet', icon: '📲' },
  unknown: { label: 'Noma\'lum', icon: '❓' }
}

// Session Card
function SessionCard({ session, isCurrentSession, onTerminate }) {
  const status = SESSION_STATUS[session.status] || SESSION_STATUS.active
  const device = DEVICE_TYPES[session.deviceType] || DEVICE_TYPES.unknown

  return (
    <motion.div
      className={`session-card ${isCurrentSession ? 'current' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="session-device">
        <span className="device-icon">{device.icon}</span>
        <div className="device-info">
          <span className="device-name">{session.deviceName || device.label}</span>
          <span className="device-browser">{session.browser}</span>
        </div>
      </div>

      <div className="session-details">
        <div className="detail-row">
          <span className="detail-label">IP manzil:</span>
          <span className="detail-value">{session.ipAddress}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Joylashuv:</span>
          <span className="detail-value">{session.location || "Noma'lum"}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Kirish vaqti:</span>
          <span className="detail-value">
            {new Date(session.loginTime).toLocaleString('uz-UZ')}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Oxirgi faollik:</span>
          <span className="detail-value">
            {new Date(session.lastActivity).toLocaleString('uz-UZ')}
          </span>
        </div>
      </div>

      <div className="session-footer">
        <span className="status-badge" style={{ color: status.color }}>
          {status.icon} {status.label}
        </span>
        
        {isCurrentSession ? (
          <span className="current-badge">Joriy sessiya</span>
        ) : (
          <button 
            className="terminate-btn"
            onClick={() => onTerminate?.(session.id)}
          >
            🚫 Tugatish
          </button>
        )}
      </div>
    </motion.div>
  )
}

// Session Timeout Settings
function TimeoutSettings({ settings, onSave }) {
  const [formData, setFormData] = useState({
    sessionTimeout: settings?.sessionTimeout || 30,
    idleTimeout: settings?.idleTimeout || 15,
    rememberMe: settings?.rememberMe ?? true,
    rememberMeDuration: settings?.rememberMeDuration || 7
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave?.(formData)
  }

  return (
    <form className="timeout-settings" onSubmit={handleSubmit}>
      <h3>⏱️ Vaqt sozlamalari</h3>

      <div className="form-group">
        <label>Sessiya muddati (daqiqa)</label>
        <input
          type="number"
          value={formData.sessionTimeout}
          onChange={e => setFormData(prev => ({ ...prev, sessionTimeout: Number(e.target.value) }))}
          min={5}
          max={480}
        />
        <span className="hint">Faoliyatsiz bo'lganda sessiya tugaydi</span>
      </div>

      <div className="form-group">
        <label>Kutish muddati (daqiqa)</label>
        <input
          type="number"
          value={formData.idleTimeout}
          onChange={e => setFormData(prev => ({ ...prev, idleTimeout: Number(e.target.value) }))}
          min={1}
          max={60}
        />
        <span className="hint">Kutish holatiga o'tish vaqti</span>
      </div>

      <div className="form-group">
        <label className="toggle-label">
          <span>"Meni eslab qol" funksiyasi</span>
          <input
            type="checkbox"
            checked={formData.rememberMe}
            onChange={e => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
          />
          <span className="toggle-switch"></span>
        </label>
      </div>

      {formData.rememberMe && (
        <div className="form-group">
          <label>"Meni eslab qol" muddati (kun)</label>
          <select
            value={formData.rememberMeDuration}
            onChange={e => setFormData(prev => ({ ...prev, rememberMeDuration: Number(e.target.value) }))}
          >
            <option value={1}>1 kun</option>
            <option value={7}>7 kun</option>
            <option value={14}>14 kun</option>
            <option value={30}>30 kun</option>
          </select>
        </div>
      )}

      <button type="submit" className="save-btn">
        💾 Saqlash
      </button>
    </form>
  )
}


// Main Session Management Component
function SessionManagement({
  sessions = [],
  currentSessionId,
  timeoutSettings = {},
  onTerminateSession,
  onTerminateAllSessions,
  onSaveTimeoutSettings
}) {
  const [showSettings, setShowSettings] = useState(false)
  const [filter, setFilter] = useState('all')

  const filteredSessions = sessions.filter(session => {
    if (filter === 'all') return true
    return session.status === filter
  })

  const activeSessions = sessions.filter(s => s.status === 'active')

  const handleTerminateAll = () => {
    if (window.confirm("Joriy sessiyadan tashqari barcha sessiyalarni tugatmoqchimisiz?")) {
      onTerminateAllSessions?.()
    }
  }

  return (
    <div className="session-management">
      {/* Header */}
      <div className="management-header">
        <div className="header-info">
          <h2>🔐 Sessiya boshqaruvi</h2>
          <p>{activeSessions.length} ta faol sessiya</p>
        </div>

        <div className="header-actions">
          <button 
            className="settings-btn"
            onClick={() => setShowSettings(!showSettings)}
          >
            ⚙️ Sozlamalar
          </button>
          {sessions.length > 1 && (
            <button 
              className="terminate-all-btn"
              onClick={handleTerminateAll}
            >
              🚫 Barchasini tugatish
            </button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="settings-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <TimeoutSettings
              settings={timeoutSettings}
              onSave={onSaveTimeoutSettings}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="session-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Barchasi ({sessions.length})
        </button>
        {Object.entries(SESSION_STATUS).map(([key, status]) => {
          const count = sessions.filter(s => s.status === key).length
          return (
            <button
              key={key}
              className={`filter-btn ${filter === key ? 'active' : ''}`}
              onClick={() => setFilter(key)}
            >
              {status.icon} {status.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Sessions List */}
      <div className="sessions-list">
        <AnimatePresence>
          {filteredSessions.map(session => (
            <SessionCard
              key={session.id}
              session={session}
              isCurrentSession={session.id === currentSessionId}
              onTerminate={onTerminateSession}
            />
          ))}
        </AnimatePresence>

        {filteredSessions.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <p>Sessiyalar topilmadi</p>
          </div>
        )}
      </div>

      {/* Security Tips */}
      <div className="security-tips">
        <h3>🛡️ Xavfsizlik maslahatlari</h3>
        <ul>
          <li>Noma'lum qurilmalardan kirishlarni tekshiring</li>
          <li>Shubhali sessiyalarni darhol tugating</li>
          <li>Umumiy kompyuterlarda "Meni eslab qol" ni ishlatmang</li>
          <li>Parolingizni muntazam yangilab turing</li>
        </ul>
      </div>
    </div>
  )
}

export default SessionManagement
export {
  SessionCard,
  TimeoutSettings,
  SESSION_STATUS,
  DEVICE_TYPES
}
