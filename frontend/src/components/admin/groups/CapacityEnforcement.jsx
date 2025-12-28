import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './CapacityEnforcement.css'

/**
 * Capacity Enforcement Component
 * Prevents adding children to full groups and suggests alternatives
 * Requirements: 5.4
 */

// Hook for capacity validation
export function useCapacityValidation(groups = []) {
  const [validationResult, setValidationResult] = useState(null)

  const validateCapacity = (groupId, additionalCount = 1) => {
    const group = groups.find(g => g.id === groupId)
    if (!group) {
      return { valid: false, error: 'Guruh topilmadi' }
    }

    const currentCount = group.currentCount || 0
    const capacity = group.capacity || 0
    const newCount = currentCount + additionalCount
    const percentage = capacity > 0 ? Math.round((currentCount / capacity) * 100) : 0

    // Check if group is full
    if (newCount > capacity) {
      const alternatives = findAlternativeGroups(groups, group, additionalCount)
      return {
        valid: false,
        error: `"${group.name}" guruhi to'liq (${currentCount}/${capacity})`,
        isFull: true,
        group,
        alternatives,
        suggestion: alternatives.length > 0 
          ? `${alternatives[0].name} guruhida joy bor`
          : null
      }
    }

    // Warning if near capacity (90%+)
    if (percentage >= 90) {
      return {
        valid: true,
        warning: `"${group.name}" guruhi deyarli to'liq (${percentage}%)`,
        isNearCapacity: true,
        group,
        remainingSlots: capacity - currentCount
      }
    }

    // Warning if getting full (70%+)
    if (percentage >= 70) {
      return {
        valid: true,
        info: `"${group.name}" guruhida ${capacity - currentCount} ta joy qoldi`,
        group,
        remainingSlots: capacity - currentCount
      }
    }

    return {
      valid: true,
      group,
      remainingSlots: capacity - currentCount
    }
  }

  const findAlternativeGroups = (allGroups, currentGroup, neededSlots = 1) => {
    return allGroups
      .filter(g => {
        // Same age range
        const sameAgeRange = 
          g.ageRange?.min === currentGroup.ageRange?.min &&
          g.ageRange?.max === currentGroup.ageRange?.max
        // Has capacity
        const hasCapacity = (g.capacity - (g.currentCount || 0)) >= neededSlots
        // Not the same group
        const notSame = g.id !== currentGroup.id
        
        return sameAgeRange && hasCapacity && notSame
      })
      .sort((a, b) => {
        // Sort by available capacity (most available first)
        const aAvailable = a.capacity - (a.currentCount || 0)
        const bAvailable = b.capacity - (b.currentCount || 0)
        return bAvailable - aAvailable
      })
      .slice(0, 3) // Return top 3 alternatives
  }

  return { validateCapacity, findAlternativeGroups }
}

// Capacity Warning Modal
export function CapacityWarningModal({ 
  isOpen, 
  onClose, 
  validationResult,
  onSelectAlternative,
  onForceAdd 
}) {
  if (!isOpen || !validationResult) return null

  const { error, warning, alternatives = [], group, isFull } = validationResult

  return (
    <AnimatePresence>
      <motion.div
        className="capacity-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="capacity-modal"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="capacity-modal-header">
            <span className="capacity-modal-icon">
              {isFull ? '🚫' : '⚠️'}
            </span>
            <h3>{isFull ? 'Guruh to\'liq' : 'Diqqat'}</h3>
          </div>

          <div className="capacity-modal-body">
            <p className="capacity-message">
              {error || warning}
            </p>

            {group && (
              <div className="capacity-group-info">
                <div className="capacity-bar-large">
                  <div 
                    className="capacity-bar-fill"
                    style={{ 
                      width: `${Math.min(100, (group.currentCount / group.capacity) * 100)}%`,
                      backgroundColor: isFull ? '#ef4444' : '#f59e0b'
                    }}
                  />
                </div>
                <span className="capacity-numbers">
                  {group.currentCount} / {group.capacity} bola
                </span>
              </div>
            )}

            {alternatives.length > 0 && (
              <div className="capacity-alternatives">
                <h4>Muqobil guruhlar:</h4>
                <div className="alternatives-list">
                  {alternatives.map(alt => (
                    <button
                      key={alt.id}
                      className="alternative-btn"
                      onClick={() => onSelectAlternative?.(alt)}
                    >
                      <span className="alt-name">{alt.name}</span>
                      <span className="alt-capacity">
                        {alt.capacity - (alt.currentCount || 0)} ta joy
                      </span>
                      <span className="alt-arrow">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="capacity-modal-footer">
            <button className="btn-secondary" onClick={onClose}>
              Bekor qilish
            </button>
            {!isFull && onForceAdd && (
              <button className="btn-warning" onClick={onForceAdd}>
                Baribir qo'shish
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Capacity Badge Component
export function CapacityBadge({ current, max, size = 'medium' }) {
  const percentage = max > 0 ? Math.round((current / max) * 100) : 0
  
  let status, color, icon
  if (percentage >= 100) {
    status = 'To\'liq'
    color = '#ef4444'
    icon = '🚫'
  } else if (percentage >= 90) {
    status = 'Deyarli to\'liq'
    color = '#f59e0b'
    icon = '⚠️'
  } else if (percentage >= 70) {
    status = 'Ko\'p'
    color = '#eab308'
    icon = '📊'
  } else {
    status = 'Bo\'sh joy bor'
    color = '#22c55e'
    icon = '✓'
  }

  return (
    <div className={`capacity-badge capacity-badge--${size}`} style={{ borderColor: color }}>
      <span className="capacity-badge-icon">{icon}</span>
      <span className="capacity-badge-text" style={{ color }}>
        {status}
      </span>
      <span className="capacity-badge-count">
        {current}/{max}
      </span>
    </div>
  )
}

// Capacity Alert Banner
export function CapacityAlertBanner({ groups = [] }) {
  const fullGroups = groups.filter(g => (g.currentCount || 0) >= g.capacity)
  const nearFullGroups = groups.filter(g => {
    const percentage = g.capacity > 0 ? ((g.currentCount || 0) / g.capacity) * 100 : 0
    return percentage >= 90 && percentage < 100
  })

  if (fullGroups.length === 0 && nearFullGroups.length === 0) {
    return null
  }

  return (
    <div className="capacity-alert-banner">
      {fullGroups.length > 0 && (
        <div className="alert-item alert-item--error">
          <span className="alert-icon">🚫</span>
          <span className="alert-text">
            {fullGroups.length} ta guruh to'liq: {fullGroups.map(g => g.name).join(', ')}
          </span>
        </div>
      )}
      {nearFullGroups.length > 0 && (
        <div className="alert-item alert-item--warning">
          <span className="alert-icon">⚠️</span>
          <span className="alert-text">
            {nearFullGroups.length} ta guruh deyarli to'liq: {nearFullGroups.map(g => g.name).join(', ')}
          </span>
        </div>
      )}
    </div>
  )
}

// Group Selector with Capacity Info
export function GroupSelectorWithCapacity({ 
  groups = [], 
  selectedId, 
  onChange,
  disabled = false,
  showWarnings = true 
}) {
  const { validateCapacity } = useCapacityValidation(groups)
  const [showModal, setShowModal] = useState(false)
  const [pendingGroup, setPendingGroup] = useState(null)
  const [validationResult, setValidationResult] = useState(null)

  const handleSelect = (groupId) => {
    if (disabled) return

    const result = validateCapacity(groupId)
    
    if (!result.valid) {
      setValidationResult(result)
      setPendingGroup(groupId)
      setShowModal(true)
      return
    }

    if (result.warning && showWarnings) {
      setValidationResult(result)
      setPendingGroup(groupId)
      setShowModal(true)
      return
    }

    onChange?.(groupId)
  }

  const handleSelectAlternative = (group) => {
    setShowModal(false)
    onChange?.(group.id)
  }

  const handleForceAdd = () => {
    setShowModal(false)
    if (pendingGroup) {
      onChange?.(pendingGroup)
    }
  }

  return (
    <>
      <div className="group-selector-capacity">
        {groups.map(group => {
          const percentage = group.capacity > 0 
            ? Math.round(((group.currentCount || 0) / group.capacity) * 100) 
            : 0
          const isFull = percentage >= 100
          const isNearFull = percentage >= 90

          return (
            <button
              key={group.id}
              className={`group-option ${selectedId === group.id ? 'selected' : ''} ${isFull ? 'full' : ''} ${isNearFull ? 'near-full' : ''}`}
              onClick={() => handleSelect(group.id)}
              disabled={disabled}
            >
              <div className="group-option-header">
                <span className="group-option-name">{group.name}</span>
                {isFull && <span className="full-badge">To'liq</span>}
              </div>
              <div className="group-option-capacity">
                <div className="mini-capacity-bar">
                  <div 
                    className="mini-capacity-fill"
                    style={{ 
                      width: `${Math.min(100, percentage)}%`,
                      backgroundColor: isFull ? '#ef4444' : isNearFull ? '#f59e0b' : '#22c55e'
                    }}
                  />
                </div>
                <span className="capacity-text">
                  {group.currentCount || 0}/{group.capacity}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      <CapacityWarningModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        validationResult={validationResult}
        onSelectAlternative={handleSelectAlternative}
        onForceAdd={validationResult?.valid ? handleForceAdd : null}
      />
    </>
  )
}

export default CapacityWarningModal
