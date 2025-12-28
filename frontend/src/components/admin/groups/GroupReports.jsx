import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import './GroupReports.css'

/**
 * Group Reports Component
 * Attendance summary, progress overview, export functionality
 * Requirements: 5.9
 */

// Date range presets
const DATE_PRESETS = {
  today: { label: 'Bugun', days: 0 },
  week: { label: 'Hafta', days: 7 },
  month: { label: 'Oy', days: 30 },
  quarter: { label: 'Chorak', days: 90 },
  year: { label: 'Yil', days: 365 }
}

// Report types
const REPORT_TYPES = [
  { id: 'attendance', label: 'Davomat', icon: '📊' },
  { id: 'progress', label: 'Rivojlanish', icon: '📈' },
  { id: 'summary', label: 'Umumiy', icon: '📋' }
]

// Calculate attendance stats
function calculateAttendanceStats(attendance = [], children = []) {
  const totalDays = attendance.length > 0 
    ? [...new Set(attendance.map(a => a.date))].length 
    : 0
  
  const presentCount = attendance.filter(a => a.status === 'present').length
  const absentCount = attendance.filter(a => a.status === 'absent').length
  const lateCount = attendance.filter(a => a.status === 'late').length
  
  const totalRecords = presentCount + absentCount + lateCount
  const attendanceRate = totalRecords > 0 
    ? Math.round((presentCount / totalRecords) * 100) 
    : 0

  // Per child stats
  const childStats = children.map(child => {
    const childAttendance = attendance.filter(a => a.childId === child.id)
    const childPresent = childAttendance.filter(a => a.status === 'present').length
    const childTotal = childAttendance.length
    return {
      ...child,
      presentDays: childPresent,
      totalDays: childTotal,
      rate: childTotal > 0 ? Math.round((childPresent / childTotal) * 100) : 0
    }
  }).sort((a, b) => b.rate - a.rate)

  return {
    totalDays,
    presentCount,
    absentCount,
    lateCount,
    attendanceRate,
    childStats
  }
}

// Attendance Report Component
function AttendanceReport({ group, attendance, children, dateRange }) {
  const stats = useMemo(() => 
    calculateAttendanceStats(attendance, children),
    [attendance, children]
  )

  return (
    <div className="report-section">
      <h3 className="report-section-title">
        <span className="icon">📊</span>
        Davomat hisoboti
      </h3>

      {/* Summary Cards */}
      <div className="report-summary-cards">
        <div className="summary-card">
          <span className="summary-value">{stats.attendanceRate}%</span>
          <span className="summary-label">Davomat darajasi</span>
        </div>
        <div className="summary-card success">
          <span className="summary-value">{stats.presentCount}</span>
          <span className="summary-label">Kelgan</span>
        </div>
        <div className="summary-card danger">
          <span className="summary-value">{stats.absentCount}</span>
          <span className="summary-label">Kelmagan</span>
        </div>
        <div className="summary-card warning">
          <span className="summary-value">{stats.lateCount}</span>
          <span className="summary-label">Kech qolgan</span>
        </div>
      </div>

      {/* Attendance Rate Bar */}
      <div className="attendance-rate-visual">
        <div className="rate-bar">
          <div 
            className="rate-fill present" 
            style={{ width: `${stats.presentCount / (stats.presentCount + stats.absentCount + stats.lateCount) * 100 || 0}%` }}
          />
          <div 
            className="rate-fill late" 
            style={{ width: `${stats.lateCount / (stats.presentCount + stats.absentCount + stats.lateCount) * 100 || 0}%` }}
          />
          <div 
            className="rate-fill absent" 
            style={{ width: `${stats.absentCount / (stats.presentCount + stats.absentCount + stats.lateCount) * 100 || 0}%` }}
          />
        </div>
        <div className="rate-legend">
          <span className="legend-item"><span className="dot present"></span> Kelgan</span>
          <span className="legend-item"><span className="dot late"></span> Kech</span>
          <span className="legend-item"><span className="dot absent"></span> Kelmagan</span>
        </div>
      </div>

      {/* Per Child Table */}
      <div className="report-table-container">
        <table className="report-table">
          <thead>
            <tr>
              <th>Bola</th>
              <th>Kelgan kunlar</th>
              <th>Jami kunlar</th>
              <th>Davomat %</th>
            </tr>
          </thead>
          <tbody>
            {stats.childStats.map(child => (
              <tr key={child.id}>
                <td className="child-name">
                  <span className="child-avatar">
                    {child.photo ? (
                      <img src={child.photo} alt={child.firstName} />
                    ) : (
                      child.firstName?.charAt(0)
                    )}
                  </span>
                  {child.firstName} {child.lastName}
                </td>
                <td>{child.presentDays}</td>
                <td>{child.totalDays}</td>
                <td>
                  <span className={`rate-badge ${child.rate >= 90 ? 'good' : child.rate >= 70 ? 'medium' : 'low'}`}>
                    {child.rate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Progress Report Component
function ProgressReport({ group, children }) {
  // Mock progress data - in real app would come from API
  const progressAreas = [
    { id: 'cognitive', name: 'Kognitiv', icon: '🧠' },
    { id: 'social', name: 'Ijtimoiy', icon: '👥' },
    { id: 'physical', name: 'Jismoniy', icon: '🏃' },
    { id: 'creative', name: 'Ijodiy', icon: '🎨' },
    { id: 'language', name: 'Nutq', icon: '💬' }
  ]

  return (
    <div className="report-section">
      <h3 className="report-section-title">
        <span className="icon">📈</span>
        Rivojlanish hisoboti
      </h3>

      {/* Progress Overview */}
      <div className="progress-overview">
        {progressAreas.map(area => {
          // Mock average progress
          const avgProgress = Math.floor(Math.random() * 30) + 60
          return (
            <div key={area.id} className="progress-area-card">
              <div className="progress-area-header">
                <span className="area-icon">{area.icon}</span>
                <span className="area-name">{area.name}</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${avgProgress}%` }}
                  />
                </div>
                <span className="progress-value">{avgProgress}%</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Children Progress Table */}
      <div className="report-table-container">
        <table className="report-table">
          <thead>
            <tr>
              <th>Bola</th>
              {progressAreas.map(area => (
                <th key={area.id}>{area.icon}</th>
              ))}
              <th>O'rtacha</th>
            </tr>
          </thead>
          <tbody>
            {children.map(child => {
              const scores = progressAreas.map(() => Math.floor(Math.random() * 30) + 60)
              const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
              return (
                <tr key={child.id}>
                  <td className="child-name">
                    <span className="child-avatar">
                      {child.firstName?.charAt(0)}
                    </span>
                    {child.firstName}
                  </td>
                  {scores.map((score, i) => (
                    <td key={i}>
                      <span className={`score-badge ${score >= 80 ? 'good' : score >= 60 ? 'medium' : 'low'}`}>
                        {score}
                      </span>
                    </td>
                  ))}
                  <td>
                    <span className={`rate-badge ${avg >= 80 ? 'good' : avg >= 60 ? 'medium' : 'low'}`}>
                      {avg}%
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Summary Report Component
function SummaryReport({ group, children, attendance }) {
  const stats = calculateAttendanceStats(attendance, children)

  return (
    <div className="report-section">
      <h3 className="report-section-title">
        <span className="icon">📋</span>
        Umumiy hisobot
      </h3>

      {/* Group Info */}
      <div className="summary-info-grid">
        <div className="info-card">
          <span className="info-icon">👥</span>
          <div className="info-content">
            <span className="info-value">{children.length}</span>
            <span className="info-label">Jami bolalar</span>
          </div>
        </div>
        <div className="info-card">
          <span className="info-icon">📊</span>
          <div className="info-content">
            <span className="info-value">{stats.attendanceRate}%</span>
            <span className="info-label">Davomat</span>
          </div>
        </div>
        <div className="info-card">
          <span className="info-icon">👨‍🏫</span>
          <div className="info-content">
            <span className="info-value">{group.teachers?.length || 0}</span>
            <span className="info-label">O'qituvchilar</span>
          </div>
        </div>
        <div className="info-card">
          <span className="info-icon">📅</span>
          <div className="info-content">
            <span className="info-value">{stats.totalDays}</span>
            <span className="info-label">Ish kunlari</span>
          </div>
        </div>
      </div>

      {/* Capacity Info */}
      <div className="capacity-summary">
        <h4>Sig'im holati</h4>
        <div className="capacity-visual">
          <div className="capacity-bar-large">
            <div 
              className="capacity-fill"
              style={{ 
                width: `${(children.length / (group.capacity || 20)) * 100}%`,
                backgroundColor: children.length >= (group.capacity || 20) ? '#ef4444' : '#22c55e'
              }}
            />
          </div>
          <span className="capacity-text">
            {children.length} / {group.capacity || 20} ({Math.round((children.length / (group.capacity || 20)) * 100)}%)
          </span>
        </div>
      </div>

      {/* Age Distribution */}
      <div className="age-distribution">
        <h4>Yosh taqsimoti</h4>
        <div className="age-bars">
          {[3, 4, 5, 6].map(age => {
            const count = children.filter(c => {
              const birthYear = new Date(c.birthDate).getFullYear()
              const currentYear = new Date().getFullYear()
              return currentYear - birthYear === age
            }).length
            const percentage = children.length > 0 ? (count / children.length) * 100 : 0
            return (
              <div key={age} className="age-bar-item">
                <span className="age-label">{age} yosh</span>
                <div className="age-bar">
                  <div className="age-fill" style={{ width: `${percentage}%` }} />
                </div>
                <span className="age-count">{count}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Main Group Reports Component
function GroupReports({ 
  group, 
  children = [], 
  attendance = [],
  onExport,
  onClose 
}) {
  const [reportType, setReportType] = useState('summary')
  const [datePreset, setDatePreset] = useState('month')
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format) => {
    setIsExporting(true)
    try {
      await onExport?.({ 
        group, 
        reportType, 
        format,
        dateRange: DATE_PRESETS[datePreset]
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <motion.div
      className="group-reports"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="reports-header">
        <div className="reports-title">
          <h2>📊 {group.name} - Hisobotlar</h2>
          <p>Guruh statistikasi va tahlili</p>
        </div>
        {onClose && (
          <button className="close-btn" onClick={onClose}>✕</button>
        )}
      </div>

      {/* Controls */}
      <div className="reports-controls">
        {/* Report Type Tabs */}
        <div className="report-tabs">
          {REPORT_TYPES.map(type => (
            <button
              key={type.id}
              className={`report-tab ${reportType === type.id ? 'active' : ''}`}
              onClick={() => setReportType(type.id)}
            >
              <span className="tab-icon">{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>

        {/* Date Range */}
        <div className="date-presets">
          {Object.entries(DATE_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              className={`preset-btn ${datePreset === key ? 'active' : ''}`}
              onClick={() => setDatePreset(key)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Report Content */}
      <div className="reports-content">
        {reportType === 'attendance' && (
          <AttendanceReport 
            group={group} 
            attendance={attendance} 
            children={children}
            dateRange={DATE_PRESETS[datePreset]}
          />
        )}
        {reportType === 'progress' && (
          <ProgressReport group={group} children={children} />
        )}
        {reportType === 'summary' && (
          <SummaryReport 
            group={group} 
            children={children} 
            attendance={attendance}
          />
        )}
      </div>

      {/* Export Actions */}
      <div className="reports-actions">
        <button 
          className="export-btn excel"
          onClick={() => handleExport('excel')}
          disabled={isExporting}
        >
          📗 Excel
        </button>
        <button 
          className="export-btn pdf"
          onClick={() => handleExport('pdf')}
          disabled={isExporting}
        >
          📕 PDF
        </button>
        <button 
          className="export-btn print"
          onClick={() => window.print()}
          disabled={isExporting}
        >
          🖨️ Chop etish
        </button>
      </div>
    </motion.div>
  )
}

export default GroupReports
