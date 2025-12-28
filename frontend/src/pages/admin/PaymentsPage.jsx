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
    error: 'Xatolik yuz berdi'
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
    error: 'Произошла ошибка'
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
    error: 'An error occurred'
  }
}

// Filter tabs
const FILTERS = [
  { id: 'all', label: { uz: 'Barchasi', ru: 'Все', en: 'All' } },
  { id: 'completed', label: { uz: 'To\'langan', ru: 'Оплачено', en: 'Paid' } },
  { id: 'pending', label: { uz: 'Kutilmoqda', ru: 'Ожидание', en: 'Pending' } },
  { id: 'failed', label: { uz: 'Bekor qilingan', ru: 'Отменено', en: 'Failed' } }
]

// Main Component
function PaymentsPage() {
  const { language } = useLanguage()
  const toast = useToast()
  const txt = TEXTS[language]
  
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState([])
  const [stats, setStats] = useState(null)
  const [paymentConfig, setPaymentConfig] = useState(null)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [paymentsRes, statsRes, configRes] = await Promise.all([
        api.get('/payments'),
        api.get('/payments/stats'),
        api.get('/payments/config')
      ])
      
      const paymentsData = paymentsRes.data?.data || (Array.isArray(paymentsRes.data) ? paymentsRes.data : [])
      const statsData = statsRes.data?.data || statsRes.data || {}
      const configData = configRes.data?.data || configRes.data || {}
      
      setPayments(paymentsData)
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
    let result = payments
    
    if (filter !== 'all') {
      result = result.filter(p => p.status === filter)
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(p => 
        p.childName?.toLowerCase().includes(query) ||
        p.id?.toString().includes(query)
      )
    }
    
    return result
  }, [payments, filter, searchQuery])

  const getStatusBadge = (status) => {
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
      {stats && (
        <div className="payments-stats">
          <div className="stat-card stat-total">
            <div className="stat-icon"><MoneyIcon /></div>
            <div className="stat-info">
              <h3>{formatAmount(stats.totalRevenue || 0)}</h3>
              <p>{txt.totalRevenue}</p>
            </div>
          </div>
          <div className="stat-card stat-pending">
            <div className="stat-icon"><ClockIcon /></div>
            <div className="stat-info">
              <h3>{formatAmount(stats.pendingAmount || 0)}</h3>
              <p>{txt.pendingAmount}</p>
            </div>
          </div>
          <div className="stat-card stat-completed">
            <div className="stat-icon"><CheckIcon /></div>
            <div className="stat-info">
              <h3>{stats.completedCount || 0}</h3>
              <p>{txt.completedCount}</p>
            </div>
          </div>
          <div className="stat-card stat-failed">
            <div className="stat-icon"><XIcon /></div>
            <div className="stat-info">
              <h3>{stats.failedCount || 0}</h3>
              <p>{txt.failedCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="payments-filters">
        <div className="filter-tabs">
          {FILTERS.map(f => (
            <button
              key={f.id}
              className={`filter-tab ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label[language]}
              {f.id === 'all' && ` (${payments.length})`}
            </button>
          ))}
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
                const badge = getStatusBadge(payment.status)
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
                      <span className={`status-badge ${badge.class}`}>
                        {badge.text}
                      </span>
                    </td>
                    <td>{formatDate(payment.createdAt)}</td>
                    <td className="actions-cell">
                      <button className="action-btn view" title={txt.view}>
                        <EyeIcon />
                      </button>
                      {payment.status === 'pending' && (
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
    </div>
  )
}

export default PaymentsPage
