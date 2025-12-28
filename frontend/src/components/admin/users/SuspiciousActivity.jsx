import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './SuspiciousActivity.css'

// Alert Severity Levels
const SEVERITY_LEVELS = {
  critical: { label: 'Kritik', color: '#ef4444', icon: '🚨', bgColor: '#fef2f2' },
  high: { label: 'Yuqori', color: '#f97316', icon: '⚠️', bgColor: '#fff7ed' },
  medium: { label: "O'rta", color: '#f59e0b', icon: '⚡', bgColor: '#fffbeb' },
  low: { label: 'Past', color: '#3b82f6', icon: 'ℹ️', bgColor: '#eff6ff' }
}

// Alert Types
const ALERT_TYPES = {
  failed_login: { label: 'Muvaffaqiyatsiz kirish', icon: '🔐' },
  unusual_location: { label: 'Noodatiy joylashuv', icon: '📍' },
  unusual_time: { label: 'Noodatiy vaqt', icon: '🕐' },
  multiple_devices: { label: 'Ko\'p qurilmalar', icon: '📱' },
  brute_force: { label: 'Brute force hujumi', icon: '💥' },
  account_locked: { label: 'Hisob bloklangan', icon: '🔒' },
  password_spray: { label: 'Parol spray hujumi', icon: '🌊' }
}

// Alert Card Component
function AlertCard({ alert, onDismiss, onInvestigate, onBlock }) {
  const severity = SEVERITY_LEVELS[alert.severity] || SEVERITY_LEVELS.medium
  const alertType = ALERT_TYPES[alert.type] || { label: alert.type, icon: '⚠️' }

  return (
    <motion.div
      className="alert-card"
      style={{ backgroundColor: severity.bgColor, borderLeftColor: severity.color }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <div className="alert-header">
        <span className="alert-icon">{severity.icon}</span>
        <div className="alert-title">
          <span className="alert-type">{alertType.icon} {alertType.label}</span>
          <span className="alert-time">
            {new Date(alert.timestamp).toLocaleString('uz-UZ')}
          </span>
        </div>
        <span 
          className="severity-badge"
          style={{ backgroundColor: severity.color }}
        >
          {severity.label}
        </span>
      </div>

      <div className="alert-body">
        <p className="alert-message">{alert.message}</p>
        
        <div className="alert-details">
          {alert.user && (
            <div className="detail-item">
              <span className="detail-label">Foydalanuvchi:</span>
              <span className="detail-value">{alert.user}</span>
            </div>
          )}
          {alert.ipAddress && (
            <div className="detail-item">
              <span className="detail-label">IP manzil:</span>
              <span className="detail-value">{alert.ipAddress}</span>
            </div>
          )}
          {alert.location && (
            <div className="detail-item">
              <span className="detail-label">Joylashuv:</span>
              <span className="detail-value">{alert.location}</span>
            </div>
          )}
          {alert.attempts && (
            <div className="detail-item">
              <span className="detail-label">Urinishlar:</span>
              <span className="detail-value">{alert.attempts}</span>
            </div>
          )}
        </div>
      </div>

      <div className="alert-actions">
        <button className="action-btn investigate" onClick={() => onInvestigate?.(alert)}>
          🔍 Tekshirish
        </button>
        {alert.userId && (
          <button className="action-btn block" onClick={() => onBlock?.(alert.userId)}>
            🚫 Bloklash
          </button>
        )}
        <button className="action-btn dismiss" onClick={() => onDismiss?.(alert.id)}>
          ✓ Yopish
        </button>
      </div>
    </motion.div>
  )
}

// Detection Rules Component
function DetectionRules({ rules, onToggle, onUpdateThreshold }) {
  return (
    <div className="detection-rules">
      <h3>⚙️ Aniqlash qoidalari</h3>
      <div className="rules-list">
        {rules.map(rule => (
          <div key={rule.id} className="rule-item">
            <div className="rule-info">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={rule.enabled}
                  onChange={() => onToggle?.(rule.id)}
                />
                <span className="toggle-switch"></span>
                <span className="rule-name">{rule.name}</span>
              </label>
              <span className="rule-description">{rule.description}</span>
            </div>
            
            {rule.threshold !== undefined && rule.enabled && (
              <div className="rule-threshold">
                <label>Chegara:</label>
                <input
                  type="number"
                  value={rule.threshold}
                  onChange={e => onUpdateThreshold?.(rule.id, Number(e.target.value))}
                  min={1}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Blocked IPs Component
function BlockedIPs({ blockedIPs, onUnblock }) {
  return (
    <div className="blocked-ips">
      <h3>🚫 Bloklangan IP manzillar</h3>
      {blockedIPs.length > 0 ? (
        <div className="ips-list">
          {blockedIPs.map(ip => (
            <div key={ip.address} className="ip-item">
              <div className="ip-info">
                <span className="ip-address">{ip.address}</span>
                <span className="ip-reason">{ip.reason}</span>
                <span className="ip-date">
                  {new Date(ip.blockedAt).toLocaleDateString('uz-UZ')}
                </span>
              </div>
              <button 
                className="unblock-btn"
                onClick={() => onUnblock?.(ip.address)}
              >
                Blokdan chiqarish
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-message">Bloklangan IP manzillar yo'q</p>
      )}
    </div>
  )
}


// Default Detection Rules
const DEFAULT_DETECTION_RULES = [
  { id: 'failed_login', name: 'Muvaffaqiyatsiz kirishlar', description: 'Ketma-ket muvaffaqiyatsiz kirish urinishlari', enabled: true, threshold: 5 },
  { id: 'unusual_location', name: 'Noodatiy joylashuv', description: 'Yangi yoki noodatiy geografik joylashuvdan kirish', enabled: true },
  { id: 'unusual_time', name: 'Noodatiy vaqt', description: 'Ish vaqtidan tashqari kirish', enabled: false },
  { id: 'multiple_devices', name: 'Ko\'p qurilmalar', description: 'Bir vaqtda ko\'p qurilmalardan kirish', enabled: true, threshold: 3 },
  { id: 'brute_force', name: 'Brute force', description: 'Tez ketma-ket kirish urinishlari', enabled: true, threshold: 10 },
  { id: 'password_spray', name: 'Parol spray', description: 'Bir xil parol bilan ko\'p hisobga kirish urinishi', enabled: true }
]

// Main Suspicious Activity Component
function SuspiciousActivity({
  alerts = [],
  detectionRules = DEFAULT_DETECTION_RULES,
  blockedIPs = [],
  onDismissAlert,
  onInvestigateAlert,
  onBlockUser,
  onToggleRule,
  onUpdateThreshold,
  onUnblockIP,
  onBlockIP
}) {
  const [filter, setFilter] = useState('all')
  const [showRules, setShowRules] = useState(false)
  const [showBlockedIPs, setShowBlockedIPs] = useState(false)
  const [newBlockIP, setNewBlockIP] = useState('')

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true
    return alert.severity === filter
  })

  const alertCounts = {
    critical: alerts.filter(a => a.severity === 'critical').length,
    high: alerts.filter(a => a.severity === 'high').length,
    medium: alerts.filter(a => a.severity === 'medium').length,
    low: alerts.filter(a => a.severity === 'low').length
  }

  const handleBlockIP = () => {
    if (newBlockIP.trim()) {
      onBlockIP?.(newBlockIP, 'Qo\'lda bloklangan')
      setNewBlockIP('')
    }
  }

  return (
    <div className="suspicious-activity">
      {/* Header */}
      <div className="activity-header">
        <div className="header-info">
          <h2>🛡️ Shubhali faoliyat</h2>
          <p>{alerts.length} ta ogohlantirish</p>
        </div>

        <div className="header-actions">
          <button 
            className={`toggle-btn ${showRules ? 'active' : ''}`}
            onClick={() => { setShowRules(!showRules); setShowBlockedIPs(false); }}
          >
            ⚙️ Qoidalar
          </button>
          <button 
            className={`toggle-btn ${showBlockedIPs ? 'active' : ''}`}
            onClick={() => { setShowBlockedIPs(!showBlockedIPs); setShowRules(false); }}
          >
            🚫 Bloklangan ({blockedIPs.length})
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="alert-stats">
        {Object.entries(SEVERITY_LEVELS).map(([key, level]) => (
          <div 
            key={key}
            className={`stat-card ${filter === key ? 'active' : ''}`}
            style={{ borderColor: level.color }}
            onClick={() => setFilter(filter === key ? 'all' : key)}
          >
            <span className="stat-icon">{level.icon}</span>
            <span className="stat-count">{alertCounts[key]}</span>
            <span className="stat-label">{level.label}</span>
          </div>
        ))}
      </div>

      {/* Detection Rules Panel */}
      <AnimatePresence>
        {showRules && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <DetectionRules
              rules={detectionRules}
              onToggle={onToggleRule}
              onUpdateThreshold={onUpdateThreshold}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blocked IPs Panel */}
      <AnimatePresence>
        {showBlockedIPs && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="block-ip-form">
              <input
                type="text"
                value={newBlockIP}
                onChange={e => setNewBlockIP(e.target.value)}
                placeholder="IP manzilni kiriting..."
              />
              <button onClick={handleBlockIP}>🚫 Bloklash</button>
            </div>
            <BlockedIPs
              blockedIPs={blockedIPs}
              onUnblock={onUnblockIP}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alerts List */}
      <div className="alerts-list">
        <AnimatePresence>
          {filteredAlerts.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onDismiss={onDismissAlert}
              onInvestigate={onInvestigateAlert}
              onBlock={onBlockUser}
            />
          ))}
        </AnimatePresence>

        {filteredAlerts.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">✅</span>
            <h3>Ogohlantirishlar yo'q</h3>
            <p>
              {filter === 'all' 
                ? "Hozircha shubhali faoliyat aniqlanmadi"
                : `${SEVERITY_LEVELS[filter]?.label} darajadagi ogohlantirishlar yo'q`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SuspiciousActivity
export {
  AlertCard,
  DetectionRules,
  BlockedIPs,
  SEVERITY_LEVELS,
  ALERT_TYPES,
  DEFAULT_DETECTION_RULES
}
