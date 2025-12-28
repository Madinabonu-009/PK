/**
 * PaymentReminder - Avtomatik to'lov eslatmalari
 * Task 14.3: Implement automated reminders
 */
import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './PaymentReminder.css'

// Eslatma shablonlari
const REMINDER_TEMPLATES = {
  gentle: {
    id: 'gentle',
    name: "Yumshoq eslatma",
    icon: '💬',
    daysOverdue: 0,
    template: {
      uz: "Hurmatli ota-ona! {childName} uchun {month} oyi to'lovi ({amount}) hali amalga oshirilmagan. Iltimos, to'lovni vaqtida  amalga oshiring. Rahmat! 🙏",
      ru: "Уважаемые родители! Оплата за {month} для {childName} ({amount}) ещё не произведена. Пожалуйста, произведите оплату в удобное время. Спасибо! 🙏",
      en: "Dear parent! Payment for {month} for {childName} ({amount}) has not been made yet. Please make the payment at your convenience. Thank you! 🙏"
    }
  },
  reminder: {
    id: 'reminder',
    name: "Oddiy eslatma",
    icon: '📢',
    daysOverdue: 7,
    template: {
      uz: "Hurmatli ota-ona! {childName} uchun {month} oyi to'lovi ({amount}) {days} kun kechikmoqda. Iltimos, to'lovni tezroq amalga oshiring.",
      ru: "Уважаемые родители! Оплата за {month} для {childName} ({amount}) просрочена на {days} дней. Пожалуйста, произведите оплату как можно скорее.",
      en: "Dear parent! Payment for {month} for {childName} ({amount}) is {days} days overdue. Please make the payment as soon as possible."
    }
  },
  urgent: {
    id: 'urgent',
    name: "Shoshilinch",
    icon: '⚠️',
    daysOverdue: 14,
    template: {
      uz: "Diqqat! {childName} uchun {month} oyi to'lovi ({amount}) {days} kun kechikmoqda. Iltimos, bugun to'lovni amalga oshiring yoki biz bilan bog'laning.",
      ru: "Внимание! Оплата за {month} для {childName} ({amount}) просрочена на {days} дней. Пожалуйста, произведите оплату сегодня или свяжитесь с нами.",
      en: "Attention! Payment for {month} for {childName} ({amount}) is {days} days overdue. Please make the payment today or contact us."
    }
  },
  final: {
    id: 'final',
    name: "Oxirgi ogohlantirish",
    icon: '🚨',
    daysOverdue: 30,
    template: {
      uz: "MUHIM! {childName} uchun {month} oyi to'lovi ({amount}) {days} kun kechikmoqda. Bu oxirgi ogohlantirish. Iltimos, zudlik bilan to'lovni amalga oshiring yoki ma'muriyat bilan bog'laning.",
      ru: "ВАЖНО! Оплата за {month} для {childName} ({amount}) просрочена на {days} дней. Это последнее предупреждение. Пожалуйста, срочно произведите оплату или свяжитесь с администрацией.",
      en: "IMPORTANT! Payment for {month} for {childName} ({amount}) is {days} days overdue. This is the final warning. Please make the payment immediately or contact administration."
    }
  }
}

// Eslatma holatlari
const REMINDER_STATUS = {
  pending: { label: 'Kutilmoqda', color: '#f59e0b', icon: '⏳' },
  sent: { label: 'Yuborildi', color: '#22c55e', icon: '✅' },
  failed: { label: 'Xato', color: '#ef4444', icon: '❌' },
  scheduled: { label: 'Rejalashtirilgan', color: '#3b82f6', icon: '📅' }
}

// Pul formatini chiqarish
function formatCurrency(amount) {
  return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm"
}

// Kunlarni hisoblash
function calculateDaysOverdue(dueDate) {
  const due = new Date(dueDate)
  const today = new Date()
  const diff = Math.floor((today - due) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

// Xabarni formatlash
function formatMessage(template, data) {
  let message = template
  Object.keys(data).forEach(key => {
    message = message.replace(new RegExp(`{${key}}`, 'g'), data[key])
  })
  return message
}

// Debtor Card komponenti
function DebtorCard({ debtor, onSendReminder, onSchedule, language = 'uz' }) {
  const [showTemplates, setShowTemplates] = useState(false)
  const daysOverdue = calculateDaysOverdue(debtor.dueDate)
  
  // Avtomatik shablon tanlash
  const suggestedTemplate = useMemo(() => {
    if (daysOverdue >= 30) return REMINDER_TEMPLATES.final
    if (daysOverdue >= 14) return REMINDER_TEMPLATES.urgent
    if (daysOverdue >= 7) return REMINDER_TEMPLATES.reminder
    return REMINDER_TEMPLATES.gentle
  }, [daysOverdue])
  
  const handleSend = (template) => {
    const message = formatMessage(template.template[language], {
      childName: debtor.childName,
      month: debtor.month,
      amount: formatCurrency(debtor.amount),
      days: daysOverdue
    })
    
    onSendReminder({
      debtorId: debtor.id,
      childId: debtor.childId,
      parentPhone: debtor.parentPhone,
      message,
      templateId: template.id
    })
    setShowTemplates(false)
  }
  
  return (
    <motion.div 
      className={`debtor-card ${daysOverdue > 14 ? 'urgent' : daysOverdue > 7 ? 'warning' : ''}`}
      layout
    >
      <div className="debtor-header">
        <div className="debtor-avatar">
          {debtor.childPhoto ? (
            <img src={debtor.childPhoto} alt={debtor.childName} />
          ) : (
            <span>{debtor.childName?.[0]}</span>
          )}
        </div>
        <div className="debtor-info">
          <h4>{debtor.childName}</h4>
          <span className="debtor-group">{debtor.groupName}</span>
        </div>
        <div className="debtor-amount">
          <span className="amount-value">{formatCurrency(debtor.amount)}</span>
          <span className="amount-label">{debtor.month}</span>
        </div>
      </div>
      
      <div className="debtor-details">
        <div className="detail-item">
          <span className="detail-icon">📅</span>
          <span className="detail-label">Muddat:</span>
          <span className="detail-value">{new Date(debtor.dueDate).toLocaleDateString('uz-UZ')}</span>
        </div>
        <div className="detail-item overdue">
          <span className="detail-icon">⏰</span>
          <span className="detail-label">Kechikish:</span>
          <span className="detail-value">{daysOverdue} kun</span>
        </div>
        <div className="detail-item">
          <span className="detail-icon">📱</span>
          <span className="detail-label">Telefon:</span>
          <span className="detail-value">{debtor.parentPhone}</span>
        </div>
      </div>
      
      {/* Reminder History */}
      {debtor.reminders?.length > 0 && (
        <div className="reminder-history">
          <span className="history-label">Oxirgi eslatma:</span>
          <span className="history-date">
            {new Date(debtor.reminders[0].sentAt).toLocaleDateString('uz-UZ')}
          </span>
          <span className={`history-status ${debtor.reminders[0].status}`}>
            {REMINDER_STATUS[debtor.reminders[0].status]?.icon}
          </span>
        </div>
      )}
      
      {/* Actions */}
      <div className="debtor-actions">
        <button 
          className="quick-send-btn"
          onClick={() => handleSend(suggestedTemplate)}
        >
          {suggestedTemplate.icon} Tez yuborish
        </button>
        <button 
          className="templates-btn"
          onClick={() => setShowTemplates(!showTemplates)}
        >
          📝 Shablonlar
        </button>
        <button 
          className="schedule-btn"
          onClick={() => onSchedule(debtor)}
        >
          📅 Rejalashtirish
        </button>
      </div>
      
      {/* Template Selection */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            className="templates-dropdown"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {Object.values(REMINDER_TEMPLATES).map(template => (
              <button
                key={template.id}
                className={`template-option ${template.id === suggestedTemplate.id ? 'suggested' : ''}`}
                onClick={() => handleSend(template)}
              >
                <span className="template-icon">{template.icon}</span>
                <span className="template-name">{template.name}</span>
                {template.id === suggestedTemplate.id && (
                  <span className="suggested-badge">Tavsiya</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Schedule Modal
function ScheduleModal({ debtor, onSchedule, onClose, language = 'uz' }) {
  const [selectedTemplate, setSelectedTemplate] = useState('gentle')
  const [scheduleDate, setScheduleDate] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  })
  const [scheduleTime, setScheduleTime] = useState('09:00')
  const [repeat, setRepeat] = useState('none')
  
  const handleSchedule = () => {
    const template = REMINDER_TEMPLATES[selectedTemplate]
    const message = formatMessage(template.template[language], {
      childName: debtor.childName,
      month: debtor.month,
      amount: formatCurrency(debtor.amount),
      days: calculateDaysOverdue(debtor.dueDate)
    })
    
    onSchedule({
      debtorId: debtor.id,
      childId: debtor.childId,
      parentPhone: debtor.parentPhone,
      message,
      templateId: selectedTemplate,
      scheduledAt: `${scheduleDate}T${scheduleTime}`,
      repeat
    })
    onClose()
  }
  
  return (
    <motion.div
      className="schedule-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="schedule-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>📅 Eslatmani rejalashtirish</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-content">
          <div className="debtor-summary">
            <span className="summary-name">{debtor.childName}</span>
            <span className="summary-amount">{formatCurrency(debtor.amount)}</span>
          </div>
          
          <div className="form-group">
            <label>Shablon</label>
            <select
              value={selectedTemplate}
              onChange={e => setSelectedTemplate(e.target.value)}
            >
              {Object.values(REMINDER_TEMPLATES).map(t => (
                <option key={t.id} value={t.id}>
                  {t.icon} {t.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Sana</label>
              <input
                type="date"
                value={scheduleDate}
                onChange={e => setScheduleDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group">
              <label>Vaqt</label>
              <input
                type="time"
                value={scheduleTime}
                onChange={e => setScheduleTime(e.target.value)}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Takrorlash</label>
            <select value={repeat} onChange={e => setRepeat(e.target.value)}>
              <option value="none">Takrorlanmasin</option>
              <option value="daily">Har kuni</option>
              <option value="weekly">Har hafta</option>
              <option value="3days">Har 3 kunda</option>
            </select>
          </div>
          
          <div className="message-preview">
            <label>Xabar ko'rinishi:</label>
            <p>
              {formatMessage(REMINDER_TEMPLATES[selectedTemplate].template[language], {
                childName: debtor.childName,
                month: debtor.month,
                amount: formatCurrency(debtor.amount),
                days: calculateDaysOverdue(debtor.dueDate)
              })}
            </p>
          </div>
        </div>
        
        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>Bekor</button>
          <button className="schedule-btn" onClick={handleSchedule}>
            📅 Rejalashtirish
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Asosiy komponent
function PaymentReminder({
  debtors = [],
  onSendReminder,
  onScheduleReminder,
  onBulkSend,
  language = 'uz'
}) {
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDebtors, setSelectedDebtors] = useState([])
  const [scheduleDebtor, setScheduleDebtor] = useState(null)
  const [sending, setSending] = useState(false)
  
  // Filtrlangan qarzdorlar
  const filteredDebtors = useMemo(() => {
    let result = debtors
    
    // Filter by overdue status
    if (filter === 'overdue7') {
      result = result.filter(d => calculateDaysOverdue(d.dueDate) >= 7)
    } else if (filter === 'overdue14') {
      result = result.filter(d => calculateDaysOverdue(d.dueDate) >= 14)
    } else if (filter === 'overdue30') {
      result = result.filter(d => calculateDaysOverdue(d.dueDate) >= 30)
    }
    
    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(d => 
        d.childName?.toLowerCase().includes(query) ||
        d.groupName?.toLowerCase().includes(query) ||
        d.parentPhone?.includes(query)
      )
    }
    
    // Sort by days overdue
    return result.sort((a, b) => 
      calculateDaysOverdue(b.dueDate) - calculateDaysOverdue(a.dueDate)
    )
  }, [debtors, filter, searchQuery])
  
  // Statistika
  const stats = useMemo(() => {
    const total = debtors.length
    const totalAmount = debtors.reduce((sum, d) => sum + d.amount, 0)
    const overdue7 = debtors.filter(d => calculateDaysOverdue(d.dueDate) >= 7).length
    const overdue14 = debtors.filter(d => calculateDaysOverdue(d.dueDate) >= 14).length
    const overdue30 = debtors.filter(d => calculateDaysOverdue(d.dueDate) >= 30).length
    
    return { total, totalAmount, overdue7, overdue14, overdue30 }
  }, [debtors])
  
  // Tanlash
  const handleSelect = (debtorId) => {
    setSelectedDebtors(prev => 
      prev.includes(debtorId)
        ? prev.filter(id => id !== debtorId)
        : [...prev, debtorId]
    )
  }
  
  const handleSelectAll = () => {
    if (selectedDebtors.length === filteredDebtors.length) {
      setSelectedDebtors([])
    } else {
      setSelectedDebtors(filteredDebtors.map(d => d.id))
    }
  }
  
  // Ommaviy yuborish
  const handleBulkSend = async () => {
    setSending(true)
    try {
      const selected = debtors.filter(d => selectedDebtors.includes(d.id))
      const reminders = selected.map(debtor => {
        const daysOverdue = calculateDaysOverdue(debtor.dueDate)
        let template = REMINDER_TEMPLATES.gentle
        if (daysOverdue >= 30) template = REMINDER_TEMPLATES.final
        else if (daysOverdue >= 14) template = REMINDER_TEMPLATES.urgent
        else if (daysOverdue >= 7) template = REMINDER_TEMPLATES.reminder
        
        return {
          debtorId: debtor.id,
          childId: debtor.childId,
          parentPhone: debtor.parentPhone,
          message: formatMessage(template.template[language], {
            childName: debtor.childName,
            month: debtor.month,
            amount: formatCurrency(debtor.amount),
            days: daysOverdue
          }),
          templateId: template.id
        }
      })
      
      await onBulkSend?.(reminders)
      setSelectedDebtors([])
    } finally {
      setSending(false)
    }
  }
  
  return (
    <div className="payment-reminder">
      {/* Header */}
      <div className="reminder-header">
        <div className="header-title">
          <h2>📢 To'lov eslatmalari</h2>
          <p>Qarzdorlarga avtomatik eslatma yuborish</p>
        </div>
      </div>
      
      {/* Stats */}
      <div className="reminder-stats">
        <div className="stat-card">
          <span className="stat-icon">👥</span>
          <div className="stat-content">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Jami qarzdor</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">💰</span>
          <div className="stat-content">
            <span className="stat-value">{formatCurrency(stats.totalAmount)}</span>
            <span className="stat-label">Jami qarz</span>
          </div>
        </div>
        <div className="stat-card warning">
          <span className="stat-icon">⚠️</span>
          <div className="stat-content">
            <span className="stat-value">{stats.overdue14}</span>
            <span className="stat-label">14+ kun</span>
          </div>
        </div>
        <div className="stat-card danger">
          <span className="stat-icon">🚨</span>
          <div className="stat-content">
            <span className="stat-value">{stats.overdue30}</span>
            <span className="stat-label">30+ kun</span>
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="reminder-controls">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Barchasi ({stats.total})
          </button>
          <button 
            className={`filter-tab ${filter === 'overdue7' ? 'active' : ''}`}
            onClick={() => setFilter('overdue7')}
          >
            7+ kun ({stats.overdue7})
          </button>
          <button 
            className={`filter-tab ${filter === 'overdue14' ? 'active' : ''}`}
            onClick={() => setFilter('overdue14')}
          >
            14+ kun ({stats.overdue14})
          </button>
          <button 
            className={`filter-tab ${filter === 'overdue30' ? 'active' : ''}`}
            onClick={() => setFilter('overdue30')}
          >
            30+ kun ({stats.overdue30})
          </button>
        </div>
        
        <div className="search-actions">
          <input
            type="text"
            placeholder="Qidirish..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-input"
          />
          
          <button className="select-all-btn" onClick={handleSelectAll}>
            {selectedDebtors.length === filteredDebtors.length ? 'Bekor' : 'Hammasini tanlash'}
          </button>
          
          {selectedDebtors.length > 0 && (
            <button 
              className="bulk-send-btn"
              onClick={handleBulkSend}
              disabled={sending}
            >
              {sending ? '⏳' : '📤'} {selectedDebtors.length} taga yuborish
            </button>
          )}
        </div>
      </div>
      
      {/* Debtors List */}
      <div className="debtors-list">
        {filteredDebtors.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🎉</span>
            <p>Qarzdor topilmadi</p>
          </div>
        ) : (
          filteredDebtors.map(debtor => (
            <div 
              key={debtor.id}
              className={`debtor-wrapper ${selectedDebtors.includes(debtor.id) ? 'selected' : ''}`}
              onClick={() => handleSelect(debtor.id)}
            >
              <input
                type="checkbox"
                checked={selectedDebtors.includes(debtor.id)}
                onChange={() => handleSelect(debtor.id)}
                className="debtor-checkbox"
              />
              <DebtorCard
                debtor={debtor}
                language={language}
                onSendReminder={onSendReminder}
                onSchedule={setScheduleDebtor}
              />
            </div>
          ))
        )}
      </div>
      
      {/* Schedule Modal */}
      <AnimatePresence>
        {scheduleDebtor && (
          <ScheduleModal
            debtor={scheduleDebtor}
            language={language}
            onSchedule={onScheduleReminder}
            onClose={() => setScheduleDebtor(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default PaymentReminder
export { REMINDER_TEMPLATES, REMINDER_STATUS, formatMessage, calculateDaysOverdue }
