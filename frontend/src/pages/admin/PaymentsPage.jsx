import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../components/common/Toast'
import { Loading } from '../../components/common'
import api from '../../services/api'
import './PaymentsPage.css'

// Icons
const PaymentIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
    <line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
)

const MoneyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
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

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
)

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
)

// Texts
const TEXTS = {
  uz: {
    pageTitle: 'To\'lovlar',
    totalRevenue: 'Jami daromad',
    pendingAmount: 'Kutilayotgan',
    completedCount: 'Bajarilgan',
    failedCount: 'Bekor qilingan',
    all: 'Barchasi',
    completed: 'To\'langan',
    pending: 'Kutilmoqda',
    failed: 'Bekor qilingan',
    search: 'Qidirish...',
    id: 'ID',
    child: 'Bola',
    amount: 'Summa',
    provider: 'Provayder',
    status: 'Holat',
    date: 'Sana',
    actions: 'Amallar',
    currency: 'so\'m',
    noPayments: 'To\'lovlar mavjud emas',
    noPaymentsDesc: 'Hozircha to\'lovlar yo\'q',
    view: 'Ko\'rish',
    simulate: 'Simulyatsiya',
    simulateSuccess: 'To\'lov simulyatsiya qilindi!',
    copied: 'Nusxalandi!',
    testMode: 'Test rejimi',
    liveMode: 'Jonli rejim',
    cardNumber: 'Karta raqami',
    cardHolder: 'Karta egasi',
    copy: 'Nusxalash',
    monthlyFee: 'Oylik to\'lov',
    active: 'Faol',
    disabled: 'O\'chirilgan',
    error: 'Xatolik yuz berdi',
    paymentDetails: 'To\'lov tafsilotlari',
    close: 'Yopish',
    transactionId: 'Tranzaksiya ID',
    paymentMethod: 'To\'lov usuli',
    description: 'Tavsif',
    createdAt: 'Yaratilgan',
    updatedAt: 'Yangilangan'
  },
  ru: {
    pageTitle: 'Платежи',
    totalRevenue: 'Общий доход',
    pendingAmount: 'Ожидается',
    completedCount: 'Выполнено',
    failedCount: 'Отменено',
    all: 'Все',
    completed: 'Оплачено',
    pending: 'Ожидание',
    failed: 'Отменено',
    search: 'Поиск...',
    id: 'ID',
    child: 'Ребенок',
    amount: 'Сумма',
    provider: 'Провайдер',
    status: 'Статус',
    date: 'Дата',
    actions: 'Действия',
    currency: 'сум',
    noPayments: 'Нет платежей',
    noPaymentsDesc: 'Пока нет платежей',
    view: 'Просмотр',
    simulate: 'Симуляция',
    simulateSuccess: 'Платеж симулирован!',
    copied: 'Скопировано!',
    testMode: 'Тестовый режим',
    liveMode: 'Рабочий режим',
    cardNumber: 'Номер карты',
    cardHolder: 'Владелец карты',
    copy: 'Копировать',
    monthlyFee: 'Ежемесячная плата',
    active: 'Активен',
    disabled: 'Отключен',
    error: 'Произошла ошибка',
    paymentDetails: 'Детали платежа',
    close: 'Закрыть',
    transactionId: 'ID транзакции',
    paymentMethod: 'Способ оплаты',
    description: 'Описание',
    createdAt: 'Создано',
    updatedAt: 'Обновлено'
  },
  en: {
    pageTitle: 'Payments',
    totalRevenue: 'Total Revenue',
    pendingAmount: 'Pending',
    completedCount: 'Completed',
    failedCount: 'Failed',
    all: 'All',
    completed: 'Paid',
    pending: 'Pending',
    failed: 'Failed',
    search: 'Search...',
    id: 'ID',
    child: 'Child',
    amount: 'Amount',
    provider: 'Provider',
    status: 'Status',
    date: 'Date',
    actions: 'Actions',
    currency: 'UZS',
    noPayments: 'No payments',
    noPaymentsDesc: 'No payments yet',
    view: 'View',
    simulate: 'Simulate',
    simulateSuccess: 'Payment simulated!',
    copied: 'Copied!',
    testMode: 'Test Mode',
    liveMode: 'Live Mode',
    cardNumber: 'Card Number',
    cardHolder: 'Card Holder',
    copy: 'Copy',
    monthlyFee: 'Monthly Fee',
    active: 'Active',
    disabled: 'Disabled',
    error: 'An error occurred',
    paymentDetails: 'Payment Details',
    close: 'Close',
    transactionId: 'Transaction ID',
    paymentMethod: 'Payment Method',
    description: 'Description',
    createdAt: 'Created At',
    updatedAt: 'Updated At'
  }
}

// Filter tabs
const FILTERS = [
  { id: 'all', label: { uz: 'Barchasi', ru: 'Все', en: 'All' } },
  { id: 'pending', label: { uz: 'Kutilmoqda', ru: 'Ожидание', en: 'Pending' } },
  { id: 'completed', label: { uz: 'To\'langan', ru: 'Оплачено', en: 'Paid' } },
  { id: 'overdue', label: { uz: 'Muddati o\'tgan', ru: 'Просрочено', en: 'Overdue' } }
]

// Main Component
function PaymentsPage() {
  const { language } = useLanguage()
  const toast = useToast()
  const txt = TEXTS[language]
  
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState([])
  const [debts, setDebts] = useState([])
  const [stats, setStats] = useState(null)
  const [paymentConfig, setPaymentConfig] = useState(null)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPayment, setSelectedPayment] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [paymentsRes, debtsRes, statsRes, configRes] = await Promise.all([
        api.get('/payments'),
        api.get('/debts'),
        api.get('/payments/stats'),
        api.get('/payments/config')
      ])
      
      const paymentsData = paymentsRes.data?.data || (Array.isArray(paymentsRes.data) ? paymentsRes.data : [])
      const debtsData = debtsRes.data?.data || (Array.isArray(debtsRes.data) ? debtsRes.data : [])
      const statsData = statsRes.data?.data || statsRes.data || {}
      const configData = configRes.data?.data || configRes.data || {}
      
      setPayments(paymentsData)
      setDebts(debtsData)
      setStats(statsData)
      setPaymentConfig(configData)
    } catch (err) {
      console.error('Failed to fetch payments:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const formatAmount = useCallback((amount) => {
    if (!amount) return '0 ' + txt.currency
    const locale = language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en-US'
    return new Intl.NumberFormat(locale).format(amount) + ' ' + txt.currency
  }, [language, txt.currency])

  const formatDate = useCallback((dateStr) => {
    if (!dateStr) return '-'
    const locale = language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en-US'
    return new Date(dateStr).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [language])

  const simulatePayment = async (paymentId) => {
    try {
      await api.post(`/payments/simulate/${paymentId}`)
      toast.success(txt.simulateSuccess)
      fetchData()
    } catch (err) {
      toast.error(txt.error)
    }
  }

  const copyCardNumber = () => {
    navigator.clipboard.writeText('8600123456789012')
    toast.success(txt.copied)
  }

  const filteredPayments = useMemo(() => {
    // Debts'ni payment formatiga o'tkazish
    const pendingDebts = debts
      .filter(d => d.status === 'pending' || d.status === 'partial')
      .map(d => ({
        id: d.id,
        childId: d.childId,
        childName: d.childName || `Bola #${d.childId}`,
        amount: d.amount - (d.paidAmount || 0),
        originalAmount: d.amount,
        paidAmount: d.paidAmount || 0,
        status: 'pending',
        provider: '-',
        month: d.month,
        dueDate: d.dueDate,
        createdAt: d.createdAt,
        isDebt: true,
        isOverdue: new Date(d.dueDate) < new Date()
      }))
    
    // Muddati o'tgan debts
    const overdueDebts = pendingDebts.filter(d => d.isOverdue)
    
    let result = []
    
    if (filter === 'all') {
      // Barcha to'lovlar + kutilayotgan qarzdorliklar
      result = [...payments, ...pendingDebts]
    } else if (filter === 'completed') {
      result = payments.filter(p => p.status === 'completed')
    } else if (filter === 'pending') {
      // Faqat kutilayotgan (muddati o'tmagan)
      result = pendingDebts.filter(d => !d.isOverdue)
    } else if (filter === 'overdue') {
      // Muddati o'tgan
      result = overdueDebts
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(p => 
        p.childName?.toLowerCase().includes(query) ||
        p.id?.toString().includes(query)
      )
    }
    
    // Sanasi bo'yicha tartiblash
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    return result
  }, [payments, debts, filter, searchQuery])

  const getStatusBadge = (status, isOverdue) => {
    if (isOverdue) {
      return { class: 'status-overdue', text: language === 'uz' ? 'Muddati o\'tgan' : language === 'ru' ? 'Просрочено' : 'Overdue' }
    }
    const badges = {
      completed: { class: 'status-completed', text: txt.completed },
      pending: { class: 'status-pending', text: txt.pending },
      failed: { class: 'status-failed', text: txt.failed }
    }
    return badges[status] || { class: '', text: status }
  }

  if (loading) {
    return (
      <div className="payments-page">
        <Loading />
      </div>
    )
  }

  return (
    <div className="payments-page">
      {/* Header */}
      <div className="payments-header">
        <div className="header-left">
          <div className="page-icon"><PaymentIcon /></div>
          <h1>{txt.pageTitle}</h1>
        </div>
      </div>

      {/* Stats */}
      <div className="payments-stats">
        <div className="stat-card stat-total">
          <div className="stat-icon"><MoneyIcon /></div>
          <div className="stat-info">
            <h3>{formatAmount(stats?.totalRevenue || payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0))}</h3>
            <p>{txt.totalRevenue}</p>
          </div>
        </div>
        <div className="stat-card stat-pending">
          <div className="stat-icon"><ClockIcon /></div>
          <div className="stat-info">
            <h3>{formatAmount(debts.filter(d => d.status === 'pending' || d.status === 'partial').reduce((sum, d) => sum + (d.amount - (d.paidAmount || 0)), 0))}</h3>
            <p>{txt.pendingAmount}</p>
          </div>
        </div>
        <div className="stat-card stat-completed">
          <div className="stat-icon"><CheckIcon /></div>
          <div className="stat-info">
            <h3>{payments.filter(p => p.status === 'completed').length}</h3>
            <p>{txt.completedCount}</p>
          </div>
        </div>
        <div className="stat-card stat-failed">
          <div className="stat-icon"><XIcon /></div>
          <div className="stat-info">
            <h3>{debts.filter(d => (d.status === 'pending' || d.status === 'partial') && new Date(d.dueDate) < new Date()).length}</h3>
            <p>{language === 'uz' ? 'Muddati o\'tgan' : language === 'ru' ? 'Просрочено' : 'Overdue'}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="payments-filters">
        <div className="filter-tabs">
          {FILTERS.map(f => {
            // Har bir tab uchun count hisoblash
            let count = 0
            const pendingDebts = debts.filter(d => d.status === 'pending' || d.status === 'partial')
            const overdueDebts = pendingDebts.filter(d => new Date(d.dueDate) < new Date())
            const nonOverdueDebts = pendingDebts.filter(d => new Date(d.dueDate) >= new Date())
            
            if (f.id === 'all') count = payments.length + pendingDebts.length
            else if (f.id === 'completed') count = payments.filter(p => p.status === 'completed').length
            else if (f.id === 'pending') count = nonOverdueDebts.length
            else if (f.id === 'overdue') count = overdueDebts.length
            
            return (
              <button
                key={f.id}
                className={`filter-tab ${filter === f.id ? 'active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label[language]} ({count})
              </button>
            )
          })}
        </div>
        <div className="search-box">
          <SearchIcon />
          <input
            type="text"
            placeholder={txt.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="payments-table-wrapper">
        {filteredPayments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><PaymentIcon /></div>
            <h3>{txt.noPayments}</h3>
            <p>{txt.noPaymentsDesc}</p>
          </div>
        ) : (
          <table className="payments-table">
            <thead>
              <tr>
                <th>{txt.id}</th>
                <th>{txt.child}</th>
                <th>{txt.amount}</th>
                <th>{txt.provider}</th>
                <th>{txt.status}</th>
                <th>{txt.date}</th>
                <th>{txt.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment, idx) => {
                return (
                  <motion.tr
                    key={payment.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <td className="payment-id">#{payment.id}</td>
                    <td>
                      <div className="child-cell">
                        <div className="child-avatar">
                          {payment.childName?.charAt(0) || '?'}
                        </div>
                        <span>{payment.childName || '-'}</span>
                      </div>
                    </td>
                    <td className="amount">{formatAmount(payment.amount)}</td>
                    <td>
                      <span className={`provider-badge ${payment.provider}`}>
                        {payment.provider || '-'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadge(payment.status, payment.isOverdue).class}`}>
                        {getStatusBadge(payment.status, payment.isOverdue).text}
                      </span>
                    </td>
                    <td>{formatDate(payment.createdAt)}</td>
                    <td className="actions-cell">
                      <button 
                        className="action-btn view" 
                        title={txt.view}
                        onClick={() => setSelectedPayment(payment)}
                      >
                        <EyeIcon />
                      </button>
                      {payment.status === 'pending' && !payment.isDebt && (
                        <button 
                          className="action-btn simulate"
                          onClick={() => simulatePayment(payment.id)}
                          title={txt.simulate}
                        >
                          <CheckIcon />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Payment Config Card */}
      {paymentConfig && (
        <div className="payment-config-card">
          <div className={`config-header ${paymentConfig.testMode ? 'test' : 'live'}`}>
            <div className="config-icon">
              {paymentConfig.testMode ? '🧪' : '✅'}
            </div>
            <div className="config-title">
              <h3>{paymentConfig.testMode ? txt.testMode : txt.liveMode}</h3>
            </div>
          </div>
          <div className="config-body">
            {paymentConfig.testMode ? (
              <>
                <div className="config-row">
                  <span className="config-label">{txt.cardNumber}:</span>
                  <span className="config-value">8600 1234 5678 9012</span>
                </div>
                <div className="config-row">
                  <span className="config-label">{txt.cardHolder}:</span>
                  <span className="config-value">PLAY KIDS BOGCHA</span>
                </div>
                <button className="copy-btn" onClick={copyCardNumber}>
                  <CopyIcon /> {txt.copy}
                </button>
              </>
            ) : (
              <>
                <div className="config-row">
                  <span className="config-label">Payme:</span>
                  <span className={`config-status ${paymentConfig.payme?.enabled ? 'active' : ''}`}>
                    {paymentConfig.payme?.enabled ? txt.active : txt.disabled}
                  </span>
                </div>
                <div className="config-row">
                  <span className="config-label">Click:</span>
                  <span className={`config-status ${paymentConfig.click?.enabled ? 'active' : ''}`}>
                    {paymentConfig.click?.enabled ? txt.active : txt.disabled}
                  </span>
                </div>
                <div className="config-row">
                  <span className="config-label">{txt.monthlyFee}:</span>
                  <span className="config-value">{formatAmount(paymentConfig.monthlyFee)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      <AnimatePresence>
        {selectedPayment && (
          <motion.div 
            className="payment-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPayment(null)}
          >
            <motion.div 
              className="payment-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="payment-modal-header">
                <h2>{txt.paymentDetails}</h2>
                <button className="modal-close-btn" onClick={() => setSelectedPayment(null)}>
                  <XIcon />
                </button>
              </div>
              <div className="payment-modal-body">
                <div className="payment-detail-row">
                  <span className="detail-label">{txt.id}:</span>
                  <span className="detail-value">#{selectedPayment.id}</span>
                </div>
                <div className="payment-detail-row">
                  <span className="detail-label">{txt.child}:</span>
                  <span className="detail-value">{selectedPayment.childName || '-'}</span>
                </div>
                <div className="payment-detail-row">
                  <span className="detail-label">{txt.amount}:</span>
                  <span className="detail-value amount-highlight">{formatAmount(selectedPayment.amount)}</span>
                </div>
                <div className="payment-detail-row">
                  <span className="detail-label">{txt.provider}:</span>
                  <span className={`provider-badge ${selectedPayment.provider}`}>
                    {selectedPayment.provider || '-'}
                  </span>
                </div>
                <div className="payment-detail-row">
                  <span className="detail-label">{txt.status}:</span>
                  <span className={`status-badge ${getStatusBadge(selectedPayment.status, selectedPayment.isOverdue).class}`}>
                    {getStatusBadge(selectedPayment.status, selectedPayment.isOverdue).text}
                  </span>
                </div>
                {selectedPayment.transactionId && (
                  <div className="payment-detail-row">
                    <span className="detail-label">{txt.transactionId}:</span>
                    <span className="detail-value">{selectedPayment.transactionId}</span>
                  </div>
                )}
                {selectedPayment.description && (
                  <div className="payment-detail-row">
                    <span className="detail-label">{txt.description}:</span>
                    <span className="detail-value">{selectedPayment.description}</span>
                  </div>
                )}
                <div className="payment-detail-row">
                  <span className="detail-label">{txt.createdAt}:</span>
                  <span className="detail-value">{formatDate(selectedPayment.createdAt)}</span>
                </div>
                {selectedPayment.updatedAt && (
                  <div className="payment-detail-row">
                    <span className="detail-label">{txt.updatedAt}:</span>
                    <span className="detail-value">{formatDate(selectedPayment.updatedAt)}</span>
                  </div>
                )}
              </div>
              <div className="payment-modal-footer">
                <button className="modal-btn" onClick={() => setSelectedPayment(null)}>
                  {txt.close}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PaymentsPage
