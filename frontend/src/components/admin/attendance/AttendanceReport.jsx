/**
 * AttendanceReport - Davomat hisobotlari
 */
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import './AttendanceReport.css'

// Hisobot turlari
const REPORT_TYPES = [
  { id: 'daily', name: 'Kunlik', icon: '📅' },
  { id: 'weekly', name: 'Haftalik', icon: '📆' },
  { id: 'monthly', name: 'Oylik', icon: '🗓️' },
  { id: 'custom', name: 'Maxsus', icon: '⚙️' }
]

// Export formatlari
const EXPORT_FORMATS = [
  { id: 'excel', name: 'Excel', icon: '📊', ext: '.xlsx' },
  { id: 'pdf', name: 'PDF', icon: '📄', ext: '.pdf' },
  { id: 'csv', name: 'CSV', icon: '📋', ext: '.csv' }
]

// Statistika hisoblash
function calculateStats(data) {
  if (!data || data.length === 0) {
    return { present: 0, absent: 0, late: 0, rate: 0 }
  }
  
  const present = data.filter(d => d.status === 'present').length
  const absent = data.filter(d => d.status === 'absent').length
  const late = data.filter(d => d.status === 'late').length
  const total = data.length
  
  return {
    present,
    absent,
    late,
    total,
    rate: total > 0 ? Math.round((present / total) * 100) : 0
  }
}

// Guruh bo'yicha statistika
function calculateGroupStats(data, groups) {
  return groups.map(group => {
    const groupData = data.filter(d => d.groupId === group.id)
    return {
      ...group,
      stats: calculateStats(groupData)
    }
  })
}

// Bola bo'yicha statistika
function calculateChildStats(data, children) {
  return children.map(child => {
    const childData = data.filter(d => d.childId === child.id)
    return {
      ...child,
      stats: calculateStats(childData)
    }
  }).sort((a, b) => b.stats.rate - a.stats.rate)
}

// Report Preview komponenti
function ReportPreview({ data, dateRange, groups, children, reportType }) {
  const stats = useMemo(() => calculateStats(data), [data])
  const groupStats = useMemo(() => calculateGroupStats(data, groups), [data, groups])
  const childStats = useMemo(() => calculateChildStats(data, children), [data, children])
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('uz-UZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }
  
  return (
    <div className="report-preview">
      {/* Header */}
      <div className="report-header">
        <h2 className="report-title">Davomat Hisoboti</h2>
        <p className="report-period">
          {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
        </p>
      </div>
      
      {/* Umumiy statistika */}
      <div className="report-section">
        <h3 className="section-title">Umumiy Ko'rsatkichlar</h3>
        <div className="stats-grid">
          <div className="stat-box">
            <span className="stat-icon">✅</span>
            <span className="stat-value">{stats.present}</span>
            <span className="stat-label">Qatnashgan</span>
          </div>
          <div className="stat-box">
            <span className="stat-icon">❌</span>
            <span className="stat-value">{stats.absent}</span>
            <span className="stat-label">Qatnashmagan</span>
          </div>
          <div className="stat-box">
            <span className="stat-icon">⏰</span>
            <span className="stat-value">{stats.late}</span>
            <span className="stat-label">Kechikkan</span>
          </div>
          <div className="stat-box highlight">
            <span className="stat-icon">📊</span>
            <span className="stat-value">{stats.rate}%</span>
            <span className="stat-label">Davomat</span>
          </div>
        </div>
      </div>
      
      {/* Guruhlar bo'yicha */}
      <div className="report-section">
        <h3 className="section-title">Guruhlar Bo'yicha</h3>
        <table className="report-table">
          <thead>
            <tr>
              <th>Guruh</th>
              <th>Qatnashgan</th>
              <th>Qatnashmagan</th>
              <th>Kechikkan</th>
              <th>Davomat %</th>
            </tr>
          </thead>
          <tbody>
            {groupStats.map(group => (
              <tr key={group.id}>
                <td>{group.name}</td>
                <td className="text-success">{group.stats.present}</td>
                <td className="text-danger">{group.stats.absent}</td>
                <td className="text-warning">{group.stats.late}</td>
                <td>
                  <div className="rate-cell">
                    <div 
                      className="rate-bar"
                      style={{ width: `${group.stats.rate}%` }}
                    />
                    <span>{group.stats.rate}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Top/Bottom bolalar */}
      <div className="report-section">
        <h3 className="section-title">Eng Yaxshi Davomat</h3>
        <div className="child-list">
          {childStats.slice(0, 5).map((child, idx) => (
            <div key={child.id} className="child-row">
              <span className="child-rank">{idx + 1}</span>
              <span className="child-name">{child.name}</span>
              <span className="child-rate success">{child.stats.rate}%</span>
            </div>
          ))}
        </div>
      </div>
      
      {childStats.some(c => c.stats.rate < 70) && (
        <div className="report-section">
          <h3 className="section-title">E'tibor Talab Qiluvchi</h3>
          <div className="child-list">
            {childStats.filter(c => c.stats.rate < 70).slice(0, 5).map((child, idx) => (
              <div key={child.id} className="child-row warning">
                <span className="child-rank">⚠️</span>
                <span className="child-name">{child.name}</span>
                <span className="child-rate danger">{child.stats.rate}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Asosiy komponent
function AttendanceReport({
  attendanceData = [],
  groups = [],
  children = [],
  onExport,
  onSchedule
}) {
  const [reportType, setReportType] = useState('monthly')
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date()
    const start = new Date()
    start.setMonth(start.getMonth() - 1)
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    }
  })
  const [selectedGroups, setSelectedGroups] = useState([])
  const [exporting, setExporting] = useState(false)
  
  // Filtrlangan data
  const filteredData = useMemo(() => {
    let data = attendanceData.filter(d => {
      const date = new Date(d.date)
      return date >= new Date(dateRange.start) && date <= new Date(dateRange.end)
    })
    
    if (selectedGroups.length > 0) {
      data = data.filter(d => selectedGroups.includes(d.groupId))
    }
    
    return data
  }, [attendanceData, dateRange, selectedGroups])
  
  // Filtrlangan bolalar
  const filteredChildren = useMemo(() => {
    if (selectedGroups.length === 0) return children
    return children.filter(c => selectedGroups.includes(c.groupId))
  }, [children, selectedGroups])
  
  // Filtrlangan guruhlar
  const filteredGroups = useMemo(() => {
    if (selectedGroups.length === 0) return groups
    return groups.filter(g => selectedGroups.includes(g.id))
  }, [groups, selectedGroups])
  
  // Hisobot turini o'zgartirish
  const handleReportTypeChange = (type) => {
    setReportType(type)
    
    const end = new Date()
    const start = new Date()
    
    switch (type) {
      case 'daily':
        setDateRange({
          start: end.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        })
        break
      case 'weekly':
        start.setDate(start.getDate() - 7)
        setDateRange({
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        })
        break
      case 'monthly':
        start.setMonth(start.getMonth() - 1)
        setDateRange({
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        })
        break
    }
  }
  
  // Export
  const handleExport = async (format) => {
    setExporting(true)
    try {
      await onExport?.({
        format,
        dateRange,
        data: filteredData,
        groups: filteredGroups,
        children: filteredChildren
      })
    } finally {
      setExporting(false)
    }
  }
  
  return (
    <div className="attendance-report">
      {/* Controls */}
      <div className="report-controls">
        {/* Report Type */}
        <div className="control-section">
          <label className="control-label">Hisobot turi</label>
          <div className="report-type-selector">
            {REPORT_TYPES.map(type => (
              <button
                key={type.id}
                className={`type-btn ${reportType === type.id ? 'active' : ''}`}
                onClick={() => handleReportTypeChange(type.id)}
              >
                <span className="type-icon">{type.icon}</span>
                <span className="type-name">{type.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Date Range */}
        <div className="control-section">
          <label className="control-label">Sana oralig'i</label>
          <div className="date-range-inputs">
            <input
              type="date"
              value={dateRange.start}
              onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="date-input"
            />
            <span className="date-separator">—</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="date-input"
            />
          </div>
        </div>
        
        {/* Group Filter */}
        <div className="control-section">
          <label className="control-label">Guruhlar</label>
          <div className="group-filter">
            <button
              className={`group-btn ${selectedGroups.length === 0 ? 'active' : ''}`}
              onClick={() => setSelectedGroups([])}
            >
              Barchasi
            </button>
            {groups.map(group => (
              <button
                key={group.id}
                className={`group-btn ${selectedGroups.includes(group.id) ? 'active' : ''}`}
                onClick={() => {
                  setSelectedGroups(prev => 
                    prev.includes(group.id)
                      ? prev.filter(id => id !== group.id)
                      : [...prev, group.id]
                  )
                }}
              >
                {group.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Export Buttons */}
        <div className="control-section">
          <label className="control-label">Eksport</label>
          <div className="export-buttons">
            {EXPORT_FORMATS.map(format => (
              <motion.button
                key={format.id}
                className="export-btn"
                onClick={() => handleExport(format.id)}
                disabled={exporting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="export-icon">{format.icon}</span>
                <span className="export-name">{format.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Report Preview */}
      <ReportPreview
        data={filteredData}
        dateRange={dateRange}
        groups={filteredGroups}
        children={filteredChildren}
        reportType={reportType}
      />
    </div>
  )
}

export default AttendanceReport
export { calculateStats, calculateGroupStats, calculateChildStats }
