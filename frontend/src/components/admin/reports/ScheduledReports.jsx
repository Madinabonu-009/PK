import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './ScheduledReports.css'

// Schedule Frequencies
const SCHEDULE_FREQUENCIES = {
  daily: { label: 'Kunlik', icon: '📅' },
  weekly: { label: 'Haftalik', icon: '📆' },
  monthly: { label: 'Oylik', icon: '🗓️' },
  quarterly: { label: 'Choraklik', icon: '📊' }
}

// Report Types
const REPORT_TYPES = {
  attendance: { label: 'Davomat', icon: '📋', color: '#3b82f6' },
  financial: { label: 'Moliyaviy', icon: '💰', color: '#10b981' },
  enrollment: { label: "Ro'yxatga olish", icon: '👶', color: '#8b5cf6' },
  progress: { label: 'Rivojlanish', icon: '📈', color: '#f59e0b' }
}

// Delivery Methods
const DELIVERY_METHODS = {
  email: { label: 'Email', icon: '📧' },
  telegram: { label: 'Telegram', icon: '📱' },
  download: { label: 'Yuklab olish', icon: '💾' }
}

// Scheduled Report Card
function ScheduledReportCard({ report, onEdit, onDelete, onToggle, onRunNow }) {
  const reportType = REPORT_TYPES[report.type] || REPORT_TYPES.attendance
  const frequency = SCHEDULE_FREQUENCIES[report.frequency] || SCHEDULE_FREQUENCIES.weekly

  return (
    <motion.div
      className={`scheduled-report-card ${report.active ? 'active' : 'inactive'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="card-header">
        <span 
          className="report-type-badge"
          style={{ backgroundColor: `${reportType.color}20`, color: reportType.color }}
        >
          {reportType.icon} {reportType.label}
        </span>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={report.active}
            onChange={() => onToggle?.(report.id)}
          />
          <span className="slider"></span>
        </label>
      </div>

      <h3 className="report-name">{report.name}</h3>

      <div className="report-details">
        <div className="detail-item">
          <span className="detail-icon">{frequency.icon}</span>
          <span>{frequency.label}</span>
        </div>
        <div className="detail-item">
          <span className="detail-icon">⏰</span>
          <span>{report.time || '09:00'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-icon">📤</span>
          <span>
            {report.deliveryMethods?.map(m => DELIVERY_METHODS[m]?.icon).join(' ')}
          </span>
        </div>
      </div>

      {report.lastRun && (
        <div className="last-run">
          <span className="label">Oxirgi ishga tushirish:</span>
          <span className="value">
            {new Date(report.lastRun).toLocaleDateString('uz-UZ')}
          </span>
        </div>
      )}

      {report.nextRun && (
        <div className="next-run">
          <span className="label">Keyingi:</span>
          <span className="value">
            {new Date(report.nextRun).toLocaleDateString('uz-UZ')}
          </span>
        </div>
      )}

      <div className="card-actions">
        <button className="action-btn run" onClick={() => onRunNow?.(report)}>
          ▶️ Hozir ishga tushirish
        </button>
        <button className="action-btn edit" onClick={() => onEdit?.(report)}>
          ✏️
        </button>
        <button className="action-btn delete" onClick={() => onDelete?.(report)}>
          🗑️
        </button>
      </div>
    </motion.div>
  )
}

// Report History Item
function ReportHistoryItem({ item }) {
  const reportType = REPORT_TYPES[item.type] || REPORT_TYPES.attendance

  return (
    <div className={`history-item ${item.status}`}>
      <div className="history-icon">
        {item.status === 'success' ? '✅' : item.status === 'failed' ? '❌' : '⏳'}
      </div>
      <div className="history-info">
        <span className="history-name">{item.name}</span>
        <span className="history-type" style={{ color: reportType.color }}>
          {reportType.icon} {reportType.label}
        </span>
      </div>
      <div className="history-meta">
        <span className="history-date">
          {new Date(item.runDate).toLocaleDateString('uz-UZ')}
        </span>
        <span className="history-time">
          {new Date(item.runDate).toLocaleTimeString('uz-UZ', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
      {item.downloadUrl && (
        <a href={item.downloadUrl} className="download-btn" download>
          📥
        </a>
      )}
    </div>
  )
}


// Schedule Form Modal
function ScheduleFormModal({ report, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: report?.name || '',
    type: report?.type || 'attendance',
    frequency: report?.frequency || 'weekly',
    time: report?.time || '09:00',
    dayOfWeek: report?.dayOfWeek || 1,
    dayOfMonth: report?.dayOfMonth || 1,
    deliveryMethods: report?.deliveryMethods || ['email'],
    recipients: report?.recipients || '',
    active: report?.active ?? true
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    onSave?.({ ...report, ...formData })
    onClose()
  }

  const toggleDeliveryMethod = (method) => {
    setFormData(prev => ({
      ...prev,
      deliveryMethods: prev.deliveryMethods.includes(method)
        ? prev.deliveryMethods.filter(m => m !== method)
        : [...prev.deliveryMethods, method]
    }))
  }

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="schedule-form-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{report ? '✏️ Jadvalni tahrirlash' : '➕ Yangi jadval'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="schedule-form">
          <div className="form-group">
            <label>Hisobot nomi *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Masalan: Haftalik davomat hisoboti"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Hisobot turi</label>
              <select
                value={formData.type}
                onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
              >
                {Object.entries(REPORT_TYPES).map(([key, type]) => (
                  <option key={key} value={key}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Chastotasi</label>
              <select
                value={formData.frequency}
                onChange={e => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
              >
                {Object.entries(SCHEDULE_FREQUENCIES).map(([key, freq]) => (
                  <option key={key} value={key}>
                    {freq.icon} {freq.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Vaqti</label>
              <input
                type="time"
                value={formData.time}
                onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>

            {formData.frequency === 'weekly' && (
              <div className="form-group">
                <label>Hafta kuni</label>
                <select
                  value={formData.dayOfWeek}
                  onChange={e => setFormData(prev => ({ ...prev, dayOfWeek: Number(e.target.value) }))}
                >
                  <option value={1}>Dushanba</option>
                  <option value={2}>Seshanba</option>
                  <option value={3}>Chorshanba</option>
                  <option value={4}>Payshanba</option>
                  <option value={5}>Juma</option>
                  <option value={6}>Shanba</option>
                  <option value={0}>Yakshanba</option>
                </select>
              </div>
            )}

            {(formData.frequency === 'monthly' || formData.frequency === 'quarterly') && (
              <div className="form-group">
                <label>Oy kuni</label>
                <select
                  value={formData.dayOfMonth}
                  onChange={e => setFormData(prev => ({ ...prev, dayOfMonth: Number(e.target.value) }))}
                >
                  {Array.from({ length: 28 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Yetkazish usullari</label>
            <div className="delivery-methods">
              {Object.entries(DELIVERY_METHODS).map(([key, method]) => (
                <button
                  key={key}
                  type="button"
                  className={`method-btn ${formData.deliveryMethods.includes(key) ? 'active' : ''}`}
                  onClick={() => toggleDeliveryMethod(key)}
                >
                  {method.icon} {method.label}
                </button>
              ))}
            </div>
          </div>

          {formData.deliveryMethods.includes('email') && (
            <div className="form-group">
              <label>Email qabul qiluvchilar</label>
              <input
                type="text"
                value={formData.recipients}
                onChange={e => setFormData(prev => ({ ...prev, recipients: e.target.value }))}
                placeholder="email1@example.com, email2@example.com"
              />
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Bekor qilish
            </button>
            <button type="submit" className="btn-primary">
              💾 Saqlash
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// Main Scheduled Reports Component
function ScheduledReports({
  scheduledReports = [],
  reportHistory = [],
  onCreateSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
  onToggleSchedule,
  onRunNow
}) {
  const [showForm, setShowForm] = useState(false)
  const [editingReport, setEditingReport] = useState(null)
  const [activeTab, setActiveTab] = useState('schedules')

  const handleEdit = (report) => {
    setEditingReport(report)
    setShowForm(true)
  }

  const handleCreate = () => {
    setEditingReport(null)
    setShowForm(true)
  }

  const handleSave = (reportData) => {
    if (editingReport) {
      onUpdateSchedule?.(reportData)
    } else {
      onCreateSchedule?.(reportData)
    }
  }

  const handleDelete = (report) => {
    if (window.confirm(`"${report.name}" jadvalini o'chirmoqchimisiz?`)) {
      onDeleteSchedule?.(report.id)
    }
  }

  const activeReports = scheduledReports.filter(r => r.active)
  const inactiveReports = scheduledReports.filter(r => !r.active)

  return (
    <div className="scheduled-reports">
      {/* Header */}
      <div className="reports-header">
        <div className="header-info">
          <h2>📅 Rejalashtirilgan hisobotlar</h2>
          <p>{activeReports.length} ta faol jadval</p>
        </div>

        <button className="create-btn" onClick={handleCreate}>
          ➕ Yangi jadval
        </button>
      </div>

      {/* Tabs */}
      <div className="reports-tabs">
        <button
          className={`tab-btn ${activeTab === 'schedules' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedules')}
        >
          📋 Jadvallar ({scheduledReports.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📜 Tarix ({reportHistory.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'schedules' ? (
        <div className="schedules-content">
          {activeReports.length > 0 && (
            <div className="reports-section">
              <h3>🟢 Faol jadvallar</h3>
              <div className="reports-grid">
                <AnimatePresence>
                  {activeReports.map(report => (
                    <ScheduledReportCard
                      key={report.id}
                      report={report}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggle={onToggleSchedule}
                      onRunNow={onRunNow}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {inactiveReports.length > 0 && (
            <div className="reports-section">
              <h3>⚪ Nofaol jadvallar</h3>
              <div className="reports-grid">
                <AnimatePresence>
                  {inactiveReports.map(report => (
                    <ScheduledReportCard
                      key={report.id}
                      report={report}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggle={onToggleSchedule}
                      onRunNow={onRunNow}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {scheduledReports.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">📅</span>
              <h3>Jadvallar mavjud emas</h3>
              <p>Avtomatik hisobot yaratish uchun jadval qo'shing</p>
              <button className="create-btn" onClick={handleCreate}>
                ➕ Birinchi jadvalni yarating
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="history-content">
          {reportHistory.length > 0 ? (
            <div className="history-list">
              {reportHistory.map(item => (
                <ReportHistoryItem key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">📜</span>
              <h3>Tarix bo'sh</h3>
              <p>Hali hech qanday hisobot ishga tushirilmagan</p>
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <ScheduleFormModal
            report={editingReport}
            onSave={handleSave}
            onClose={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default ScheduledReports
export {
  ScheduledReportCard,
  ReportHistoryItem,
  ScheduleFormModal,
  SCHEDULE_FREQUENCIES,
  REPORT_TYPES,
  DELIVERY_METHODS
}
