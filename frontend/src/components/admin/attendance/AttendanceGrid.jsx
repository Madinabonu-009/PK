import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChildAvatar } from '../children/ChildCard'
import './AttendanceGrid.css'

// Attendance status configurations
const ATTENDANCE_STATUSES = {
  present: { 
    icon: '✓', 
    label: 'Keldi', 
    color: '#22c55e', 
    bg: 'rgba(34, 197, 94, 0.1)' 
  },
  absent: { 
    icon: '✕', 
    label: 'Kelmadi', 
    color: '#ef4444', 
    bg: 'rgba(239, 68, 68, 0.1)' 
  },
  late: { 
    icon: '⏰', 
    label: 'Kechikdi', 
    color: '#f59e0b', 
    bg: 'rgba(245, 158, 11, 0.1)' 
  },
  excused: { 
    icon: '📝', 
    label: 'Sababli', 
    color: '#6366f1', 
    bg: 'rgba(99, 102, 241, 0.1)' 
  }
}

// Statistics Card
function AttendanceStats({ stats }) {
  return (
    <div className="attendance-stats">
      <div className="attendance-stat">
        <span className="stat-value" style={{ color: '#22c55e' }}>{stats.present}</span>
        <span className="stat-label">Keldi</span>
      </div>
      <div className="attendance-stat">
        <span className="stat-value" style={{ color: '#ef4444' }}>{stats.absent}</span>
        <span className="stat-label">Kelmadi</span>
      </div>
      <div className="attendance-stat">
        <span className="stat-value" style={{ color: '#f59e0b' }}>{stats.late}</span>
        <span className="stat-label">Kechikdi</span>
      </div>
      <div className="attendance-stat">
        <span className="stat-value" style={{ color: '#6366f1' }}>{stats.excused}</span>
        <span className="stat-label">Sababli</span>
      </div>
      <div className="attendance-stat attendance-stat--total">
        <span className="stat-value">{stats.total}</span>
        <span className="stat-label">Jami</span>
      </div>
    </div>
  )
}

// Single Child Attendance Card
function AttendanceCard({ 
  child, 
  status, 
  lateInfo,
  onStatusChange, 
  onLateClick,
  showDetails = false,
  disabled = false 
}) {
  const currentStatus = ATTENDANCE_STATUSES[status]

  const handleStatusClick = (newStatus) => {
    if (disabled) return
    
    // If clicking late, open late modal
    if (newStatus === 'late') {
      onLateClick?.(child)
      return
    }
    
    onStatusChange(child.id, newStatus)
  }

  // Format late time
  const formatLateTime = (time) => {
    if (!time) return null
    return time
  }

  return (
    <motion.div
      className={`attendance-card ${status ? `attendance-card--${status}` : ''}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      style={{ 
        borderColor: currentStatus?.color || 'var(--border-color)',
        backgroundColor: currentStatus?.bg || 'transparent'
      }}
    >
      <div className="attendance-card-header">
        <ChildAvatar 
          photo={child.photo} 
          name={`${child.firstName} ${child.lastName}`}
          size="medium"
        />
        <div className="attendance-card-info">
          <span className="attendance-card-name">
            {child.firstName} {child.lastName}
          </span>
          <span className="attendance-card-group">{child.groupName}</span>
          {/* Late arrival indicator */}
          {status === 'late' && lateInfo && (
            <span className="attendance-late-time">
              🕐 {formatLateTime(lateInfo.arrivalTime)}
              {lateInfo.reason && ` - ${lateInfo.reason}`}
            </span>
          )}
        </div>
        {currentStatus && (
          <span 
            className="attendance-current-status"
            style={{ color: currentStatus.color }}
          >
            {currentStatus.icon}
          </span>
        )}
      </div>

      <div className="attendance-card-actions">
        {Object.entries(ATTENDANCE_STATUSES).map(([key, config]) => (
          <button
            key={key}
            className={`attendance-status-btn ${status === key ? 'active' : ''}`}
            style={{ 
              '--status-color': config.color,
              '--status-bg': config.bg
            }}
            onClick={() => handleStatusClick(key)}
            disabled={disabled}
            title={config.label}
          >
            <span className="status-icon">{config.icon}</span>
            <span className="status-label">{config.label}</span>
          </button>
        ))}
      </div>

      {showDetails && child.allergies?.length > 0 && (
        <div className="attendance-card-warning">
          ⚠️ Allergiya: {child.allergies.join(', ')}
        </div>
      )}
    </motion.div>
  )
}

// Bulk Actions Bar
function BulkActionsBar({ onBulkAction, selectedGroup, groups }) {
  return (
    <div className="attendance-bulk-actions">
      <select 
        className="bulk-group-select"
        value={selectedGroup}
        onChange={(e) => onBulkAction('filterGroup', e.target.value)}
      >
        <option value="">Barcha guruhlar</option>
        {groups.map(group => (
          <option key={group.id} value={group.id}>{group.name}</option>
        ))}
      </select>

      <div className="bulk-action-buttons">
        <button 
          className="bulk-btn bulk-btn--present"
          onClick={() => onBulkAction('markAllPresent')}
        >
          ✓ Barchasi keldi
        </button>
        <button 
          className="bulk-btn bulk-btn--absent"
          onClick={() => onBulkAction('markAllAbsent')}
        >
          ✕ Barchasi kelmadi
        </button>
        <button 
          className="bulk-btn bulk-btn--clear"
          onClick={() => onBulkAction('clearAll')}
        >
          🔄 Tozalash
        </button>
      </div>
    </div>
  )
}

// Main Attendance Grid Component
function AttendanceGrid({
  children = [],
  attendance = {},
  lateArrivals = {},
  date = new Date(),
  groups = [],
  onStatusChange,
  onLateArrival,
  onBulkAction,
  onSave,
  loading = false,
  saving = false,
  showStats = true,
  showBulkActions = true
}) {
  const [selectedGroup, setSelectedGroup] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [lateModalOpen, setLateModalOpen] = useState(false)
  const [selectedChild, setSelectedChild] = useState(null)

  // Filter children
  const filteredChildren = useMemo(() => {
    return children.filter(child => {
      const matchesGroup = !selectedGroup || child.groupId === selectedGroup
      const matchesSearch = !searchQuery || 
        `${child.firstName} ${child.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesGroup && matchesSearch
    })
  }, [children, selectedGroup, searchQuery])

  // Calculate statistics
  const stats = useMemo(() => {
    const result = { present: 0, absent: 0, late: 0, excused: 0, total: filteredChildren.length }
    filteredChildren.forEach(child => {
      const status = attendance[child.id]
      if (status && result[status] !== undefined) {
        result[status]++
      }
    })
    return result
  }, [filteredChildren, attendance])

  // Handle late click
  const handleLateClick = useCallback((child) => {
    setSelectedChild(child)
    setLateModalOpen(true)
  }, [])

  // Handle late confirm
  const handleLateConfirm = useCallback((lateData) => {
    onStatusChange(lateData.childId, 'late')
    onLateArrival?.(lateData)
    setLateModalOpen(false)
    setSelectedChild(null)
  }, [onStatusChange, onLateArrival])

  // Handle bulk actions
  const handleBulkAction = useCallback((action, value) => {
    switch (action) {
      case 'filterGroup':
        setSelectedGroup(value)
        break
      case 'markAllPresent':
        filteredChildren.forEach(child => {
          onStatusChange(child.id, 'present')
        })
        break
      case 'markAllAbsent':
        filteredChildren.forEach(child => {
          onStatusChange(child.id, 'absent')
        })
        break
      case 'clearAll':
        filteredChildren.forEach(child => {
          onStatusChange(child.id, null)
        })
        break
      default:
        onBulkAction?.(action, value)
    }
  }, [filteredChildren, onStatusChange, onBulkAction])

  // Format date
  const formattedDate = new Date(date).toLocaleDateString('uz-UZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="attendance-grid-container">
      {/* Header */}
      <div className="attendance-header">
        <div className="attendance-header-left">
          <h2 className="attendance-title">Davomat</h2>
          <span className="attendance-date">{formattedDate}</span>
        </div>
        <div className="attendance-header-right">
          <input
            type="text"
            className="attendance-search"
            placeholder="Qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {onSave && (
            <button 
              className="attendance-save-btn"
              onClick={onSave}
              disabled={saving}
            >
              {saving ? 'Saqlanmoqda...' : '💾 Saqlash'}
            </button>
          )}
        </div>
      </div>

      {/* Statistics */}
      {showStats && <AttendanceStats stats={stats} />}

      {/* Bulk Actions */}
      {showBulkActions && (
        <BulkActionsBar
          onBulkAction={handleBulkAction}
          selectedGroup={selectedGroup}
          groups={groups}
        />
      )}

      {/* Grid */}
      <div className="attendance-grid">
        {loading ? (
          // Skeleton
          [...Array(8)].map((_, i) => (
            <div key={i} className="attendance-card attendance-card--skeleton">
              <div className="skeleton-avatar" />
              <div className="skeleton-info">
                <div className="skeleton-name" />
                <div className="skeleton-group" />
              </div>
            </div>
          ))
        ) : filteredChildren.length === 0 ? (
          <div className="attendance-empty">
            <span className="attendance-empty-icon">👶</span>
            <p>Bolalar topilmadi</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredChildren.map((child, index) => (
              <AttendanceCard
                key={child.id}
                child={child}
                status={attendance[child.id]}
                lateInfo={lateArrivals[child.id]}
                onStatusChange={onStatusChange}
                onLateClick={handleLateClick}
                disabled={saving}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Late Arrival Modal - imported dynamically */}
      {lateModalOpen && (
        <LateArrivalModalWrapper
          isOpen={lateModalOpen}
          onClose={() => {
            setLateModalOpen(false)
            setSelectedChild(null)
          }}
          onConfirm={handleLateConfirm}
          child={selectedChild}
        />
      )}
    </div>
  )
}

// Lazy load LateArrivalModal
function LateArrivalModalWrapper(props) {
  const [LateModal, setLateModal] = useState(null)
  
  useEffect(() => {
    import('./LateArrivalModal').then(module => {
      setLateModal(() => module.default)
    })
  }, [])
  
  if (!LateModal) return null
  return <LateModal {...props} />
}

export default AttendanceGrid
export { AttendanceCard, AttendanceStats, BulkActionsBar, ATTENDANCE_STATUSES }
