import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './CapacityManager.css'

// Capacity status configurations
const CAPACITY_STATUS = {
  available: { label: 'Bo\'sh joy bor', color: '#22c55e', icon: '✓' },
  nearFull: { label: 'Deyarli to\'la', color: '#f59e0b', icon: '⚠️' },
  full: { label: 'To\'la', color: '#ef4444', icon: '🚫' },
  overCapacity: { label: 'Sig\'imdan oshgan', color: '#dc2626', icon: '❌' }
}

// Get capacity status
function getCapacityStatus(current, max) {
  const percent = (current / max) * 100
  if (current > max) return 'overCapacity'
  if (percent >= 100) return 'full'
  if (percent >= 85) return 'nearFull'
  return 'available'
}

// Capacity Bar Component
function CapacityBar({ current, max, showLabel = true }) {
  const percent = Math.min((current / max) * 100, 100)
  const status = getCapacityStatus(current, max)
  const config = CAPACITY_STATUS[status]

  return (
    <div className="capacity-bar-container">
      <div className="capacity-bar">
        <motion.div 
          className="capacity-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          style={{ backgroundColor: config.color }}
        />
      </div>
      {showLabel && (
        <div className="capacity-bar-label">
          <span className="capacity-count">{current}/{max}</span>
          <span 
            className="capacity-status"
            style={{ color: config.color }}
          >
            {config.icon} {config.label}
          </span>
        </div>
      )}
    </div>
  )
}

// Group Capacity Card
function GroupCapacityCard({ 
  group, 
  onAddChild, 
  onViewDetails,
  suggestedAlternatives = []
}) {
  const status = getCapacityStatus(group.currentCount, group.capacity)
  const config = CAPACITY_STATUS[status]
  const availableSpots = Math.max(0, group.capacity - group.currentCount)

  return (
    <motion.div 
      className={`group-capacity-card capacity-${status}`}
      layout
      whileHover={{ y: -2 }}
    >
      <div className="capacity-card-header">
        <div className="group-info">
          <h3>{group.name}</h3>
          <span className="group-age-range">
            {group.minAge}-{group.maxAge} yosh
          </span>
        </div>
        <div 
          className="capacity-badge"
          style={{ 
            backgroundColor: config.color + '20',
            color: config.color
          }}
        >
          {config.icon} {availableSpots} bo'sh
        </div>
      </div>

      <CapacityBar current={group.currentCount} max={group.capacity} />

      <div className="capacity-card-details">
        <div className="detail-item">
          <span className="detail-icon">👶</span>
          <span className="detail-label">Bolalar</span>
          <span className="detail-value">{group.currentCount}</span>
        </div>
        <div className="detail-item">
          <span className="detail-icon">👨‍🏫</span>
          <span className="detail-label">O'qituvchi</span>
          <span className="detail-value">{group.teacherName || 'Tayinlanmagan'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-icon">📊</span>
          <span className="detail-label">Sig'im</span>
          <span className="detail-value">{group.capacity} ta</span>
        </div>
      </div>

      {/* Warning for near full or full */}
      {(status === 'nearFull' || status === 'full') && suggestedAlternatives.length > 0 && (
        <div className="capacity-warning">
          <span className="warning-icon">💡</span>
          <div className="warning-content">
            <span className="warning-title">Alternativ guruhlar:</span>
            <div className="alternative-groups">
              {suggestedAlternatives.map(alt => (
                <span key={alt.id} className="alt-group">
                  {alt.name} ({alt.capacity - alt.currentCount} bo'sh)
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="capacity-card-actions">
        <button 
          className="capacity-action-btn view"
          onClick={() => onViewDetails?.(group)}
        >
          👁️ Ko'rish
        </button>
        <button 
          className={`capacity-action-btn add ${status === 'full' || status === 'overCapacity' ? 'disabled' : ''}`}
          onClick={() => onAddChild?.(group)}
          disabled={status === 'full' || status === 'overCapacity'}
        >
          {status === 'full' || status === 'overCapacity' ? '🚫 To\'la' : '+ Bola qo\'shish'}
        </button>
      </div>
    </motion.div>
  )
}

// Add Child Modal with Capacity Check
function AddChildModal({ 
  group, 
  children = [], 
  alternatives = [],
  onAdd, 
  onClose 
}) {
  const [selectedChild, setSelectedChild] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAlternatives, setShowAlternatives] = useState(false)

  const status = getCapacityStatus(group.currentCount, group.capacity)
  const isFull = status === 'full' || status === 'overCapacity'

  const filteredChildren = useMemo(() => {
    if (!searchQuery) return children
    const query = searchQuery.toLowerCase()
    return children.filter(child =>
      child.firstName?.toLowerCase().includes(query) ||
      child.lastName?.toLowerCase().includes(query)
    )
  }, [children, searchQuery])

  const handleAdd = () => {
    if (!selectedChild) return
    onAdd(selectedChild, group)
    onClose()
  }

  return (
    <motion.div
      className="add-child-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="add-child-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Bola qo'shish</h3>
          <span className="modal-group-name">{group.name}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Capacity Warning */}
        {isFull && (
          <div className="modal-capacity-warning">
            <span className="warning-icon">⚠️</span>
            <div className="warning-text">
              <strong>Guruh to'la!</strong>
              <p>Bu guruhga bola qo'shib bo'lmaydi. Quyidagi alternativ guruhlardan birini tanlang.</p>
            </div>
          </div>
        )}

        {/* Current Capacity */}
        <div className="modal-capacity-info">
          <CapacityBar current={group.currentCount} max={group.capacity} />
        </div>

        {!isFull ? (
          <>
            {/* Search */}
            <div className="modal-search">
              <input
                type="text"
                placeholder="Bolani qidirish..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Children List */}
            <div className="modal-children-list">
              {filteredChildren.map(child => (
                <div
                  key={child.id}
                  className={`child-option ${selectedChild?.id === child.id ? 'selected' : ''}`}
                  onClick={() => setSelectedChild(child)}
                >
                  <div className="child-avatar">
                    {child.photo ? (
                      <img src={child.photo} alt={child.firstName} />
                    ) : (
                      <span>{child.firstName?.[0]}{child.lastName?.[0]}</span>
                    )}
                  </div>
                  <div className="child-details">
                    <span className="child-name">{child.firstName} {child.lastName}</span>
                    <span className="child-age">{child.age} yosh</span>
                  </div>
                  {selectedChild?.id === child.id && (
                    <span className="selected-check">✓</span>
                  )}
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={onClose}>
                Bekor qilish
              </button>
              <button 
                className="modal-btn confirm"
                onClick={handleAdd}
                disabled={!selectedChild}
              >
                Qo'shish
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Alternative Groups */}
            <div className="alternatives-section">
              <h4>Alternativ guruhlar</h4>
              <div className="alternatives-list">
                {alternatives.map(alt => (
                  <div 
                    key={alt.id}
                    className="alternative-card"
                    onClick={() => {
                      onClose()
                      // Navigate to alternative group
                    }}
                  >
                    <div className="alt-info">
                      <span className="alt-name">{alt.name}</span>
                      <span className="alt-age">{alt.minAge}-{alt.maxAge} yosh</span>
                    </div>
                    <div className="alt-capacity">
                      <span className="alt-available">
                        {alt.capacity - alt.currentCount} bo'sh
                      </span>
                      <CapacityBar 
                        current={alt.currentCount} 
                        max={alt.capacity} 
                        showLabel={false}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={onClose}>
                Yopish
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

// Main Capacity Manager Component
function CapacityManager({
  groups = [],
  unassignedChildren = [],
  onAddChild,
  onViewGroup,
  onUpdateCapacity
}) {
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')

  // Calculate overall stats
  const stats = useMemo(() => {
    let totalCapacity = 0
    let totalChildren = 0
    let fullGroups = 0
    let nearFullGroups = 0

    groups.forEach(group => {
      totalCapacity += group.capacity
      totalChildren += group.currentCount
      const status = getCapacityStatus(group.currentCount, group.capacity)
      if (status === 'full' || status === 'overCapacity') fullGroups++
      if (status === 'nearFull') nearFullGroups++
    })

    return {
      totalCapacity,
      totalChildren,
      availableSpots: totalCapacity - totalChildren,
      fullGroups,
      nearFullGroups,
      utilizationPercent: totalCapacity > 0 ? (totalChildren / totalCapacity) * 100 : 0
    }
  }, [groups])

  // Filter groups
  const filteredGroups = useMemo(() => {
    if (filterStatus === 'all') return groups
    return groups.filter(group => {
      const status = getCapacityStatus(group.currentCount, group.capacity)
      return status === filterStatus
    })
  }, [groups, filterStatus])

  // Get alternatives for a group
  const getAlternatives = useCallback((group) => {
    return groups.filter(g => 
      g.id !== group.id && 
      getCapacityStatus(g.currentCount, g.capacity) === 'available' &&
      g.minAge <= group.maxAge && g.maxAge >= group.minAge
    ).slice(0, 3)
  }, [groups])

  const handleAddChild = (group) => {
    setSelectedGroup(group)
    setShowAddModal(true)
  }

  const handleConfirmAdd = (child, group) => {
    onAddChild?.(child, group)
  }

  return (
    <div className="capacity-manager">
      {/* Header */}
      <div className="capacity-manager-header">
        <div className="header-title">
          <h2>📊 Sig'im boshqaruvi</h2>
          <p>Guruhlar sig'imini kuzatish va boshqarish</p>
        </div>
      </div>

      {/* Stats */}
      <div className="capacity-stats">
        <div className="stat-card">
          <span className="stat-icon">👶</span>
          <div className="stat-content">
            <span className="stat-value">{stats.totalChildren}</span>
            <span className="stat-label">Jami bolalar</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🏫</span>
          <div className="stat-content">
            <span className="stat-value">{stats.totalCapacity}</span>
            <span className="stat-label">Jami sig'im</span>
          </div>
        </div>
        <div className="stat-card highlight">
          <span className="stat-icon">✅</span>
          <div className="stat-content">
            <span className="stat-value">{stats.availableSpots}</span>
            <span className="stat-label">Bo'sh joylar</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📈</span>
          <div className="stat-content">
            <span className="stat-value">{Math.round(stats.utilizationPercent)}%</span>
            <span className="stat-label">Foydalanish</span>
          </div>
        </div>
      </div>

      {/* Overall Capacity Bar */}
      <div className="overall-capacity">
        <h3>Umumiy sig'im</h3>
        <CapacityBar current={stats.totalChildren} max={stats.totalCapacity} />
      </div>

      {/* Filter */}
      <div className="capacity-filter">
        <span className="filter-label">Filtr:</span>
        <div className="filter-buttons">
          {[
            { value: 'all', label: 'Hammasi' },
            { value: 'available', label: 'Bo\'sh' },
            { value: 'nearFull', label: 'Deyarli to\'la' },
            { value: 'full', label: 'To\'la' }
          ].map(option => (
            <button
              key={option.value}
              className={`filter-btn ${filterStatus === option.value ? 'active' : ''}`}
              onClick={() => setFilterStatus(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Groups Grid */}
      <div className="capacity-groups-grid">
        {filteredGroups.map(group => (
          <GroupCapacityCard
            key={group.id}
            group={group}
            onAddChild={handleAddChild}
            onViewDetails={onViewGroup}
            suggestedAlternatives={getAlternatives(group)}
          />
        ))}
      </div>

      {/* Add Child Modal */}
      <AnimatePresence>
        {showAddModal && selectedGroup && (
          <AddChildModal
            group={selectedGroup}
            children={unassignedChildren}
            alternatives={getAlternatives(selectedGroup)}
            onAdd={handleConfirmAdd}
            onClose={() => {
              setShowAddModal(false)
              setSelectedGroup(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default CapacityManager
export { 
  CapacityBar, 
  GroupCapacityCard, 
  AddChildModal, 
  CAPACITY_STATUS, 
  getCapacityStatus 
}
