import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import TeacherDashboard from './TeacherDashboard'
import api from '../../services/api'
import { adminTranslations } from '../../i18n/admin'
import './DashboardPage.css'

/* ============================================
   REUSABLE COMPONENTS
   ============================================ */

// Summary Card Component
function SummaryCard({ icon, title, value, description, buttonText, onButtonClick, variant }) {
  return (
    <motion.div 
      className={`summary-card summary-card--${variant}`}
      whileHover={{ translateY: -2 }}
    >
      <div className="summary-card__icon-box">
        <span className="summary-card__icon">{icon}</span>
      </div>
      <div className="summary-card__content">
        <p className="summary-card__title">{title}</p>
        <p className="summary-card__value">{value}</p>
        <p className="summary-card__desc">{description}</p>
      </div>
      <button className="summary-card__btn" onClick={onButtonClick}>
        {buttonText}
      </button>
    </motion.div>
  )
}

// Alert Card Component  
function AlertCard({ name, reason, days, onMessage, onProfile }) {
  return (
    <div className="alert-card">
      <div className="alert-card__left">
        <p className="alert-card__name">{name}</p>
        <p className="alert-card__meta">{reason} · {days} kun</p>
      </div>
      <div className="alert-card__right">
        <button className="alert-card__btn alert-card__btn--secondary" onClick={onMessage}>
          Xabar yuborish
        </button>
        <button className="alert-card__btn alert-card__btn--primary" onClick={onProfile}>
          Profilni ochish
        </button>
      </div>
    </div>
  )
}



/* ============================================
   MAIN DASHBOARD COMPONENT
   ============================================ */

function DashboardPage() {
  const { user, logout } = useAuth()
  const { language } = useLanguage()
  const navigate = useNavigate()
  
  // i18n helper
  const t = (section, key) => adminTranslations[section]?.[language]?.[key] || adminTranslations[section]?.en?.[key] || key
  
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalChildren: 0,
    presentToday: 0,
    absentToday: 0,
    pendingEnrollments: 0,
    totalDebt: 0,
    debtorCount: 0
  })
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    try {
      setLoading(true)
      
      const [childrenRes, attendanceRes, enrollmentsRes, debtsRes] = await Promise.all([
        api.get('/children'),
        api.get('/attendance'),
        api.get('/enrollments'),
        api.get('/debts')
      ])

      const children = childrenRes.data?.data || childrenRes.data || []
      const attendance = attendanceRes.data?.data || attendanceRes.data || []
      const enrollments = enrollmentsRes.data?.data || enrollmentsRes.data || []
      const debts = debtsRes.data?.data || debtsRes.data || []

      const today = new Date().toISOString().split('T')[0]
      const activeChildren = children.filter(c => c.isActive)
      const todayAtt = attendance.filter(a => a.date === today)
      const presentCount = todayAtt.filter(a => a.status === 'present').length
      const absentCount = activeChildren.length - presentCount
      const pendingCount = enrollments.filter(e => e.status === 'pending').length
      const pendingDebts = debts.filter(d => d.status === 'pending')
      const totalDebtAmount = pendingDebts.reduce((sum, d) => sum + (d.amount || 0), 0)

      // Build alerts
      const alertList = []
      
      // Absent children (3+ days)
      activeChildren.forEach(child => {
        const childAtt = attendance.filter(a => a.childId === child.id && a.status === 'present')
        if (childAtt.length > 0) {
          const lastDate = childAtt.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date
          const daysDiff = Math.floor((Date.now() - new Date(lastDate)) / 86400000)
          if (daysDiff >= 3) {
            alertList.push({
              id: `absent-${child.id}`,
              childId: child.id,
              name: `${child.firstName} ${child.lastName}`,
              reason: 'Davomatga kelmayapti',
              days: daysDiff,
              phone: child.parentPhone
            })
          }
        }
      })

      // Debtors
      pendingDebts.slice(0, 5).forEach(debt => {
        const child = children.find(c => c.id === debt.childId)
        if (child) {
          alertList.push({
            id: `debt-${debt.id}`,
            childId: child.id,
            name: `${child.firstName} ${child.lastName}`,
            reason: `Qarzdor: ${(debt.amount / 1000000).toFixed(1)}M so'm`,
            days: Math.floor((Date.now() - new Date(debt.createdAt)) / 86400000),
            phone: child.parentPhone
          })
        }
      })

      setStats({
        totalChildren: activeChildren.length,
        presentToday: presentCount,
        absentToday: absentCount,
        pendingEnrollments: pendingCount,
        totalDebt: totalDebtAmount,
        debtorCount: pendingDebts.length
      })
      
      setAlerts(alertList.slice(0, 6))
    } catch (error) {
      console.error('Dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Teacher view
  if (user?.role === 'teacher') {
    return <TeacherDashboard />
  }

  // Attendance percentage
  const attendancePercent = stats.totalChildren > 0 
    ? Math.round((stats.presentToday / stats.totalChildren) * 100) 
    : 0

  // Loading state
  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="dashboard-loading__spinner" />
          <p>{t('common', 'loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        
        {/* HEADER */}
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-header__title">{t('dashboard', 'title')}</h1>
            <p className="dashboard-header__date">
              {new Date().toLocaleDateString(language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en-US', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
          <div className="dashboard-header__actions">
            <span className="dashboard-header__user">{user?.username}</span>
            <button className="dashboard-header__logout" onClick={logout}>
              {t('common', 'logout')}
            </button>
          </div>
        </header>

        {/* SECTION 1: SUMMARY CARDS */}
        <section className="dashboard-section">
          <h2 className="dashboard-section__title">{t('dashboard', 'overview')}</h2>
          <div className="summary-grid">
            <SummaryCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>}
              title={t('dashboard', 'totalChildren')}
              value={stats.totalChildren}
              description={t('children', 'active')}
              buttonText={t('dashboard', 'viewAll')}
              onButtonClick={() => navigate('/admin/children')}
              variant="blue"
            />
            <SummaryCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>}
              title={t('attendance', 'present')}
              value={stats.presentToday}
              description={`${attendancePercent}% ${t('dashboard', 'attendanceRate')}`}
              buttonText={t('dashboard', 'viewAll')}
              onButtonClick={() => navigate('/admin/attendance')}
              variant="green"
            />
            <SummaryCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
              title={t('attendance', 'absent')}
              value={stats.absentToday}
              description={t('dashboard', 'alerts')}
              buttonText={t('common', 'view')}
              onButtonClick={() => navigate('/admin/attendance')}
              variant="red"
            />
            <SummaryCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}
              title={t('dashboard', 'pendingEnrollments')}
              value={stats.pendingEnrollments}
              description={t('enrollments', 'pendingEnrollments')}
              buttonText={t('dashboard', 'viewAll')}
              onButtonClick={() => navigate('/admin/enrollments')}
              variant="orange"
            />
          </div>
        </section>

        {/* SECTION 2: ATTENTION REQUIRED */}
        <section className="dashboard-section">
          <h2 className="dashboard-section__title">{t('dashboard', 'alerts')}</h2>
          <div className="attention-container">
            <div className="attention-box">
              <div className="attention-box__header">
                <span className="attention-box__label">{t('dashboard', 'alerts')}</span>
                <span className="attention-box__count">{alerts.length}</span>
              </div>
              <div className="attention-box__content">
                {alerts.length === 0 ? (
                  <div className="attention-box__empty">
                    <p>{t('dashboard', 'noAlerts')}</p>
                  </div>
                ) : (
                  alerts.map(alert => (
                    <AlertCard
                      key={alert.id}
                      name={alert.name}
                      reason={alert.reason}
                      days={alert.days}
                      onMessage={() => {
                        if (alert.phone) window.open(`tel:${alert.phone}`)
                      }}
                      onProfile={() => navigate(`/admin/children/${alert.childId}`)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* VISUAL FEEDBACK: Progress Bar */}
            <div className="stats-box">
              <div className="stats-box__header">
                <span className="stats-box__label">{t('dashboard', 'todayAttendance')}</span>
              </div>
              <div className="stats-box__content">
                <div className="progress-visual">
                  <div className="progress-visual__bar">
                    <div 
                      className="progress-visual__fill" 
                      style={{ width: `${attendancePercent}%` }}
                    />
                  </div>
                  <div className="progress-visual__label">
                    <span>{attendancePercent}%</span>
                    <span>{stats.presentToday} / {stats.totalChildren}</span>
                  </div>
                </div>
                <div className="stats-box__grid">
                  <div className="stats-box__item stats-box__item--green">
                    <span className="stats-box__item-value">{stats.presentToday}</span>
                    <span className="stats-box__item-label">{t('attendance', 'present')}</span>
                  </div>
                  <div className="stats-box__item stats-box__item--red">
                    <span className="stats-box__item-value">{stats.absentToday}</span>
                    <span className="stats-box__item-label">{t('attendance', 'absent')}</span>
                  </div>
                </div>
                <div className="stats-box__debt">
                  <span className="stats-box__debt-label">{t('dashboard', 'totalDebts')}:</span>
                  <span className="stats-box__debt-value">
                    {(stats.totalDebt / 1000000).toFixed(1)}M so'm
                  </span>
                  <span className="stats-box__debt-count">
                    ({stats.debtorCount} {t('debts', 'debtorsList')})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}

export default DashboardPage
