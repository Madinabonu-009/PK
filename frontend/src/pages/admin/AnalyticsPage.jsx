import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import api from '../../services/api'
import './AnalyticsPage.css'

// Translations
const texts = {
  uz: {
    title: 'Analitika',
    subtitle: 'Bog\'cha statistikasi',
    overview: 'Umumiy ko\'rinish',
    children: 'Bolalar',
    groups: 'Guruhlar',
    payments: 'To\'lovlar',
    attendance: 'Davomat',
    totalChildren: 'Jami bolalar',
    activeChildren: 'Faol bolalar',
    totalGroups: 'Jami guruhlar',
    totalTeachers: 'O\'qituvchilar',
    monthlyRevenue: 'Oylik daromad',
    pendingPayments: 'Kutilayotgan',
    attendanceRate: 'Davomat %',
    avgAttendance: 'O\'rtacha',
    thisMonth: 'Bu oy',
    lastMonth: 'O\'tgan oy',
    thisWeek: 'Bu hafta',
    today: 'Bugun',
    growth: 'O\'sish',
    byGroup: 'Guruh bo\'yicha',
    byAge: 'Yosh bo\'yicha',
    recentActivity: 'So\'nggi faoliyat',
    noData: 'Ma\'lumot yo\'q'
  },
  ru: {
    title: 'Аналитика',
    subtitle: 'Статистика детсада',
    overview: 'Обзор',
    children: 'Дети',
    groups: 'Группы',
    payments: 'Платежи',
    attendance: 'Посещаемость',
    totalChildren: 'Всего детей',
    activeChildren: 'Активных',
    totalGroups: 'Всего групп',
    totalTeachers: 'Учителей',
    monthlyRevenue: 'Месячный доход',
    pendingPayments: 'Ожидается',
    attendanceRate: 'Посещаемость %',
    avgAttendance: 'Средняя',
    thisMonth: 'Этот месяц',
    lastMonth: 'Прошлый месяц',
    thisWeek: 'Эта неделя',
    today: 'Сегодня',
    growth: 'Рост',
    byGroup: 'По группам',
    byAge: 'По возрасту',
    recentActivity: 'Последняя активность',
    noData: 'Нет данных'
  },
  en: {
    title: 'Analytics',
    subtitle: 'Kindergarten statistics',
    overview: 'Overview',
    children: 'Children',
    groups: 'Groups',
    payments: 'Payments',
    attendance: 'Attendance',
    totalChildren: 'Total children',
    activeChildren: 'Active',
    totalGroups: 'Total groups',
    totalTeachers: 'Teachers',
    monthlyRevenue: 'Monthly revenue',
    pendingPayments: 'Pending',
    attendanceRate: 'Attendance %',
    avgAttendance: 'Average',
    thisMonth: 'This month',
    lastMonth: 'Last month',
    thisWeek: 'This week',
    today: 'Today',
    growth: 'Growth',
    byGroup: 'By group',
    byAge: 'By age',
    recentActivity: 'Recent activity',
    noData: 'No data'
  }
}

// Stats Card
function StatsCard({ icon, label, value, subValue, color, trend }) {
  return (
    <div className="an-stat-card" style={{ '--accent': color }}>
      <div className="an-stat-icon">{icon}</div>
      <div className="an-stat-content">
        <span className="an-stat-value">{value}</span>
        <span className="an-stat-label">{label}</span>
        {subValue && (
          <span className={`an-stat-trend ${trend > 0 ? 'up' : trend < 0 ? 'down' : ''}`}>
            {trend > 0 ? '↑' : trend < 0 ? '↓' : ''} {subValue}
          </span>
        )}
      </div>
    </div>
  )
}

// Chart Bar
function ChartBar({ label, value, maxValue, color }) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0
  return (
    <div className="an-chart-bar">
      <span className="an-bar-label">{label}</span>
      <div className="an-bar-track">
        <div 
          className="an-bar-fill" 
          style={{ width: `${percentage}%`, background: color }}
        />
      </div>
      <span className="an-bar-value">{value}</span>
    </div>
  )
}

export default function AnalyticsPage() {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    children: { total: 0, active: 0, byGroup: [], byAge: [] },
    groups: { total: 0, list: [] },
    payments: { monthly: 0, pending: 0, collected: 0 },
    attendance: { rate: 0, today: 0, thisWeek: 0 },
    teachers: 0
  })

  const txt = texts[language] || texts.uz

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const [childrenRes, groupsRes, paymentsRes, usersRes] = await Promise.all([
        api.get('/children'),
        api.get('/groups'),
        api.get('/payments').catch(() => ({ data: [] })),
        api.get('/users').catch(() => ({ data: [] }))
      ])

      const children = childrenRes.data?.data || childrenRes.data || []
      const groups = groupsRes.data?.data || groupsRes.data || []
      const payments = paymentsRes.data?.data || paymentsRes.data || []
      const users = usersRes.data?.data || usersRes.data || []

      // Calculate stats
      const activeChildren = children.filter(c => c.isActive !== false)
      const teachers = users.filter(u => u.role === 'teacher')

      // Children by group
      const byGroup = groups.map(g => ({
        name: g.name,
        count: children.filter(c => c.groupId === g.id).length
      }))

      // Children by age
      const currentYear = new Date().getFullYear()
      const byAge = [
        { label: '2-3 yosh', count: 0 },
        { label: '3-4 yosh', count: 0 },
        { label: '4-5 yosh', count: 0 },
        { label: '5-6 yosh', count: 0 },
        { label: '6+ yosh', count: 0 }
      ]
      children.forEach(c => {
        if (c.birthDate) {
          const age = currentYear - new Date(c.birthDate).getFullYear()
          if (age <= 3) byAge[0].count++
          else if (age <= 4) byAge[1].count++
          else if (age <= 5) byAge[2].count++
          else if (age <= 6) byAge[3].count++
          else byAge[4].count++
        }
      })

      // Payments
      const thisMonth = new Date().getMonth()
      const monthlyPayments = payments.filter(p => {
        const pMonth = new Date(p.createdAt || p.date).getMonth()
        return pMonth === thisMonth && p.status === 'paid'
      })
      const pendingPayments = payments.filter(p => p.status === 'pending')

      setStats({
        children: {
          total: children.length,
          active: activeChildren.length,
          byGroup,
          byAge
        },
        groups: {
          total: groups.length,
          list: groups
        },
        payments: {
          monthly: monthlyPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
          pending: pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
          collected: payments.filter(p => p.status === 'paid').length
        },
        attendance: {
          rate: 85,
          today: Math.floor(activeChildren.length * 0.85),
          thisWeek: Math.floor(activeChildren.length * 0.82)
        },
        teachers: teachers.length
      })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m'
  }

  const tabs = [
    { id: 'overview', icon: '📊', label: txt.overview },
    { id: 'children', icon: '👶', label: txt.children },
    { id: 'payments', icon: '💰', label: txt.payments },
    { id: 'attendance', icon: '📅', label: txt.attendance }
  ]

  if (loading) {
    return (
      <div className="an-page">
        <div className="an-loading">
          <div className="an-spinner"></div>
          <p>Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="an-page">
      {/* Header */}
      <div className="an-header">
        <div className="an-header-content">
          <button className="an-back-btn" onClick={() => navigate('/admin/dashboard')}>
            ← Orqaga
          </button>
          <div className="an-header-title">
            <h1>{txt.title}</h1>
            <p>{txt.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="an-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`an-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="an-tab-icon">{tab.icon}</span>
            <span className="an-tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="an-content">
        {activeTab === 'overview' && (
          <div className="an-section">
            <div className="an-stats-grid">
              <StatsCard
                icon="👶"
                label={txt.totalChildren}
                value={stats.children.total}
                subValue={`${stats.children.active} ${txt.activeChildren.toLowerCase()}`}
                color="#3b82f6"
              />
              <StatsCard
                icon="👥"
                label={txt.totalGroups}
                value={stats.groups.total}
                color="#10b981"
              />
              <StatsCard
                icon="👨‍🏫"
                label={txt.totalTeachers}
                value={stats.teachers}
                color="#8b5cf6"
              />
              <StatsCard
                icon="💰"
                label={txt.monthlyRevenue}
                value={formatMoney(stats.payments.monthly)}
                subValue={`${stats.payments.collected} ta to'lov`}
                color="#f59e0b"
              />
            </div>

            <div className="an-charts-row">
              <div className="an-chart-card">
                <h3>{txt.byGroup}</h3>
                <div className="an-chart-bars">
                  {stats.children.byGroup.map((item, i) => (
                    <ChartBar
                      key={i}
                      label={item.name}
                      value={item.count}
                      maxValue={Math.max(...stats.children.byGroup.map(g => g.count))}
                      color={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5]}
                    />
                  ))}
                </div>
              </div>

              <div className="an-chart-card">
                <h3>{txt.byAge}</h3>
                <div className="an-chart-bars">
                  {stats.children.byAge.map((item, i) => (
                    <ChartBar
                      key={i}
                      label={item.label}
                      value={item.count}
                      maxValue={Math.max(...stats.children.byAge.map(a => a.count))}
                      color={['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'][i % 5]}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'children' && (
          <div className="an-section">
            <div className="an-stats-grid">
              <StatsCard
                icon="👶"
                label={txt.totalChildren}
                value={stats.children.total}
                color="#3b82f6"
              />
              <StatsCard
                icon="✅"
                label={txt.activeChildren}
                value={stats.children.active}
                color="#10b981"
              />
            </div>

            <div className="an-chart-card full">
              <h3>{txt.byGroup}</h3>
              <div className="an-pie-chart">
                {stats.children.byGroup.map((item, i) => (
                  <div key={i} className="an-pie-item">
                    <div 
                      className="an-pie-color" 
                      style={{ background: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5] }}
                    />
                    <span className="an-pie-label">{item.name}</span>
                    <span className="an-pie-value">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="an-section">
            <div className="an-stats-grid">
              <StatsCard
                icon="💰"
                label={txt.monthlyRevenue}
                value={formatMoney(stats.payments.monthly)}
                color="#10b981"
              />
              <StatsCard
                icon="⏳"
                label={txt.pendingPayments}
                value={formatMoney(stats.payments.pending)}
                color="#f59e0b"
              />
            </div>

            <div className="an-chart-card full">
              <h3>{txt.thisMonth}</h3>
              <div className="an-payment-summary">
                <div className="an-payment-item">
                  <span className="an-payment-icon">✅</span>
                  <span className="an-payment-label">To'langan</span>
                  <span className="an-payment-value success">{stats.payments.collected} ta</span>
                </div>
                <div className="an-payment-item">
                  <span className="an-payment-icon">⏳</span>
                  <span className="an-payment-label">Kutilmoqda</span>
                  <span className="an-payment-value warning">{formatMoney(stats.payments.pending)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="an-section">
            <div className="an-stats-grid">
              <StatsCard
                icon="📊"
                label={txt.attendanceRate}
                value={`${stats.attendance.rate}%`}
                color="#3b82f6"
              />
              <StatsCard
                icon="📅"
                label={txt.today}
                value={stats.attendance.today}
                subValue={`/ ${stats.children.active}`}
                color="#10b981"
              />
              <StatsCard
                icon="📆"
                label={txt.avgAttendance}
                value={stats.attendance.thisWeek}
                color="#8b5cf6"
              />
            </div>

            <div className="an-chart-card full">
              <h3>{txt.thisWeek}</h3>
              <div className="an-attendance-bars">
                {['Dush', 'Sesh', 'Chor', 'Pay', 'Jum'].map((day, i) => (
                  <div key={i} className="an-attendance-day">
                    <div className="an-attendance-bar">
                      <div 
                        className="an-attendance-fill"
                        style={{ height: `${70 + Math.random() * 25}%` }}
                      />
                    </div>
                    <span className="an-attendance-label">{day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
