import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './CalendarExport.css'

// Export Formats
const EXPORT_FORMATS = [
  { 
    id: 'ical', 
    name: 'iCal (.ics)', 
    icon: '📅', 
    description: 'Apple Calendar, Outlook va boshqa ilovalar uchun',
    color: '#3b82f6'
  },
  { 
    id: 'google', 
    name: 'Google Calendar', 
    icon: '🔵', 
    description: 'Google Calendar ga to\'g\'ridan-to\'g\'ri qo\'shish',
    color: '#4285f4'
  },
  { 
    id: 'outlook', 
    name: 'Outlook', 
    icon: '📧', 
    description: 'Microsoft Outlook kalendari uchun',
    color: '#0078d4'
  },
  { 
    id: 'pdf', 
    name: 'PDF', 
    icon: '📄', 
    description: 'Chop etish uchun PDF formatda',
    color: '#ef4444'
  },
  { 
    id: 'excel', 
    name: 'Excel', 
    icon: '📊', 
    description: 'Excel jadval formatida',
    color: '#10b981'
  }
]

// Generate iCal content
const generateICalContent = (events) => {
  const formatDate = (date, time) => {
    const d = new Date(`${date}T${time || '00:00'}`)
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  let ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Play Kids//Calendar//UZ',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ]

  events.forEach(event => {
    ical.push(
      'BEGIN:VEVENT',
      `UID:${event.id}@playkids.uz`,
      `DTSTAMP:${formatDate(new Date().toISOString().split('T')[0], '00:00')}`,
      `DTSTART:${formatDate(event.date, event.startTime)}`,
      `DTEND:${formatDate(event.date, event.endTime || event.startTime)}`,
      `SUMMARY:${event.title}`,
      event.description ? `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}` : '',
      event.location ? `LOCATION:${event.location}` : '',
      'END:VEVENT'
    )
  })

  ical.push('END:VCALENDAR')
  return ical.filter(Boolean).join('\r\n')
}

// Generate Google Calendar URL
const generateGoogleCalendarUrl = (event) => {
  const formatDate = (date, time) => {
    return `${date.replace(/-/g, '')}T${(time || '00:00').replace(/:/g, '')}00`
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDate(event.date, event.startTime)}/${formatDate(event.date, event.endTime || event.startTime)}`,
    details: event.description || '',
    location: event.location || ''
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

// Export Option Card
function ExportOptionCard({ format, selected, onSelect }) {
  return (
    <motion.button
      className={`export-option-card ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(format.id)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{ '--format-color': format.color }}
    >
      <span className="format-icon">{format.icon}</span>
      <div className="format-info">
        <span className="format-name">{format.name}</span>
        <span className="format-desc">{format.description}</span>
      </div>
      {selected && <span className="check-icon">✓</span>}
    </motion.button>
  )
}

// Export Preview
function ExportPreview({ events, format }) {
  if (!events.length) return null

  return (
    <div className="export-preview">
      <h4>📋 Eksport qilinadigan tadbirlar ({events.length})</h4>
      <div className="preview-list">
        {events.slice(0, 5).map(event => (
          <div key={event.id} className="preview-item">
            <span className="preview-date">{event.date}</span>
            <span className="preview-title">{event.title}</span>
          </div>
        ))}
        {events.length > 5 && (
          <div className="preview-more">
            +{events.length - 5} ta boshqa tadbir
          </div>
        )}
      </div>
    </div>
  )
}

// Main Calendar Export Component
function CalendarExport({
  events = [],
  selectedEvent = null,
  onExport,
  onClose
}) {
  const [selectedFormat, setSelectedFormat] = useState('ical')
  const [exportScope, setExportScope] = useState(selectedEvent ? 'single' : 'all')
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })
  const [isExporting, setIsExporting] = useState(false)

  // Get events to export based on scope
  const eventsToExport = (() => {
    if (exportScope === 'single' && selectedEvent) {
      return [selectedEvent]
    }
    if (exportScope === 'range' && dateRange.start && dateRange.end) {
      return events.filter(e => 
        e.date >= dateRange.start && e.date <= dateRange.end
      )
    }
    return events
  })()

  const handleExport = async () => {
    setIsExporting(true)

    try {
      const format = EXPORT_FORMATS.find(f => f.id === selectedFormat)

      if (selectedFormat === 'ical') {
        const content = generateICalContent(eventsToExport)
        const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'playkids-calendar.ics'
        link.click()
        URL.revokeObjectURL(url)
      } else if (selectedFormat === 'google') {
        if (eventsToExport.length === 1) {
          window.open(generateGoogleCalendarUrl(eventsToExport[0]), '_blank')
        } else {
          // For multiple events, download iCal and show instructions
          const content = generateICalContent(eventsToExport)
          const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = 'playkids-calendar.ics'
          link.click()
          URL.revokeObjectURL(url)
          alert('Faylni yuklab oling va Google Calendar > Settings > Import ga o\'ting')
        }
      } else {
        // Call external export handler for PDF, Excel, Outlook
        await onExport?.(selectedFormat, eventsToExport)
      }
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <motion.div
      className="calendar-export-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="calendar-export-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>📤 Kalendar eksporti</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-content">
          {/* Export Scope */}
          <div className="export-section">
            <h3>Eksport doirasi</h3>
            <div className="scope-options">
              {selectedEvent && (
                <label className="scope-option">
                  <input
                    type="radio"
                    name="scope"
                    value="single"
                    checked={exportScope === 'single'}
                    onChange={() => setExportScope('single')}
                  />
                  <span className="radio-mark"></span>
                  <span>Faqat tanlangan tadbir</span>
                </label>
              )}
              <label className="scope-option">
                <input
                  type="radio"
                  name="scope"
                  value="all"
                  checked={exportScope === 'all'}
                  onChange={() => setExportScope('all')}
                />
                <span className="radio-mark"></span>
                <span>Barcha tadbirlar ({events.length})</span>
              </label>
              <label className="scope-option">
                <input
                  type="radio"
                  name="scope"
                  value="range"
                  checked={exportScope === 'range'}
                  onChange={() => setExportScope('range')}
                />
                <span className="radio-mark"></span>
                <span>Sana oralig'i</span>
              </label>
            </div>

            {exportScope === 'range' && (
              <div className="date-range-inputs">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  placeholder="Boshlanish"
                />
                <span>—</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  placeholder="Tugash"
                />
              </div>
            )}
          </div>

          {/* Export Format */}
          <div className="export-section">
            <h3>Format tanlang</h3>
            <div className="format-options">
              {EXPORT_FORMATS.map(format => (
                <ExportOptionCard
                  key={format.id}
                  format={format}
                  selected={selectedFormat === format.id}
                  onSelect={setSelectedFormat}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <ExportPreview events={eventsToExport} format={selectedFormat} />
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Bekor qilish
          </button>
          <button 
            className="btn-primary"
            onClick={handleExport}
            disabled={isExporting || eventsToExport.length === 0}
          >
            {isExporting ? '⏳ Eksport qilinmoqda...' : `📤 Eksport (${eventsToExport.length})`}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default CalendarExport
export {
  ExportOptionCard,
  ExportPreview,
  EXPORT_FORMATS,
  generateICalContent,
  generateGoogleCalendarUrl
}
