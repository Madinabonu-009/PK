import { useState, forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './AlertCard.css'

// Alert severity configurations
const SEVERITY_CONFIG = {
  critical: {
    icon: '🚨',
    color: '#dc2626',
    bgColor: 'rgba(220, 38, 38, 0.1)',
    borderColor: '#dc2626',
    label: 'Muhim'
  },
  warning: {
    icon: '⚠️',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: '#f59e0b',
    label: 'Ogohlantirish'
  },
  info: {
    icon: 'ℹ️',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3b82f6',
    label: "Ma'lumot"
  },
  success: {
    icon: '✅',
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: '#22c55e',
    label: 'Muvaffaqiyat'
  }
}

// Alert type configurations
const ALERT_TYPES = {
  absent_children: {
    title: 'Kelmaganlar',
    icon: '👶',
    actionLabel: "Ko'rish"
  },
  pending_payments: {
    title: 'Kutilayotgan to\'lovlar',
    icon: '💰',
    actionLabel: "To'lovlar"
  },
  new_enrollments: {
    title: 'Yangi arizalar',
    icon: '📝',
    actionLabel: "Ko'rish"
  },
  expiring_documents: {
    title: 'Muddati tugayotgan hujjatlar',
    icon: '📄',
    actionLabel: 'Tekshirish'
  },
  birthday_today: {
    title: "Bugungi tug'ilgan kunlar",
    icon: '🎂',
    actionLabel: 'Tabrik'
  },
  low_attendance: {
    title: 'Past davomat',
    icon: '📉',
    actionLabel: 'Tahlil'
  },
  overdue_payments: {
    title: "Muddati o'tgan to'lovlar",
    icon: '⏰',
    actionLabel: 'Eslatma'
  },
  system_update: {
    title: 'Tizim yangilanishi',
    icon: '🔄',
    actionLabel: 'Batafsil'
  }
}

// Single Alert Card
const AlertCard = forwardRef(function AlertCard({
  alert,
  onAction,
  onDismiss,
  compact = false
}, ref) {
  const [isDismissing, setIsDismissing] = useState(false)
  
  const severity = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info
  const alertType = ALERT_TYPES[alert.type] || { title: alert.title, icon: '📌', actionLabel: "Ko'rish" }

  const handleDismiss = () => {
    setIsDismissing(true)
    setTimeout(() => {
      onDismiss?.(alert.id)
    }, 300)
  }

  return (
    <motion.div
      ref={ref}
      className={`alert-card alert-card--${alert.severity} ${compact ? 'alert-card--compact' : ''}`}
      style={{ 
        borderLeftColor: severity.borderColor,
        backgroundColor: severity.bgColor
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: isDismissing ? 0 : 1, x: isDismissing ? 20 : 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <div className="alert-icon-wrapper">
        <span className="alert-icon">{alertType.icon}</span>
      </div>

      <div className="alert-content">
        <div className="alert-header">
          <h4 className="alert-title">{alertType.title}</h4>
          <span 
            className="alert-severity-badge"
            style={{ color: severity.color, backgroundColor: severity.bgColor }}
          >
            {severity.icon} {severity.label}
          </span>
        </div>
        
        {alert.message && (
          <p className="alert-message">{alert.message}</p>
        )}

        {alert.count !== undefined && (
          <div className="alert-count">
            <span className="alert-count-value">{alert.count}</span>
            <span className="alert-count-label">{alert.countLabel || 'ta'}</span>
          </div>
        )}

        {alert.items && alert.items.length > 0 && (
          <div className="alert-items">
            {alert.items.slice(0, 3).map((item, index) => (
              <span key={index} className="alert-item-tag">
                {item}
              </span>
            ))}
            {alert.items.length > 3 && (
              <span className="alert-item-more">
                +{alert.items.length - 3} ta
              </span>
            )}
          </div>
        )}
      </div>

      <div className="alert-actions">
        {onAction && (
          <button 
            className="alert-action-btn"
            onClick={() => onAction(alert)}
            style={{ color: severity.color }}
          >
            {alertType.actionLabel}
          </button>
        )}
        {onDismiss && (
          <button 
            className="alert-dismiss-btn"
            onClick={handleDismiss}
            aria-label="Yopish"
          >
            ✕
          </button>
        )}
      </div>
    </motion.div>
  )
})
function AlertList({
  alerts = [],
  onAction,
  onDismiss,
  onDismissAll,
  maxItems = 5,
  loading = false,
  title = "Diqqatga sazovor",
  showHeader = true,
  groupBySeverity = false
}) {
  const [filter, setFilter] = useState('all')

  // Filter alerts
  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(a => a.severity === filter)

  // Group by severity if needed
  const groupedAlerts = groupBySeverity 
    ? {
        critical: filteredAlerts.filter(a => a.severity === 'critical'),
        warning: filteredAlerts.filter(a => a.severity === 'warning'),
        info: filteredAlerts.filter(a => a.severity === 'info')
      }
    : null

  // Count by severity
  const severityCounts = {
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    info: alerts.filter(a => a.severity === 'info').length
  }

  if (loading) {
    return (
      <div className="alert-list">
        {showHeader && (
          <div className="alert-list-header">
            <h3 className="alert-list-title">{title}</h3>
          </div>
        )}
        <AlertListSkeleton count={3} />
      </div>
    )
  }

  return (
    <div className="alert-list">
      {showHeader && (
        <div className="alert-list-header">
          <div className="alert-list-title-row">
            <h3 className="alert-list-title">{title}</h3>
            {alerts.length > 0 && (
              <span className="alert-list-count">{alerts.length}</span>
            )}
          </div>
          
          {alerts.length > 0 && (
            <div className="alert-list-actions">
              <div className="alert-severity-filters">
                <button 
                  className={`severity-filter ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  Barchasi
                </button>
                {severityCounts.critical > 0 && (
                  <button 
                    className={`severity-filter severity-filter--critical ${filter === 'critical' ? 'active' : ''}`}
                    onClick={() => setFilter('critical')}
                  >
                    🚨 {severityCounts.critical}
                  </button>
                )}
                {severityCounts.warning > 0 && (
                  <button 
                    className={`severity-filter severity-filter--warning ${filter === 'warning' ? 'active' : ''}`}
                    onClick={() => setFilter('warning')}
                  >
                    ⚠️ {severityCounts.warning}
                  </button>
                )}
              </div>
              
              {onDismissAll && (
                <button 
                  className="alert-dismiss-all"
                  onClick={onDismissAll}
                >
                  Barchasini yopish
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="alert-list-content">
        {filteredAlerts.length === 0 ? (
          <div className="alert-empty">
            <span className="alert-empty-icon">✨</span>
            <p className="alert-empty-text">Hozircha ogohlantirish yo'q</p>
            <p className="alert-empty-hint">Hammasi yaxshi!</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredAlerts.slice(0, maxItems).map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onAction={onAction}
                onDismiss={onDismiss}
              />
            ))}
          </AnimatePresence>
        )}

        {filteredAlerts.length > maxItems && (
          <button className="alert-show-more">
            Yana {filteredAlerts.length - maxItems} ta ko'rish
          </button>
        )}
      </div>
    </div>
  )
}

// Skeleton Loader
function AlertListSkeleton({ count = 3 }) {
  return (
    <div className="alert-list-skeleton">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="alert-skeleton-item">
          <div className="alert-skeleton-icon" />
          <div className="alert-skeleton-content">
            <div className="alert-skeleton-title" />
            <div className="alert-skeleton-message" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Quick Alert Summary Widget
export function AlertSummary({ alerts = [], onClick }) {
  const criticalCount = alerts.filter(a => a.severity === 'critical').length
  const warningCount = alerts.filter(a => a.severity === 'warning').length
  const totalCount = alerts.length

  if (totalCount === 0) return null

  return (
    <motion.div 
      className="alert-summary"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="alert-summary-icon">
        {criticalCount > 0 ? '🚨' : '⚠️'}
      </div>
      <div className="alert-summary-content">
        <span className="alert-summary-count">{totalCount}</span>
        <span className="alert-summary-label">ta ogohlantirish</span>
      </div>
      {criticalCount > 0 && (
        <span className="alert-summary-critical">
          {criticalCount} muhim
        </span>
      )}
    </motion.div>
  )
}

export default AlertList
export { AlertCard, AlertListSkeleton, SEVERITY_CONFIG, ALERT_TYPES }
