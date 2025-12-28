import { motion } from 'framer-motion'
import './GroupCard.css'

// Capacity indicator colors
function getCapacityColor(percentage) {
  if (percentage >= 90) return '#ef4444'
  if (percentage >= 70) return '#f59e0b'
  return '#22c55e'
}

// Group Avatar
export function GroupAvatar({ photo, name, size = 'medium' }) {
  const sizes = { small: 40, medium: 56, large: 80 }
  const sizeValue = sizes[size] || sizes.medium
  
  const colors = [
    'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
    'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
  ]
  
  const colorIndex = name?.charCodeAt(0) % colors.length || 0

  return (
    <div 
      className={`group-avatar group-avatar--${size}`}
      style={{ width: sizeValue, height: sizeValue }}
    >
      {photo ? (
        <img src={photo} alt={name} className="group-avatar-img" />
      ) : (
        <div 
          className="group-avatar-placeholder"
          style={{ background: colors[colorIndex] }}
        >
          {name?.charAt(0) || '?'}
        </div>
      )}
    </div>
  )
}

// Capacity Bar
export function CapacityBar({ current, max, showLabel = true }) {
  const percentage = max > 0 ? Math.round((current / max) * 100) : 0
  const color = getCapacityColor(percentage)

  return (
    <div className="capacity-bar-container">
      <div className="capacity-bar">
        <div 
          className="capacity-bar-fill"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <span className="capacity-label" style={{ color }}>
          {current}/{max} ({percentage}%)
        </span>
      )}
    </div>
  )
}

// Teacher Badge
export function TeacherBadge({ teacher, role = 'primary' }) {
  return (
    <div className={`teacher-badge teacher-badge--${role}`}>
      <div className="teacher-avatar">
        {teacher.avatar ? (
          <img src={teacher.avatar} alt={teacher.name} />
        ) : (
          <span>{teacher.name?.charAt(0)}</span>
        )}
      </div>
      <div className="teacher-info">
        <span className="teacher-name">{teacher.name}</span>
        <span className="teacher-role">
          {role === 'primary' ? 'Asosiy' : 'Yordamchi'}
        </span>
      </div>
    </div>
  )
}

// Main Group Card Component
function GroupCard({
  group,
  onClick,
  onQuickAction,
  selected = false,
  variant = 'default', // default, compact, list
  showTeachers = true,
  showCapacity = true
}) {
  const capacityPercentage = group.capacity > 0 
    ? Math.round((group.currentCount / group.capacity) * 100) 
    : 0

  const handleQuickAction = (e, action) => {
    e.stopPropagation()
    onQuickAction?.(group, action)
  }

  if (variant === 'list') {
    return (
      <motion.div
        className={`group-card group-card--list ${selected ? 'selected' : ''}`}
        onClick={() => onClick?.(group)}
        whileHover={{ backgroundColor: 'var(--hover-bg)' }}
      >
        <GroupAvatar photo={group.photo} name={group.name} size="small" />
        <div className="group-card-info">
          <span className="group-card-name">{group.name}</span>
          <span className="group-card-age">
            {group.ageRange?.min}-{group.ageRange?.max} yosh
          </span>
        </div>
        <CapacityBar 
          current={group.currentCount} 
          max={group.capacity} 
          showLabel={false}
        />
        <span className="group-count">{group.currentCount}/{group.capacity}</span>
      </motion.div>
    )
  }

  if (variant === 'compact') {
    return (
      <motion.div
        className={`group-card group-card--compact ${selected ? 'selected' : ''}`}
        onClick={() => onClick?.(group)}
        whileHover={{ translateY: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <GroupAvatar photo={group.photo} name={group.name} size="small" />
        <div className="group-card-content">
          <span className="group-card-name">{group.name}</span>
          <CapacityBar current={group.currentCount} max={group.capacity} />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={`group-card ${selected ? 'selected' : ''}`}
      onClick={() => onClick?.(group)}
      whileHover={{ translateY: -4, boxShadow: 'var(--shadow-lg)' }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="group-card-header">
        <GroupAvatar photo={group.photo} name={group.name} size="large" />
        <div className="group-card-header-info">
          <h3 className="group-card-name">{group.name}</h3>
          <span className="group-card-age">
            {group.ageRange?.min}-{group.ageRange?.max} yosh
          </span>
        </div>
      </div>

      {/* Capacity */}
      {showCapacity && (
        <div className="group-card-capacity">
          <div className="capacity-header">
            <span className="capacity-title">Sig'im</span>
            <span 
              className="capacity-status"
              style={{ color: getCapacityColor(capacityPercentage) }}
            >
              {capacityPercentage >= 90 ? '⚠️ To\'liq' : 
               capacityPercentage >= 70 ? '📊 Ko\'p' : '✓ Bo\'sh joy bor'}
            </span>
          </div>
          <CapacityBar current={group.currentCount} max={group.capacity} />
        </div>
      )}

      {/* Teachers */}
      {showTeachers && group.teachers?.length > 0 && (
        <div className="group-card-teachers">
          <span className="teachers-title">O'qituvchilar</span>
          <div className="teachers-list">
            {group.teachers.slice(0, 2).map((teacher, index) => (
              <TeacherBadge 
                key={teacher.id || index} 
                teacher={teacher} 
                role={teacher.role || (index === 0 ? 'primary' : 'secondary')}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="group-card-actions">
        <button 
          className="group-action-btn"
          onClick={(e) => handleQuickAction(e, 'view')}
          title="Ko'rish"
        >
          👁️ Ko'rish
        </button>
        <button 
          className="group-action-btn"
          onClick={(e) => handleQuickAction(e, 'attendance')}
          title="Davomat"
        >
          ✓ Davomat
        </button>
        <button 
          className="group-action-btn"
          onClick={(e) => handleQuickAction(e, 'edit')}
          title="Tahrirlash"
        >
          ✏️
        </button>
      </div>
    </motion.div>
  )
}

// Group Grid Component
export function GroupGrid({ groups = [], onGroupClick, onQuickAction, loading = false }) {
  if (loading) {
    return (
      <div className="group-grid">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="group-card group-card--skeleton">
            <div className="skeleton-avatar" />
            <div className="skeleton-content">
              <div className="skeleton-title" />
              <div className="skeleton-bar" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className="group-empty">
        <span className="group-empty-icon">👥</span>
        <p>Guruhlar topilmadi</p>
      </div>
    )
  }

  return (
    <div className="group-grid">
      {groups.map(group => (
        <GroupCard
          key={group.id}
          group={group}
          onClick={onGroupClick}
          onQuickAction={onQuickAction}
        />
      ))}
    </div>
  )
}

export default GroupCard
export { getCapacityColor }
