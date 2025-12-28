import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { Loading } from '../../components/common'
import { useToast } from '../../components/common/Toast'
import api from '../../services/api'
import './DebtsPage.css'

// SVG Icons
const MoneyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
)

const CheckCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)

const ClockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)

const ChartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
)

const CreditCardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
    <line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
)

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const MegaphoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11l18-5v12L3 13v-2z"/>
    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
  </svg>
)

const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
)

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

function DebtsPage() {
  const { logout } = useAuth()
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const toast = useToast()
  const [debts, setDebts] = useState([])
  const [stats, setStats] = useState(null)
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedGroup, setSelectedGroup] = useState('all')
  const [showPayModal, setShowPayModal] = useState(null)
  const [payAmount, setPayAmount] = useState('')

  const texts = {
    uz: {
      title: 'Qarzdorlik Monitoring',
      totalAmount: 'Jami summa',
      paidAmount: 'To\'langan',
      pendingAmount: 'Kutilmoqda',

      collectionRate: 'Yig\'ilish %',
      all: 'Barchasi',
      paid: 'To\'langan',
      pending: 'Kutilmoqda',
      partial: 'Qisman',
      overdue: 'Muddati o\'tgan',
      allGroups: 'Barcha guruhlar',
      child: 'Bola',
      group: 'Guruh',
      amount: 'Summa',
      remaining: 'Qoldiq',
      daysOverdue: 'Kechikish',
      nextPayment: 'Keyingi to\'lov',
      days: 'kun',
      daysLeft: 'kun qoldi',
      status: 'Holat',
      actions: 'Amallar',
      pay: 'To\'lov',
      remind: 'Eslatma',
      remindAll: 'Barchaga',
      generateMonth: 'Yangi oy',
      noDebts: 'Qarzdorlik yo\'q',
      paymentAmount: 'To\'lov summasi',

      monthlyFee: 'Oylik to\'lov'
    },
    ru: {
      title: 'Мониторинг задолженности',
      totalAmount: 'Общая сумма',
      paidAmount: 'Оплачено',
      pendingAmount: 'Ожидается',

      collectionRate: 'Сбор %',
      all: 'Все',
      paid: 'Оплачено',
      pending: 'Ожидает',
      partial: 'Частично',
      overdue: 'Просрочено',
      allGroups: 'Все группы',
      child: 'Ребенок',
      group: 'Группа',
      amount: 'Сумма',
      remaining: 'Остаток',
      daysOverdue: 'Просрочка',
      nextPayment: 'Следующий платеж',
      days: 'дней',
      daysLeft: 'дней осталось',
      status: 'Статус',
      actions: 'Действия',
      pay: 'Оплата',
      remind: 'Напомнить',
      remindAll: 'Всем',
      generateMonth: 'Новый месяц',
      noDebts: 'Нет задолженностей',
      paymentAmount: 'Сумма оплаты',

      monthlyFee: 'Ежемесячная оплата'
    },
    en: {
      title: 'Debt Monitoring',
      totalAmount: 'Total Amount',
      paidAmount: 'Paid',
      pendingAmount: 'Pending',

      collectionRate: 'Collection %',
      all: 'All',
      paid: 'Paid',
      pending: 'Pending',
      partial: 'Partial',
      overdue: 'Overdue',
      allGroups: 'All groups',
      child: 'Child',
      group: 'Group',
      amount: 'Amount',
      remaining: 'Remaining',
      daysOverdue: 'Overdue',
      nextPayment: 'Next payment',
      days: 'days',
      daysLeft: 'days left',
      status: 'Status',
      actions: 'Actions',
      pay: 'Pay',
      remind: 'Remind',
      remindAll: 'All',
      generateMonth: 'New Month',
      noDebts: 'No debts',
      paymentAmount: 'Payment amount',

      monthlyFee: 'Monthly fee'
    }
  }

  const txt = texts[language]

  useEffect(() => {
    fetchData()
  }, [filter, selectedGroup])

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter !== 'all' && filter !== 'overdue') params.append('status', filter)
      if (selectedGroup !== 'all') params.append('groupId', selectedGroup)
      
      const [debtsRes, statsRes, groupsRes] = await Promise.all([
        api.get(`/debts?${params}`),
        api.get('/debts/stats'),
        api.get('/groups')
      ])
      
      const debtsData = debtsRes.data?.data || (Array.isArray(debtsRes.data) ? debtsRes.data : [])
      const statsData = statsRes.data?.data || statsRes.data || {}
      const groupsData = groupsRes.data?.data || (Array.isArray(groupsRes.data) ? groupsRes.data : [])
      
      let filteredDebts = debtsData
      if (filter === 'overdue') {
        filteredDebts = filteredDebts.filter(d => d.daysOverdue > 0 && d.status !== 'paid')
      }
      
      setDebts(filteredDebts)
      setStats(statsData)
      setGroups(groupsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePay = async () => {
    if (!showPayModal || !payAmount) return
    
    try {
      await api.post(`/debts/${showPayModal.id}/pay`, { amount: parseInt(payAmount) })
      fetchData()
      setShowPayModal(null)
      setPayAmount('')
      toast.success('To\'lov qabul qilindi!')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Xatolik')
    }
  }

  const handleRemind = async (debtId) => {
    try {
      await api.post(`/debts/${debtId}/remind`)
      toast.success('Eslatma yuborildi!')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Xatolik')
    }
  }

  const handleRemindAll = async () => {
    if (!window.confirm('Barcha qarzdorlarga eslatma yuborilsinmi?')) return
    
    try {
      const result = await api.post('/debts/remind-all')
      toast.success(`✅ ${result.data.sent} ta eslatma yuborildi`)
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Xatolik yuz berdi')
    }
  }

  const handleGenerateMonth = async () => {
    const month = prompt('Oy kiriting (masalan: 2025-01):')
    if (!month) return
    
    try {
      const result = await api.post('/debts/generate', { month, dueDate: `${month}-05` })
      toast.success(result.data.message)
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Xatolik')
    }
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m'
  }

  // Keyingi to'lovgacha qolgan kunlarni hisoblash
  const getDaysUntilNextPayment = (debt) => {
    if (debt.status !== 'paid') return null
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Hozirgi sanadan keyingi to'lov sanasini hisoblash
    // Har oyning 5-kuni to'lov kuni
    let nextDueDate
    
    // Agar bugun 5-kunidan oldin bo'lsa, shu oyning 5-kuni
    // Aks holda keyingi oyning 5-kuni
    if (today.getDate() < 5) {
      nextDueDate = new Date(today.getFullYear(), today.getMonth(), 5)
    } else {
      nextDueDate = new Date(today.getFullYear(), today.getMonth() + 1, 5)
    }
    
    nextDueDate.setHours(0, 0, 0, 0)
    
    const daysLeft = Math.ceil((nextDueDate - today) / (1000 * 60 * 60 * 24))
    
    return daysLeft
  }

  const getStatusClass = (debt) => {
    if (debt.status === 'paid') return 'status-paid'
    if (debt.daysOverdue > 0) return 'status-overdue'
    if (debt.status === 'partial') return 'status-partial'
    return 'status-pending'
  }

  if (loading) return <div className="debts-page"><Loading /></div>

  return (
    <div className="debts-page">
      <div className="debts-header">
        <div className="header-left">
          <button onClick={() => navigate('/admin/dashboard')}><BackIcon /> {t('back')}</button>
          <h1><MoneyIcon /> {txt.title}</h1>
        </div>
        <div className="header-right">
          <button className="send-btn" onClick={handleGenerateMonth}><CalendarIcon /> {txt.generateMonth}</button>
          <button onClick={handleRemindAll}><MegaphoneIcon /> {txt.remindAll}</button>
          <button onClick={logout}>{t('logout')}</button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="debts-stats">
          <div className="stat-card stat-total">
            <div className="stat-icon"><MoneyIcon /></div>
            <div>
              <h3>{formatAmount(stats.totalAmount)}</h3>
              <p>{txt.totalAmount}</p>
            </div>
          </div>
          <div className="stat-card stat-collected">
            <div className="stat-icon"><CheckCircleIcon /></div>
            <div>
              <h3>{formatAmount(stats.paidAmount)}</h3>
              <p>{txt.paidAmount}</p>
            </div>
          </div>
          <div className="stat-card stat-debtors">
            <div className="stat-icon"><ClockIcon /></div>
            <div>
              <h3>{formatAmount(stats.pendingAmount)}</h3>
              <p>{txt.pendingAmount}</p>
            </div>
          </div>
          <div className="stat-card stat-overdue">
            <div className="stat-icon"><ChartIcon /></div>
            <div>
              <h3>{stats.collectionRate}%</h3>
              <p>{txt.collectionRate}</p>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Fee Info */}
      <div className="monthly-fee-info">
        <span className="fee-label"><CreditCardIcon /> {txt.monthlyFee}:</span>
        <span className="fee-amount">500,000 so'm</span>
      </div>

      {/* Filters */}
      <div className="debts-filters">
        <div className="filter-tabs">
          {['all', 'pending', 'partial', 'paid', 'overdue'].map(f => (
            <button 
              key={f}
              className={`filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {txt[f]} {f === 'overdue' && stats ? `(${stats.overdueCount})` : ''}
            </button>
          ))}
        </div>
        <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
          <option value="all">{txt.allGroups}</option>
          {groups.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      {/* Debts Grid */}
      <div className="debts-grid">
        {debts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><CheckCircleIcon /></div>
            <h3>{txt.noDebts}</h3>
          </div>
        ) : (
          debts.map(debt => {
            const daysLeft = getDaysUntilNextPayment(debt)
            return (
              <div key={debt.id} className={`debt-card ${debt.daysOverdue > 0 && debt.status !== 'paid' ? 'overdue' : debt.status === 'partial' ? 'warning' : ''}`}>
                <div className="debt-card-header">
                  <div className="debt-child-info">
                    <div className="debt-avatar">{debt.childName?.charAt(0) || '?'}</div>
                    <div>
                      <span className="debt-child-name">{debt.childName}</span>
                      <span className="debt-group">{debt.groupName}</span>
                    </div>
                  </div>
                  <div className="debt-amount">
                    <span className="debt-amount-value">{formatAmount(debt.remainingAmount)}</span>
                    <span className="debt-amount-label">{txt.remaining}</span>
                  </div>
                </div>
                
                <div className="debt-card-body">
                  <div className="debt-info-row">
                    <span className="debt-info-label">{txt.amount}:</span>
                    <span className="debt-info-value">{formatAmount(debt.amount)}</span>
                  </div>
                  <div className="debt-info-row">
                    <span className="debt-info-label">{txt.status}:</span>
                    <span className={`status-badge ${debt.status}`}>{txt[debt.status]}</span>
                  </div>
                  {debt.daysOverdue > 0 && debt.status !== 'paid' && (
                    <div className="debt-info-row">
                      <span className="debt-info-label">{txt.daysOverdue}:</span>
                      <span className="debt-info-value overdue">{debt.daysOverdue} {txt.days}</span>
                    </div>
                  )}
                  {debt.status === 'paid' && daysLeft !== null && (
                    <div className="debt-info-row">
                      <span className="debt-info-label">{txt.nextPayment}:</span>
                      <span className={`debt-info-value ${daysLeft <= 7 ? 'overdue' : ''}`}>{daysLeft} {txt.daysLeft}</span>
                    </div>
                  )}
                </div>

                <div className="debt-card-footer">
                  {debt.status !== 'paid' && (
                    <>
                      <button className="btn-pay" onClick={() => setShowPayModal(debt)}>
                        <CreditCardIcon /> {txt.pay}
                      </button>
                      <button className="btn-remind" onClick={() => handleRemind(debt.id)}>
                        <BellIcon /> {txt.remind}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pay Modal */}
      {showPayModal && (
        <div className="modal-overlay" onClick={() => setShowPayModal(null)}>
          <div className="debt-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><CreditCardIcon /> {txt.pay}</h2>
              <button className="close-btn" onClick={() => setShowPayModal(null)}><CloseIcon /></button>
            </div>
            <div className="modal-body">
              <div className="payment-summary">
                <span className="child-name">{showPayModal.childName}</span>
                <span className="debt-total">{formatAmount(showPayModal.remainingAmount)}</span>
              </div>
              <div className="form-group">
                <label>{txt.paymentAmount}</label>
                <input 
                  type="number"
                  placeholder={txt.paymentAmount}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="quick-amounts">
                <button className="quick-amount" onClick={() => setPayAmount(showPayModal.remainingAmount.toString())}>
                  To'liq
                </button>
                <button className="quick-amount" onClick={() => setPayAmount(Math.round(showPayModal.remainingAmount / 2).toString())}>
                  50%
                </button>
                <button className="quick-amount" onClick={() => setPayAmount('100000')}>
                  100,000
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowPayModal(null)}>{t('cancel')}</button>
              <button className="save-btn" onClick={handlePay}>{t('save')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DebtsPage
