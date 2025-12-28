import { motion } from 'framer-motion'
import './ChildCard.css'

// Status badge configurations
const STATUS_CONFIG = {
  active: { label: 'Faol', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
  inactive: { label: 'Nofaol', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)' },
  pending: { label: 'Kutilmoqda', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' }
}

// Attendance status
const ATTENDANCE_STATUS = {
  present: { icon: '✓', color: '#22c55e', label: 'Keldi' },
  absent: { icon: '✕', color: '#ef4444', label: 'Kelmadi' },
  late: { icon: '⏰', color: '#f59e0b', label: 'Kechikdi' },
  excused: { icon: '📝', color: '#6366f1', label: 'Sababli' }
}

// Allergy Badge
export function AllergyBadge({ allergies = [], compact = false }) {
  if (!allergies || allergies.length === 0) return null

  return (
    <div className={`allergy-badges ${compact ? 'compact' : ''}`}>
      <span className="allergy-icon" title="Allergiya mavjud">⚠️</span>
      {!compact && allergies.slice(0, 2).map((allergy, i) => (
        <span key={i} className="allergy-tag">{allergy}</span>
      ))}
      {allergies.length > 2 && (
        <span className="allergy-more">+{allergies.length - 2}</span>
      )}
    </div>
  )
}

// Payment Status Badge
export function PaymentBadge({ status, amount }) {
  const configs = {
    paid: { icon: '✓', color: '#22c55e', label: "To'langan" },
    partial: { icon: '◐', color: '#f59e0b', label: 'Qisman' },
    unpaid: { icon: '!', color: '#ef4444', label: 'Qarzdor' }
  }
  
  const config = configs[status] || configs.unpaid

  return (
    <span 
      className="payment-badge"
      style={{ color: config.color, backgroundColor: `${config.color}15` }}
      title={amount ? `${amount.toLocaleString()} so'm` : ''}
    >
      <span className="payment-badge-icon">{config.icon}</span>
      {config.label}
    </span>
  )
}

// Child Avatar
export function ChildAvatar({ photo, name, size = 'medium', showBadge, badgeContent }) {
  const sizes = {
    small: 32,
    medium: 48,
    large: 64,
    xlarge: 96
  }

  const sizeValue = sizes[size] || sizes.medium
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'

  return (
    <div className={`child-avatar child-avatar--${size}`} style={{ width: sizeValue, height: sizeValue }}>
      {photo ? (
        <img src={photo} alt={name} className="child-avatar-img" />
      ) : (
        <div className="child-avatar-placeholder">
          {initials}
        </div>
      )}
      {showBadge && (
        <span className="child-avatar-badge">{badgeContent}</span>
      )}
    </div>
  )
}

// Main Child Card Component
function ChildCard({
  child,
  onClick,
  onQuickAction,
  selected = false,
  showAttendance = false,
  attendanceStatus,
  compact = false,
  variant = 'default' // default, grid, list
}) {
  const status = STATUS_CONFIG[child.status || 'active']

  const handleQuickAction = (e, action) => {
    e.stopPropagation()
    onQuickAction?.(child, action)
  }

  if (variant === 'list') {
    return (
      <motion.div
        className={`child-card child-card--list ${selected ? 'selected' : ''}`}
        onClick={() => onClick?.(child)}
        whileHover={{ backgroundColor: 'var(--hover-bg)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <ChildAvatar photo={child.photo} name={`${child.firstName} ${child.lastName}`} size="small" />
        
        <div className="child-card-info">
          <span className="child-card-name">{child.firstName} {child.lastName}</span>
          <span className="child-card-group">{child.groupName || 'Guruh belgilanmagan'}</span>
        </div>

        {child.allergies?.length > 0 && (
          <AllergyBadge allergies={child.allergies} compact />
        )}

        {showAttendance && attendanceStatus && (
          <span 
            className="child-attendance-badge"
            style={{ color: ATTENDANCE_STATUS[attendanceStatus]?.color }}
          >
            {ATTENDANCE_STATUS[attendanceStatus]?.icon}
          </span>
        )}

        <div className="child-card-actions">
          <button 
            className="child-action-btn"
            onClick={(e) => handleQuickAction(e, 'view')}
            title="Ko'rish"
          >
            👁️
          </button>
          <button 
            className="child-action-btn"
            onClick={(e) => handleQuickAction(e, 'edit')}
            title="Tahrirlash"
          >
            ✏️
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={`child-card ${compact ? 'child-card--compact' : ''} ${selected ? 'selected' : ''}`}
      onClick={() => onClick?.(child)}
      whileHover={{ translateY: -4, boxShadow: 'var(--shadow-lg)' }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Status indicator */}
      <div 
        className="child-card-status-bar"
        style={{ backgroundColor: status.color }}
      />

      {/* Header */}
      <div className="child-card-header">
        <ChildAvatar 
          photo={child.photo} 
          name={`${child.firstName} ${child.lastName}`}
          size={compact ? 'small' : 'medium'}
        />
        
        <div className="child-card-header-info">
          <h4 className="child-card-name">{child.firstName} {child.lastName}</h4>
          <span className="child-card-age">
            {calculateAge(child.birthDate)} yosh
          </span>
        </div>

        {showAttendance && (
          <div 
            className="child-attendance-indicator"
            style={{ 
              backgroundColor: ATTENDANCE_STATUS[attendanceStatus]?.color || '#e5e7eb'
            }}
            title={ATTENDANCE_STATUS[attendanceStatus]?.label || 'Belgilanmagan'}
          >
            {ATTENDANCE_STATUS[attendanceStatus]?.icon || '?'}
          </div>
        )}
      </div>

      {/* Body */}
      {!compact && (
        <div className="child-card-body">
          <div className="child-card-detail">
            <span className="child-card-label">Guruh:</span>
            <span className="child-card-value">{child.groupName || '—'}</span>
          </div>
          <div className="child-card-detail">
            <span className="child-card-label">Ota-ona:</span>
            <span className="child-card-value">{child.parentName || '—'}</span>
          </div>
          <div className="child-card-detail">
            <span className="child-card-label">Telefon:</span>
            <span className="child-card-value">{child.parentPhone || '—'}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="child-card-footer">
        {child.allergies?.length > 0 && (
          <AllergyBadge allergies={child.allergies} compact={compact} />
        )}
        
        <span 
          className="child-status-badge"
          style={{ color: status.color, backgroundColor: status.bg }}
        >
          {status.label}
        </span>
      </div>

      {/* Quick Actions */}
      <div className="child-card-quick-actions">
        <button 
          className="child-quick-btn"
          onClick={(e) => handleQuickAction(e, 'attendance')}
          title="Davomat"
        >
          ✓
        </button>
        <button 
          className="child-quick-btn"
          onClick={(e) => handleQuickAction(e, 'payment')}
          title="To'lov"
        >
          💰
        </button>
        <button 
          className="child-quick-btn"
          onClick={(e) => handleQuickAction(e, 'message')}
          title="Xabar"
        >
          💬
        </button>
      </div>
    </motion.div>
  )
}

// Helper function to calculate age
function calculateAge(birthDate) {
  if (!birthDate) return '?'
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

export default ChildCard
export { calculateAge, STATUS_CONFIG, ATTENDANCE_STATUS }
