/**
 * AttendancePatterns - Davomat pattern aniqlash va ogohlantirishlar
 */
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './AttendancePatterns.css'

// Pattern turlari
const PATTERN_TYPES = {
  FREQUENT_ABSENCE: 'frequent_absence',
  LATE_PATTERN: 'late_pattern',
  MONDAY_ABSENCE: 'monday_absence',
  FRIDAY_ABSENCE: 'friday_absence',
  IMPROVING: 'improving',
  DECLINING: 'declining'
}

const PATTERN_CONFIG = {
  [PATTERN_TYPES.FREQUENT_ABSENCE]: {
    icon: '⚠️',
    color: '#ef4444',
    bgColor: '#fef2f2',
    title: "Ko'p qatnashmaslik",
    description: 'Oxirgi 30 kunda 3+ marta qatnashmagan'
  },
  [PATTERN_TYPES.LATE_PATTERN]: {
    icon: '⏰',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    title: 'Kechikish odati',
    description: "Muntazam ravishda kech kelmoqda"
  },
  [PATTERN_TYPES.MONDAY_ABSENCE]: {
    icon: '📅',
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
    title: 'Dushanba qatnashmaslik',
    description: "Dushanba kunlari ko'p qatnashmaydi"
  },
  [PATTERN_TYPES.FRIDAY_ABSENCE]: {
    icon: '📅',
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
    title: 'Juma qatnashmaslik',
    description: "Juma kunlari ko'p qatnashmaydi"
  },
  [PATTERN_TYPES.IMPROVING]: {
    icon: '📈',
    color: '#22c55e',
    bgColor: '#f0fdf4',
    title: 'Yaxshilanmoqda',
    description: 'Davomat ko\'rsatkichlari yaxshilanmoqda'
  },
  [PATTERN_TYPES.DECLINING]: {
    icon: '📉',
    color: '#ef4444',
    bgColor: '#fef2f2',
    title: 'Yomonlashmoqda',
    description: "Davomat ko'rsatkichlari pasaymoqda"
  }
}

// Pattern aniqlash funksiyasi
function detectPatterns(attendanceData, childId) {
  const patterns = []
  const childData = attendanceData.filter(a => a.childId === childId)
  
  if (childData.length < 7) return patterns
  
  // Oxirgi 30 kun
  const last30Days = childData.slice(-30)
  const absences = last30Days.filter(a => a.status === 'absent')
  const lates = last30Days.filter(a => a.status === 'late')
  
  // Ko'p qatnashmaslik (3+ marta)
  if (absences.length >= 3) {
    patterns.push({
      type: PATTERN_TYPES.FREQUENT_ABSENCE,
      severity: absences.length >= 5 ? 'high' : 'medium',
      count: absences.length,
      dates: absences.map(a => a.date)
    })
  }
  
  // Kechikish odati (3+ marta)
  if (lates.length >= 3) {
    patterns.push({
      type: PATTERN_TYPES.LATE_PATTERN,
      severity: lates.length >= 5 ? 'high' : 'medium',
      count: lates.length,
      dates: lates.map(a => a.date)
    })
  }
  
  // Dushanba qatnashmaslik
  const mondayAbsences = absences.filter(a => new Date(a.date).getDay() === 1)
  if (mondayAbsences.length >= 2) {
    patterns.push({
      type: PATTERN_TYPES.MONDAY_ABSENCE,
      severity: 'low',
      count: mondayAbsences.length
    })
  }
  
  // Juma qatnashmaslik
  const fridayAbsences = absences.filter(a => new Date(a.date).getDay() === 5)
  if (fridayAbsences.length >= 2) {
    patterns.push({
      type: PATTERN_TYPES.FRIDAY_ABSENCE,
      severity: 'low',
      count: fridayAbsences.length
    })
  }
  
  // Trend aniqlash
  const firstHalf = last30Days.slice(0, 15)
  const secondHalf = last30Days.slice(15)
  
  const firstHalfRate = firstHalf.filter(a => a.status === 'present').length / firstHalf.length
  const secondHalfRate = secondHalf.filter(a => a.status === 'present').length / secondHalf.length
  
  if (secondHalfRate > firstHalfRate + 0.15) {
    patterns.push({
      type: PATTERN_TYPES.IMPROVING,
      severity: 'positive',
      improvement: Math.round((secondHalfRate - firstHalfRate) * 100)
    })
  } else if (secondHalfRate < firstHalfRate - 0.15) {
    patterns.push({
      type: PATTERN_TYPES.DECLINING,
      severity: 'high',
      decline: Math.round((firstHalfRate - secondHalfRate) * 100)
    })
  }
  
  return patterns
}

// Pattern Card komponenti
function PatternCard({ pattern, child, onAction }) {
  const config = PATTERN_CONFIG[pattern.type]
  
  return (
    <motion.div
      className={`pattern-card severity-${pattern.severity}`}
      style={{ 
        '--pattern-color': config.color,
        '--pattern-bg': config.bgColor 
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="pattern-icon">{config.icon}</div>
      
      <div className="pattern-content">
        <div className="pattern-header">
          <h4 className="pattern-title">{config.title}</h4>
          {pattern.severity !== 'positive' && (
            <span className={`severity-badge ${pattern.severity}`}>
              {pattern.severity === 'high' ? 'Yuqori' : pattern.severity === 'medium' ? "O'rta" : 'Past'}
            </span>
          )}
        </div>
        
        <p className="pattern-child">{child?.name}</p>
        <p className="pattern-description">{config.description}</p>
        
        {pattern.count && (
          <p className="pattern-stat">
            <strong>{pattern.count}</strong> marta
          </p>
        )}
        
        {pattern.improvement && (
          <p className="pattern-stat positive">
            +{pattern.improvement}% yaxshilangan
          </p>
        )}
        
        {pattern.decline && (
          <p className="pattern-stat negative">
            -{pattern.decline}% pasaygan
          </p>
        )}
      </div>
      
      <div className="pattern-actions">
        {pattern.severity !== 'positive' && (
          <>
            <button 
              className="pattern-action-btn"
              onClick={() => onAction?.('notify', child, pattern)}
              title="Ota-onaga xabar yuborish"
            >
              📱
            </button>
            <button 
              className="pattern-action-btn"
              onClick={() => onAction?.('view', child, pattern)}
              title="Batafsil ko'rish"
            >
              👁️
            </button>
          </>
        )}
        <button 
          className="pattern-action-btn dismiss"
          onClick={() => onAction?.('dismiss', child, pattern)}
          title="Yopish"
        >
          ✕
        </button>
      </div>
    </motion.div>
  )
}

// Asosiy komponent
function AttendancePatterns({ 
  attendanceData = [], 
  children = [],
  onNotifyParent,
  onViewChild,
  onDismissPattern
}) {
  const [filter, setFilter] = useState('all')
  const [dismissedPatterns, setDismissedPatterns] = useState([])
  
  // Barcha bolalar uchun patternlarni aniqlash
  const allPatterns = useMemo(() => {
    const patterns = []
    
    children.forEach(child => {
      const childPatterns = detectPatterns(attendanceData, child.id)
      childPatterns.forEach(pattern => {
        patterns.push({
          ...pattern,
          childId: child.id,
          child
        })
      })
    })
    
    // Severity bo'yicha saralash
    return patterns.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2, positive: 3 }
      return severityOrder[a.severity] - severityOrder[b.severity]
    })
  }, [attendanceData, children])
  
  // Filtrlangan patternlar
  const filteredPatterns = useMemo(() => {
    let filtered = allPatterns.filter(p => 
      !dismissedPatterns.includes(`${p.childId}-${p.type}`)
    )
    
    if (filter === 'warnings') {
      filtered = filtered.filter(p => p.severity !== 'positive')
    } else if (filter === 'positive') {
      filtered = filtered.filter(p => p.severity === 'positive')
    } else if (filter === 'high') {
      filtered = filtered.filter(p => p.severity === 'high')
    }
    
    return filtered
  }, [allPatterns, filter, dismissedPatterns])
  
  const handleAction = (action, child, pattern) => {
    switch (action) {
      case 'notify':
        onNotifyParent?.(child, pattern)
        break
      case 'view':
        onViewChild?.(child)
        break
      case 'dismiss':
        setDismissedPatterns(prev => [...prev, `${child.id}-${pattern.type}`])
        onDismissPattern?.(child, pattern)
        break
    }
  }
  
  // Statistika
  const stats = useMemo(() => ({
    total: allPatterns.length,
    high: allPatterns.filter(p => p.severity === 'high').length,
    medium: allPatterns.filter(p => p.severity === 'medium').length,
    positive: allPatterns.filter(p => p.severity === 'positive').length
  }), [allPatterns])
  
  return (
    <div className="attendance-patterns">
      {/* Header */}
      <div className="patterns-header">
        <div className="patterns-title-section">
          <h3 className="patterns-title">🔍 Pattern Tahlili</h3>
          <p className="patterns-subtitle">
            Davomat patternlari va ogohlantirishlar
          </p>
        </div>
        
        <div className="patterns-stats">
          <div className="stat-item high">
            <span className="stat-value">{stats.high}</span>
            <span className="stat-label">Yuqori</span>
          </div>
          <div className="stat-item medium">
            <span className="stat-value">{stats.medium}</span>
            <span className="stat-label">O'rta</span>
          </div>
          <div className="stat-item positive">
            <span className="stat-value">{stats.positive}</span>
            <span className="stat-label">Ijobiy</span>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="patterns-filters">
        {[
          { value: 'all', label: 'Barchasi', count: allPatterns.length },
          { value: 'warnings', label: 'Ogohlantirishlar', count: stats.high + stats.medium },
          { value: 'high', label: 'Yuqori xavf', count: stats.high },
          { value: 'positive', label: 'Ijobiy', count: stats.positive }
        ].map(f => (
          <button
            key={f.value}
            className={`filter-btn ${filter === f.value ? 'active' : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
            <span className="filter-count">{f.count}</span>
          </button>
        ))}
      </div>
      
      {/* Pattern List */}
      <div className="patterns-list">
        <AnimatePresence mode="popLayout">
          {filteredPatterns.length > 0 ? (
            filteredPatterns.map((pattern, idx) => (
              <PatternCard
                key={`${pattern.childId}-${pattern.type}-${idx}`}
                pattern={pattern}
                child={pattern.child}
                onAction={handleAction}
              />
            ))
          ) : (
            <motion.div 
              className="no-patterns"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="no-patterns-icon">✨</span>
              <p>Hozircha pattern topilmadi</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AttendancePatterns
export { detectPatterns, PATTERN_TYPES, PATTERN_CONFIG }
