import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../components/common/Toast'
import { Loading } from '../../components/common'
import api from '../../services/api'
import './EnrollmentsPage.css'

// Icons
const EnrollmentIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
)

const ClockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)

const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)

const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
)

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
)

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

// Filter tabs
const FILTERS = [
  { id: 'all', label: { uz: 'Barchasi', ru: 'Все', en: 'All' } },
  { id: 'pending', label: { uz: 'Kutilmoqda', ru: 'Ожидает', en: 'Pending' } },
  { id: 'accepted', label: { uz: 'Qabul qilindi', ru: 'Принято', en: 'Accepted' } },
  { id: 'rejected', label: { uz: 'Rad etildi', ru: 'Отклонено', en: 'Rejected' } }
]

// Texts
const TEXTS = {
  uz: {
    pageTitle: 'Arizalar',
    totalApplications: 'Jami arizalar',
    pending: 'Kutilmoqda',
    accepted: 'Qabul qilindi',
    rejected: 'Rad etildi',
    emptyList: 'Arizalar mavjud emas',
    emptyDesc: 'Hozircha arizalar yo\'q',
    childName: 'Bola ismi',
    age: 'Yosh',
    years: 'yosh',
    parent: 'Ota-ona',
    phone: 'Telefon',
    birthDate: 'Tug\'ilgan sana',
    submittedAt: 'Yuborilgan',
    status: 'Holat',
    contract: 'Shartnoma',
    contractAccepted: 'Roziligi berilgan',
    contractNotAccepted: 'Rozilik yo\'q',
    view: 'Ko\'rish',
    approve: 'Qabul qilish',
    reject: 'Rad etish',
    // Detail Modal
    details: 'Ariza tafsilotlari',
    childInfo: 'Bola ma\'lumotlari',
    parentInfo: 'Ota-ona ma\'lumotlari',
    email: 'Email',
    notes: 'Izohlar',
    applicationStatus: 'Ariza holati',
    processedAt: 'Ko\'rib chiqilgan',
    rejectionReason: 'Rad etish sababi',
    close: 'Yopish',
    // Action Modal
    approveTitle: 'Arizani qabul qilish',
    rejectTitle: 'Arizani rad etish',
    approveConfirm: 'Arizani qabul qilmoqchimisiz?',
    rejectConfirm: 'Arizani rad etmoqchimisiz?',
    enterReason: 'Rad etish sababini kiriting...',
    reasonRequired: 'Sabab kiritilishi shart',
    cancel: 'Bekor qilish',
    saving: 'Saqlanmoqda...',
    approveSuccess: 'Ariza qabul qilindi!',
    rejectSuccess: 'Ariza rad etildi!',
    error: 'Xatolik yuz berdi'
  },
  ru: {
    pageTitle: 'Заявки',
    totalApplications: 'Всего заявок',
    pending: 'Ожидает',
    accepted: 'Принято',
    rejected: 'Отклонено',
    emptyList: 'Нет заявок',
    emptyDesc: 'Пока нет заявок',
    childName: 'Имя ребенка',
    age: 'Возраст',
    years: 'лет',
    parent: 'Родитель',
    phone: 'Телефон',
    birthDate: 'Дата рождения',
    submittedAt: 'Подано',
    status: 'Статус',
    contract: 'Договор',
    contractAccepted: 'Согласие дано',
    contractNotAccepted: 'Нет согласия',
    view: 'Просмотр',
    approve: 'Принять',
    reject: 'Отклонить',
    details: 'Детали заявки',
    childInfo: 'Информация о ребенке',
    parentInfo: 'Информация о родителе',
    email: 'Email',
    notes: 'Заметки',
    applicationStatus: 'Статус заявки',
    processedAt: 'Рассмотрено',
    rejectionReason: 'Причина отказа',
    close: 'Закрыть',
    approveTitle: 'Принять заявку',
    rejectTitle: 'Отклонить заявку',
    approveConfirm: 'Принять заявку?',
    rejectConfirm: 'Отклонить заявку?',
    enterReason: 'Введите причину отказа...',
    reasonRequired: 'Причина обязательна',
    cancel: 'Отмена',
    saving: 'Сохранение...',
    approveSuccess: 'Заявка принята!',
    rejectSuccess: 'Заявка отклонена!',
    error: 'Произошла ошибка'
  },
  en: {
    pageTitle: 'Enrollments',
    totalApplications: 'Total Applications',
    pending: 'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
    emptyList: 'No applications',
    emptyDesc: 'No applications yet',
    childName: 'Child Name',
    age: 'Age',
    years: 'years',
    parent: 'Parent',
    phone: 'Phone',
    birthDate: 'Birth Date',
    submittedAt: 'Submitted',
    status: 'Status',
    contract: 'Contract',
    contractAccepted: 'Accepted',
    contractNotAccepted: 'Not accepted',
    view: 'View',
    approve: 'Approve',
    reject: 'Reject',
    details: 'Application Details',
    childInfo: 'Child Information',
    parentInfo: 'Parent Information',
    email: 'Email',
    notes: 'Notes',
    applicationStatus: 'Application Status',
    processedAt: 'Processed',
    rejectionReason: 'Rejection Reason',
    close: 'Close',
    approveTitle: 'Approve Application',
    rejectTitle: 'Reject Application',
    approveConfirm: 'Approve this application?',
    rejectConfirm: 'Reject this application?',
    enterReason: 'Enter rejection reason...',
    reasonRequired: 'Reason is required',
    cancel: 'Cancel',
    saving: 'Saving...',
    approveSuccess: 'Application approved!',
    rejectSuccess: 'Application rejected!',
    error: 'An error occurred'
  }
}

// Avatar colors
const AVATAR_COLORS = [
  'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
  'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
  'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
  'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)'
]

// Detail Modal Component
function DetailModal({ isOpen, onClose, enrollment, language, onApprove, onReject }) {
  const txt = TEXTS[language]
  
  if (!isOpen || !enrollment) return null

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const locale = language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en-US'
    return new Date(dateStr).toLocaleDateString(locale, {
      year: 'numeric', month: 'short', day: 'numeric'
    })
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-'
    const locale = language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en-US'
    return new Date(dateStr).toLocaleDateString(locale, {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  const calculateAge = (birthDate) => {
    if (!birthDate) return '-'
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--
    return age
  }

  return (
    <AnimatePresence>
      <motion.div
        className="enrollment-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="enrollment-modal detail-modal"
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="enrollment-modal-header">
            <h2>{txt.details}</h2>
            <button className="modal-close-btn" onClick={onClose}><CloseIcon /></button>
          </div>
          
          <div className="enrollment-modal-body">
            <div className="detail-section">
              <h4>👶 {txt.childInfo}</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">{txt.childName}:</span>
                  <span className="value">{enrollment.childName}</span>
                </div>
                <div className="detail-item">
                  <span className="label">{txt.birthDate}:</span>
                  <span className="value">{formatDate(enrollment.birthDate)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">{txt.age}:</span>
                  <span className="value">{calculateAge(enrollment.birthDate)} {txt.years}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>👨‍👩‍👧 {txt.parentInfo}</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">{txt.parent}:</span>
                  <span className="value">{enrollment.parentName}</span>
                </div>
                <div className="detail-item">
                  <span className="label">{txt.phone}:</span>
                  <span className="value">{enrollment.parentPhone}</span>
                </div>
                {enrollment.parentEmail && (
                  <div className="detail-item">
                    <span className="label">{txt.email}:</span>
                    <span className="value">{enrollment.parentEmail}</span>
                  </div>
                )}
              </div>
            </div>

            {enrollment.notes && (
              <div className="detail-section">
                <h4>📝 {txt.notes}</h4>
                <p className="notes-text">{enrollment.notes}</p>
              </div>
            )}

            <div className="detail-section">
              <h4>📋 {txt.applicationStatus}</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">{txt.status}:</span>
                  <span className={`status-badge status-${enrollment.status}`}>
                    {txt[enrollment.status]}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">{txt.submittedAt}:</span>
                  <span className="value">{formatDateTime(enrollment.submittedAt)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">{txt.contract}:</span>
                  <span className={`contract-badge ${enrollment.contractAccepted ? 'accepted' : ''}`}>
                    {enrollment.contractAccepted ? txt.contractAccepted : txt.contractNotAccepted}
                  </span>
                </div>
                {enrollment.rejectionReason && (
                  <div className="detail-item full-width">
                    <span className="label">{txt.rejectionReason}:</span>
                    <span className="value rejection">{enrollment.rejectionReason}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="enrollment-modal-footer">
            {enrollment.status === 'pending' && (
              <>
                <button className="btn-approve" onClick={() => { onClose(); onApprove(enrollment); }}>
                  <CheckIcon /> {txt.approve}
                </button>
                <button className="btn-reject" onClick={() => { onClose(); onReject(enrollment); }}>
                  <XIcon /> {txt.reject}
                </button>
              </>
            )}
            <button className="btn-close" onClick={onClose}>{txt.close}</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Action Modal Component
function ActionModal({ isOpen, onClose, enrollment, actionType, onConfirm, language }) {
  const txt = TEXTS[language]
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setReason('')
      setError('')
    }
  }, [isOpen])

  const handleSubmit = async () => {
    if (actionType === 'reject' && !reason.trim()) {
      setError(txt.reasonRequired)
      return
    }
    
    setSubmitting(true)
    try {
      await onConfirm(enrollment, actionType, reason.trim())
      onClose()
    } catch (err) {
      setError(txt.error)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen || !enrollment) return null

  return (
    <AnimatePresence>
      <motion.div
        className="enrollment-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="enrollment-modal action-modal"
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          onClick={e => e.stopPropagation()}
        >
          <div className={`enrollment-modal-header ${actionType}`}>
            <h2>{actionType === 'approve' ? txt.approveTitle : txt.rejectTitle}</h2>
            <button className="modal-close-btn" onClick={onClose}><CloseIcon /></button>
          </div>
          
          <div className="enrollment-modal-body">
            <div className="action-info">
              <div className="child-avatar" style={{ background: AVATAR_COLORS[0] }}>
                {enrollment.childName?.charAt(0)}
              </div>
              <div>
                <h3>{enrollment.childName}</h3>
                <p>{actionType === 'approve' ? txt.approveConfirm : txt.rejectConfirm}</p>
              </div>
            </div>

            {actionType === 'reject' && (
              <div className="form-field">
                <label>{txt.rejectionReason}</label>
                <textarea
                  value={reason}
                  onChange={(e) => { setReason(e.target.value); setError(''); }}
                  placeholder={txt.enterReason}
                  rows="3"
                  className={error ? 'error' : ''}
                />
                {error && <span className="field-error">{error}</span>}
              </div>
            )}
          </div>

          <div className="enrollment-modal-footer">
            <button className="btn-cancel" onClick={onClose} disabled={submitting}>
              {txt.cancel}
            </button>
            <button 
              className={actionType === 'approve' ? 'btn-approve' : 'btn-reject'}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <><span className="btn-spinner"></span> {txt.saving}</>
              ) : (
                <>{actionType === 'approve' ? <CheckIcon /> : <XIcon />} {actionType === 'approve' ? txt.approve : txt.reject}</>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Main Component
function EnrollmentsPage() {
  const { language } = useLanguage()
  const toast = useToast()
  const txt = TEXTS[language]
  
  const [loading, setLoading] = useState(true)
  const [enrollments, setEnrollments] = useState([])
  const [filter, setFilter] = useState('all')
  
  // Modals
  const [detailModal, setDetailModal] = useState({ open: false, enrollment: null })
  const [actionModal, setActionModal] = useState({ open: false, enrollment: null, type: '' })

  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get('/enrollments')
      const data = response.data?.data || (Array.isArray(response.data) ? response.data : [])
      setEnrollments(data)
    } catch (err) {
      console.error('Failed to fetch enrollments:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEnrollments()
  }, [fetchEnrollments])

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const locale = language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en-US'
    return new Date(dateStr).toLocaleDateString(locale, {
      year: 'numeric', month: 'short', day: 'numeric'
    })
  }

  const calculateAge = (birthDate) => {
    if (!birthDate) return '-'
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--
    return age
  }

  const getAvatarColor = (idx) => AVATAR_COLORS[idx % AVATAR_COLORS.length]

  // Stats
  const stats = {
    total: enrollments.length,
    pending: enrollments.filter(e => e.status === 'pending').length,
    accepted: enrollments.filter(e => e.status === 'accepted').length,
    rejected: enrollments.filter(e => e.status === 'rejected').length
  }

  // Filter
  const filteredEnrollments = filter === 'all' 
    ? enrollments 
    : enrollments.filter(e => e.status === filter)

  const handleAction = async (enrollment, actionType, reason) => {
    const enrollmentId = enrollment.id || enrollment._id
    const updateData = {
      status: actionType === 'approve' ? 'accepted' : 'rejected'
    }
    if (actionType === 'reject' && reason) {
      updateData.rejectionReason = reason
    }

    await api.put(`/enrollments/${enrollmentId}`, updateData)
    toast.success(actionType === 'approve' ? txt.approveSuccess : txt.rejectSuccess)
    fetchEnrollments()
  }

  if (loading && enrollments.length === 0) {
    return <div className="enrollments-page"><Loading /></div>
  }

  return (
    <div className="enrollments-page">
      {/* Header */}
      <div className="enrollments-header">
        <div className="header-left">
          <div className="page-icon"><EnrollmentIcon /></div>
          <h1>{txt.pageTitle}</h1>
        </div>
      </div>

      {/* Stats */}
      <div className="enrollments-stats">
        <div className="stat-card stat-total">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>{txt.totalApplications}</p>
          </div>
        </div>
        <div className="stat-card stat-pending">
          <div className="stat-icon"><ClockIcon /></div>
          <div className="stat-info">
            <h3>{stats.pending}</h3>
            <p>{txt.pending}</p>
          </div>
        </div>
        <div className="stat-card stat-accepted">
          <div className="stat-icon"><CheckIcon /></div>
          <div className="stat-info">
            <h3>{stats.accepted}</h3>
            <p>{txt.accepted}</p>
          </div>
        </div>
        <div className="stat-card stat-rejected">
          <div className="stat-icon"><XIcon /></div>
          <div className="stat-info">
            <h3>{stats.rejected}</h3>
            <p>{txt.rejected}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="enrollments-filters">
        {FILTERS.map(f => (
          <button
            key={f.id}
            className={`filter-tab ${filter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label[language]}
            {f.id === 'all' && ` (${stats.total})`}
            {f.id === 'pending' && stats.pending > 0 && (
              <span className="badge">{stats.pending}</span>
            )}
          </button>
        ))}
      </div>

      {/* Enrollments Grid */}
      {filteredEnrollments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>{txt.emptyList}</h3>
          <p>{txt.emptyDesc}</p>
        </div>
      ) : (
        <div className="enrollments-grid">
          {filteredEnrollments.map((enrollment, idx) => (
            <motion.div
              key={enrollment.id || enrollment._id}
              className={`enrollment-card status-${enrollment.status}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="card-header">
                <div 
                  className="child-avatar"
                  style={{ background: getAvatarColor(idx) }}
                >
                  {enrollment.childName?.charAt(0)}
                </div>
                <div className="child-info">
                  <h3>{enrollment.childName}</h3>
                  <span className="child-age">
                    {calculateAge(enrollment.birthDate)} {txt.years}
                  </span>
                </div>
                <span className={`status-badge status-${enrollment.status}`}>
                  {txt[enrollment.status]}
                </span>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <UserIcon />
                  <span className="label">{txt.parent}:</span>
                  <span className="value">{enrollment.parentName}</span>
                </div>
                <div className="info-row">
                  <PhoneIcon />
                  <span className="label">{txt.phone}:</span>
                  <span className="value">{enrollment.parentPhone}</span>
                </div>
                <div className="info-row">
                  <CalendarIcon />
                  <span className="label">{txt.submittedAt}:</span>
                  <span className="value">{formatDate(enrollment.submittedAt)}</span>
                </div>
                <div className="info-row">
                  <span className="label">{txt.contract}:</span>
                  <span className={`contract-badge ${enrollment.contractAccepted ? 'accepted' : ''}`}>
                    {enrollment.contractAccepted ? '✓ ' + txt.contractAccepted : '✗ ' + txt.contractNotAccepted}
                  </span>
                </div>
              </div>

              <div className="card-footer">
                <button 
                  className="btn-view"
                  onClick={() => setDetailModal({ open: true, enrollment })}
                >
                  <EyeIcon /> {txt.view}
                </button>
                {enrollment.status === 'pending' && (
                  <>
                    <button 
                      className="btn-approve"
                      onClick={() => setActionModal({ open: true, enrollment, type: 'approve' })}
                    >
                      <CheckIcon />
                    </button>
                    <button 
                      className="btn-reject"
                      onClick={() => setActionModal({ open: true, enrollment, type: 'reject' })}
                    >
                      <XIcon />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <DetailModal
        isOpen={detailModal.open}
        onClose={() => setDetailModal({ open: false, enrollment: null })}
        enrollment={detailModal.enrollment}
        language={language}
        onApprove={(e) => setActionModal({ open: true, enrollment: e, type: 'approve' })}
        onReject={(e) => setActionModal({ open: true, enrollment: e, type: 'reject' })}
      />

      {/* Action Modal */}
      <ActionModal
        isOpen={actionModal.open}
        onClose={() => setActionModal({ open: false, enrollment: null, type: '' })}
        enrollment={actionModal.enrollment}
        actionType={actionModal.type}
        onConfirm={handleAction}
        language={language}
      />
    </div>
  )
}

export default EnrollmentsPage
