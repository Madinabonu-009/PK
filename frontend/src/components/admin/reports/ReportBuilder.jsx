import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './ReportBuilder.css'

// Report Types
const REPORT_TYPES = [
  { id: 'attendance', name: 'Davomat hisoboti', icon: '📊', description: "Bolalarning davomati bo'yicha hisobot" },
  { id: 'financial', name: 'Moliyaviy hisobot', icon: '💰', description: "To'lovlar va qarzlar hisoboti" },
  { id: 'enrollment', name: "Ro'yxatga olish", icon: '👶', description: "Yangi bolalar va chiqishlar" },
  { id: 'progress', name: 'Rivojlanish', icon: '📈', description: "Bolalar rivojlanishi hisoboti" },
  { id: 'staff', name: 'Xodimlar', icon: '👥', description: 'Xodimlar faoliyati hisoboti' },
  { id: 'nutrition', name: 'Ovqatlanish', icon: '🍽️', description: 'Menyu va ovqatlanish hisoboti' }
]

// Date Range Presets
const DATE_PRESETS = [
  { id: 'today', label: 'Bugun' },
  { id: 'yesterday', label: 'Kecha' },
  { id: 'week', label: 'Bu hafta' },
  { id: 'month', label: 'Bu oy' },
  { id: 'quarter', label: 'Bu chorak' },
  { id: 'year', label: 'Bu yil' },
  { id: 'custom', label: 'Boshqa' }
]

// Export Formats
const EXPORT_FORMATS = [
  { id: 'pdf', name: 'PDF', icon: '📄', description: 'Chop etish uchun' },
  { id: 'excel', name: 'Excel', icon: '📊', description: 'Tahlil uchun' },
  { id: 'csv', name: 'CSV', icon: '📋', description: 'Import uchun' }
]

// Report Type Card
function ReportTypeCard({ type, selected, onClick }) {
  return (
    <motion.div
      className={`report-type-card ${selected ? 'selected' : ''}`}
      onClick={() => onClick(type)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="report-type-icon">{type.icon}</span>
      <div className="report-type-info">
        <h4 className="report-type-name">{type.name}</h4>
        <p className="report-type-desc">{type.description}</p>
      </div>
      {selected && <span className="report-type-check">✓</span>}
    </motion.div>
  )
}

// Date Range Picker
function DateRangePicker({ preset, startDate, endDate, onPresetChange, onStartChange, onEndChange }) {
  const getPresetDates = (presetId) => {
    const today = new Date()
    const start = new Date()
    const end = new Date()

    switch (presetId) {
      case 'today':
        break
      case 'yesterday':
        start.setDate(today.getDate() - 1)
        end.setDate(today.getDate() - 1)
        break
      case 'week':
        start.setDate(today.getDate() - today.getDay())
        break
      case 'month':
        start.setDate(1)
        break
      case 'quarter':
        start.setMonth(Math.floor(today.getMonth() / 3) * 3, 1)
        break
      case 'year':
        start.setMonth(0, 1)
        break
      default:
        return null
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    }
  }

  const handlePresetClick = (presetId) => {
    onPresetChange(presetId)
    if (presetId !== 'custom') {
      const dates = getPresetDates(presetId)
      if (dates) {
        onStartChange(dates.start)
        onEndChange(dates.end)
      }
    }
  }

  return (
    <div className="date-range-picker">
      <div className="date-presets">
        {DATE_PRESETS.map(p => (
          <button
            key={p.id}
            className={`date-preset-btn ${preset === p.id ? 'active' : ''}`}
            onClick={() => handlePresetClick(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>
      
      <AnimatePresence>
        {preset === 'custom' && (
          <motion.div
            className="custom-date-inputs"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="date-input-group">
              <label>Boshlanish</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartChange(e.target.value)}
              />
            </div>
            <div className="date-input-group">
              <label>Tugash</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndChange(e.target.value)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Filter Builder
function FilterBuilder({ filters, availableFilters, onChange }) {
  const addFilter = (filterKey) => {
    if (!filters[filterKey]) {
      onChange({ ...filters, [filterKey]: '' })
    }
  }

  const updateFilter = (key, value) => {
    onChange({ ...filters, [key]: value })
  }

  const removeFilter = (key) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    onChange(newFilters)
  }

  return (
    <div className="filter-builder">
      <div className="active-filters">
        {Object.entries(filters).map(([key, value]) => {
          const filterDef = availableFilters.find(f => f.key === key)
          if (!filterDef) return null

          return (
            <div key={key} className="filter-item">
              <span className="filter-label">{filterDef.label}:</span>
              {filterDef.type === 'select' ? (
                <select
                  value={value}
                  onChange={(e) => updateFilter(key, e.target.value)}
                >
                  <option value="">Barchasi</option>
                  {filterDef.options?.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={filterDef.type || 'text'}
                  value={value}
                  onChange={(e) => updateFilter(key, e.target.value)}
                  placeholder={filterDef.placeholder}
                />
              )}
              <button className="filter-remove" onClick={() => removeFilter(key)}>✕</button>
            </div>
          )
        })}
      </div>

      <div className="add-filter">
        <select onChange={(e) => { if (e.target.value) addFilter(e.target.value); e.target.value = '' }}>
          <option value="">+ Filtr qo'shish</option>
          {availableFilters
            .filter(f => !filters.hasOwnProperty(f.key))
            .map(f => (
              <option key={f.key} value={f.key}>{f.label}</option>
            ))}
        </select>
      </div>
    </div>
  )
}

// Report Preview
function ReportPreview({ reportType, dateRange, filters, data }) {
  if (!data) {
    return (
      <div className="report-preview-empty">
        <span className="preview-icon">📋</span>
        <p>Hisobotni ko'rish uchun "Ko'rish" tugmasini bosing</p>
      </div>
    )
  }

  return (
    <div className="report-preview">
      <div className="preview-header">
        <h3>{REPORT_TYPES.find(t => t.id === reportType)?.name}</h3>
        <span className="preview-date">{dateRange.start} - {dateRange.end}</span>
      </div>

      {data.summary && (
        <div className="preview-summary">
          {Object.entries(data.summary).map(([key, value]) => (
            <div key={key} className="summary-item">
              <span className="summary-label">{key}</span>
              <span className="summary-value">{value}</span>
            </div>
          ))}
        </div>
      )}

      {data.table && (
        <div className="preview-table-wrapper">
          <table className="preview-table">
            <thead>
              <tr>
                {data.table.columns.map(col => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.table.rows.map((row, idx) => (
                <tr key={idx}>
                  {data.table.columns.map(col => (
                    <td key={col.key}>{row[col.key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// Main Report Builder Component
function ReportBuilder({
  onGenerate,
  onExport,
  onSchedule,
  availableFilters = [],
  loading = false
}) {
  const [step, setStep] = useState(1)
  const [reportType, setReportType] = useState('')
  const [datePreset, setDatePreset] = useState('month')
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])
  const [filters, setFilters] = useState({})
  const [previewData, setPreviewData] = useState(null)
  const [exportFormat, setExportFormat] = useState('pdf')

  // Default filters based on report type
  const defaultFilters = useMemo(() => {
    const baseFilters = [
      { key: 'group', label: 'Guruh', type: 'select', options: [] }
    ]

    switch (reportType) {
      case 'attendance':
        return [...baseFilters, { key: 'status', label: 'Holat', type: 'select', options: [
          { value: 'present', label: 'Kelgan' },
          { value: 'absent', label: 'Kelmagan' },
          { value: 'late', label: 'Kechikkan' }
        ]}]
      case 'financial':
        return [...baseFilters, 
          { key: 'paymentStatus', label: "To'lov holati", type: 'select', options: [
            { value: 'paid', label: "To'langan" },
            { value: 'pending', label: 'Kutilmoqda' },
            { value: 'overdue', label: 'Muddati o\'tgan' }
          ]},
          { key: 'minAmount', label: 'Min summa', type: 'number', placeholder: '0' }
        ]
      default:
        return baseFilters
    }
  }, [reportType])

  const handlePreview = async () => {
    const config = {
      type: reportType,
      dateRange: { start: startDate, end: endDate },
      filters
    }
    
    const data = await onGenerate?.(config)
    setPreviewData(data)
  }

  const handleExport = async () => {
    const config = {
      type: reportType,
      dateRange: { start: startDate, end: endDate },
      filters,
      format: exportFormat
    }
    
    await onExport?.(config)
  }

  const canProceed = () => {
    switch (step) {
      case 1: return !!reportType
      case 2: return startDate && endDate
      case 3: return true
      default: return false
    }
  }

  return (
    <div className="report-builder">
      {/* Progress Steps */}
      <div className="builder-steps">
        {[
          { num: 1, label: 'Tur tanlash' },
          { num: 2, label: 'Sana' },
          { num: 3, label: 'Filtrlar' },
          { num: 4, label: "Ko'rish" }
        ].map(s => (
          <div 
            key={s.num}
            className={`builder-step ${step === s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}
            onClick={() => step > s.num && setStep(s.num)}
          >
            <span className="step-number">{step > s.num ? '✓' : s.num}</span>
            <span className="step-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="builder-content">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="step-content"
            >
              <h3 className="step-title">Hisobot turini tanlang</h3>
              <div className="report-types-grid">
                {REPORT_TYPES.map(type => (
                  <ReportTypeCard
                    key={type.id}
                    type={type}
                    selected={reportType === type.id}
                    onClick={(t) => setReportType(t.id)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="step-content"
            >
              <h3 className="step-title">Sana oralig'ini tanlang</h3>
              <DateRangePicker
                preset={datePreset}
                startDate={startDate}
                endDate={endDate}
                onPresetChange={setDatePreset}
                onStartChange={setStartDate}
                onEndChange={setEndDate}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="step-content"
            >
              <h3 className="step-title">Filtrlarni sozlang</h3>
              <FilterBuilder
                filters={filters}
                availableFilters={availableFilters.length > 0 ? availableFilters : defaultFilters}
                onChange={setFilters}
              />
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="step-content"
            >
              <h3 className="step-title">Hisobotni ko'rish</h3>
              
              <div className="preview-actions">
                <button 
                  className="preview-btn"
                  onClick={handlePreview}
                  disabled={loading}
                >
                  {loading ? 'Yuklanmoqda...' : '🔄 Yangilash'}
                </button>
              </div>

              <ReportPreview
                reportType={reportType}
                dateRange={{ start: startDate, end: endDate }}
                filters={filters}
                data={previewData}
              />

              {previewData && (
                <div className="export-section">
                  <h4>Eksport formati</h4>
                  <div className="export-formats">
                    {EXPORT_FORMATS.map(format => (
                      <button
                        key={format.id}
                        className={`export-format-btn ${exportFormat === format.id ? 'active' : ''}`}
                        onClick={() => setExportFormat(format.id)}
                      >
                        <span className="format-icon">{format.icon}</span>
                        <span className="format-name">{format.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="builder-navigation">
        {step > 1 && (
          <button 
            className="nav-btn nav-btn--back"
            onClick={() => setStep(step - 1)}
          >
            ← Orqaga
          </button>
        )}
        
        <div className="nav-spacer" />

        {step < 4 ? (
          <button 
            className="nav-btn nav-btn--next"
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
          >
            Keyingi →
          </button>
        ) : (
          <button 
            className="nav-btn nav-btn--export"
            onClick={handleExport}
            disabled={!previewData || loading}
          >
            📥 Yuklab olish
          </button>
        )}
      </div>
    </div>
  )
}

export default ReportBuilder
export { ReportTypeCard, DateRangePicker, FilterBuilder, ReportPreview, REPORT_TYPES, DATE_PRESETS, EXPORT_FORMATS }
