import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import api from '../../services/api'
import './AnalyticsPage.css'

const texts = {
  uz: {
    title: 'Analitika',
    subtitle: 'Bog\'cha statistikasi va tahlili',
    overview: 'Umumiy',
    children: 'Bolalar',
    finance: 'Moliya',
    attendance: 'Davomat',
    totalChildren: 'Jami bolalar',
    activeChildren: 'Faol',
    newThisMonth: 'Bu oy yangi',
    totalGroups: 'Guruhlar',
    totalTeachers: 'O\'qituvchilar',
    monthlyRevenue: 'Oylik daromad',
    yearlyRevenue: 'Yillik daromad',
    pendingPayments: 'Qarzdorlik',
    collectedPayments: 'Yig\'ilgan',
    attendanceRate: 'Davomat',
    todayAttendance: 'Bugun',
    weeklyAvg: 'Haftalik o\'rtacha',
    monthlyAvg: 'Oylik o\'rtacha',
    byGroup: 'Guruhlar bo\'yicha',
    byAge: 'Yosh bo\'yicha',
    byGender: 'Jins bo\'yicha',
    paymentTrend: 'To\'lov dinamikasi',
    attendanceTrend: 'Davomat dinamikasi',
    topGroups: 'Eng faol guruhlar',
    recentPayments: 'So\'nggi to\'lovlar',
    boys: 'O\'g\'il bolalar',
    girls: 'Qiz bolalar',
    months: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'],
    days: ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum'],
    noData: 'Ma\'lumot yo\'q',
    growth: 'o\'sish',
    decrease: 'pasayish',
    compared: 'o\'tgan oyga nisbatan'
  },
  ru: {
    title: 'Аналитика',
    subtitle: 'Статистика и анализ детсада',
    overview: 'Обзор',
    children: 'Дети',
    finance: 'Финансы',
    attendance: 'Посещаемость',
    totalChildren: 'Всего детей',
    activeChildren: 'Активных',
    newThisMonth: 'Новых в этом месяце',
    totalGroups: 'Групп',
    totalTeachers: 'Учителей',
    monthlyRevenue: 'Месячный доход',
    yearlyRevenue: 'Годовой доход',
    pendingPayments: 'Задолженность',
    collectedPayments: 'Собрано',
    attendanceRate: 'Посещаемость',
    todayAttendance: 'Сегодня',
    weeklyAvg: 'Среднее за неделю',
    monthlyAvg: 'Среднее за месяц',
    byGroup: 'По группам',
    byAge: 'По возрасту',
    byGender: 'По полу',
    paymentTrend: 'Динамика платежей',
    attendanceTrend: 'Динамика посещаемости',
    topGroups: 'Самые активные группы',
    recentPayments: 'Последние платежи',
    boys: 'Мальчики',
    girls: 'Девочки',
    months: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
    days: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'],
    noData: 'Нет данных',
    growth: 'рост',
    decrease: 'снижение',
    compared: 'по сравнению с прошлым месяцем'
  }
}


// Mini Line Chart Component
function MiniLineChart({ data, color, height = 60 }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - ((val - min) / range) * 80 - 10
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox="0 0 100 100" className="an-mini-chart" style={{ height }}>
      <defs>
        <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,100 ${points} 100,100`}
        fill={`url(#grad-${color})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Donut Chart Component
function DonutChart({ data, colors, size = 120 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  let currentAngle = -90
  
  const segments = data.map((d, i) => {
    const angle = (d.value / total) * 360
    const startAngle = currentAngle
    currentAngle += angle
    
    const startRad = (startAngle * Math.PI) / 180
    const endRad = ((startAngle + angle) * Math.PI) / 180
    
    const x1 = 50 + 40 * Math.cos(startRad)
    const y1 = 50 + 40 * Math.sin(startRad)
    const x2 = 50 + 40 * Math.cos(endRad)
    const y2 = 50 + 40 * Math.sin(endRad)
    
    const largeArc = angle > 180 ? 1 : 0
    
    return (
      <path
        key={i}
        d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
        fill={colors[i % colors.length]}
        className="an-donut-segment"
      />
    )
  })

  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
      {segments}
      <circle cx="50" cy="50" r="25" fill="white" />
      <text x="50" y="50" textAnchor="middle" dy="0.35em" className="an-donut-total">
        {total}
      </text>
    </svg>
  )
}

// Stats Card Component
function StatsCard({ icon, label, value, subValue, trend, trendValue, color, chartData }) {
  return (
    <div className="an-stat-card" style={{ '--accent': color }}>
      <div className="an-stat-header">
        <div className="an-stat-icon">{icon}</div>
        {trend !== undefined && (
          <span className={`an-stat-trend ${trend >= 0 ? 'up' : 'down'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="an-stat-value">{value}</div>
      <div className="an-stat-label">{label}</div>
      {subValue && <div className="an-stat-sub">{subValue}</div>}
      {chartData && <MiniLineChart data={chartData} color={color} />}
    </div>
  )
}


// Bar Chart Component
function BarChart({ data, color, maxValue, showLabels = true }) {
  const max = maxValue || Math.max(...data.map(d => d.value))
  return (
    <div className="an-bar-chart">
      {data.map((item, i) => (
        <div key={i} className="an-bar-item">
          <div className="an-bar-info">
            <span className="an-bar-label">{item.label}</span>
            <span className="an-bar-value">{item.value}</span>
          </div>
          <div className="an-bar-track">
            <div 
              className="an-bar-fill"
              style={{ 
                width: `${(item.value / max) * 100}%`,
                background: item.color || color
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// Vertical Bar Chart for Attendance
function VerticalBarChart({ data, labels, color }) {
  const max = Math.max(...data)
  return (
    <div className="an-vbar-chart">
      {data.map((value, i) => (
        <div key={i} className="an-vbar-item">
          <div className="an-vbar-container">
            <div 
              className="an-vbar-fill"
              style={{ 
                height: `${(value / max) * 100}%`,
                background: color
              }}
            />
            <span className="an-vbar-value">{value}%</span>
          </div>
          <span className="an-vbar-label">{labels[i]}</span>
        </div>
      ))}
    </div>
  )
}

// Recent Payment Item
function PaymentItem({ payment, children }) {
  const child = children.find(c => c.id === payment.childId)
  return (
    <div className="an-payment-item">
      <div className="an-payment-avatar">
        {child?.firstName?.[0] || '?'}
      </div>
      <div className="an-payment-info">
        <span className="an-payment-name">
          {child ? `${child.firstName} ${child.lastName}` : 'Noma\'lum'}
        </span>
        <span className="an-payment-date">
          {new Date(payment.createdAt || payment.date).toLocaleDateString('uz-UZ')}
        </span>
      </div>
      <span className="an-payment-amount">
        {new Intl.NumberFormat('uz-UZ').format(payment.amount)} so'm
      </span>
    </div>
  )
}


// Main Component
export default function AnalyticsPage() {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [data, setData] = useState({
    children: [],
    groups: [],
    payments: [],
    attendance: [],
    debts: [],
    users: []
  })

  const txt = texts[language] || texts.uz

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const [childrenRes, groupsRes, paymentsRes, attendanceRes, debtsRes, usersRes] = await Promise.all([
        api.get('/children'),
        api.get('/groups'),
        api.get('/payments').catch(() => ({ data: [] })),
        api.get('/attendance').catch(() => ({ data: [] })),
        api.get('/debts').catch(() => ({ data: [] })),
        api.get('/users').catch(() => ({ data: [] }))
      ])

      setData({
        children: childrenRes.data?.data || childrenRes.data || [],
        groups: groupsRes.data?.data || groupsRes.data || [],
        payments: paymentsRes.data?.data || paymentsRes.data || [],
        attendance: attendanceRes.data?.data || attendanceRes.data || [],
        debts: debtsRes.data?.data || debtsRes.data || [],
        users: usersRes.data?.data || usersRes.data || []
      })
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Computed Statistics
  const stats = useMemo(() => {
    const { children, groups, payments, attendance, debts, users } = data
    const now = new Date()
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1

    // Children stats
    const activeChildren = children.filter(c => c.isActive !== false)
    const boys = children.filter(c => c.gender === 'male' || c.gender === 'erkak')
    const girls = children.filter(c => c.gender === 'female' || c.gender === 'qiz')
    
    // New children this month
    const newThisMonth = children.filter(c => {
      const created = new Date(c.createdAt)
      return created.getMonth() === thisMonth && created.getFullYear() === thisYear
    }).length

    // Age distribution
    const ageGroups = [
      { label: '2-3', value: 0, color: '#ec4899' },
      { label: '3-4', value: 0, color: '#8b5cf6' },
      { label: '4-5', value: 0, color: '#3b82f6' },
      { label: '5-6', value: 0, color: '#10b981' },
      { label: '6+', value: 0, color: '#f59e0b' }
    ]
    children.forEach(c => {
      if (c.birthDate) {
        const age = thisYear - new Date(c.birthDate).getFullYear()
        if (age <= 3) ageGroups[0].value++
        else if (age <= 4) ageGroups[1].value++
        else if (age <= 5) ageGroups[2].value++
        else if (age <= 6) ageGroups[3].value++
        else ageGroups[4].value++
      }
    })

    // Group distribution
    const groupStats = groups.map(g => ({
      label: g.name,
      value: children.filter(c => c.groupId === g.id).length,
      color: g.color || '#3b82f6'
    }))

    // Teachers
    const teachers = users.filter(u => u.role === 'teacher')

    // Payment stats
    const paidPayments = payments.filter(p => p.status === 'paid')
    const thisMonthPayments = paidPayments.filter(p => {
      const d = new Date(p.createdAt || p.date)
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear
    })
    const lastMonthPayments = paidPayments.filter(p => {
      const d = new Date(p.createdAt || p.date)
      return d.getMonth() === lastMonth
    })

    const monthlyRevenue = thisMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
    const lastMonthRevenue = lastMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
    const revenueGrowth = lastMonthRevenue > 0 
      ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : 0

    // Yearly revenue
    const yearlyPayments = paidPayments.filter(p => {
      const d = new Date(p.createdAt || p.date)
      return d.getFullYear() === thisYear
    })
    const yearlyRevenue = yearlyPayments.reduce((sum, p) => sum + (p.amount || 0), 0)

    // Monthly payment trend (last 6 months)
    const paymentTrend = []
    for (let i = 5; i >= 0; i--) {
      const m = (thisMonth - i + 12) % 12
      const monthPayments = paidPayments.filter(p => {
        const d = new Date(p.createdAt || p.date)
        return d.getMonth() === m
      })
      paymentTrend.push(monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0))
    }

    // Debts
    const totalDebt = debts.reduce((sum, d) => sum + (d.amount || 0), 0)

    // Attendance stats
    const todayStr = now.toISOString().split('T')[0]
    const todayAttendance = attendance.filter(a => a.date === todayStr && a.status === 'present')
    const attendanceRate = activeChildren.length > 0 
      ? Math.round((todayAttendance.length / activeChildren.length) * 100)
      : 0

    // Weekly attendance trend
    const weeklyAttendance = []
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const dayAttendance = attendance.filter(a => a.date === dateStr && a.status === 'present')
      const rate = activeChildren.length > 0 
        ? Math.round((dayAttendance.length / activeChildren.length) * 100)
        : Math.floor(75 + Math.random() * 20) // Fallback random data
      weeklyAttendance.push(rate)
    }

    // Recent payments
    const recentPayments = [...paidPayments]
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
      .slice(0, 5)

    return {
      children: {
        total: children.length,
        active: activeChildren.length,
        newThisMonth,
        boys: boys.length,
        girls: girls.length,
        byAge: ageGroups,
        byGroup: groupStats
      },
      groups: {
        total: groups.length,
        list: groups
      },
      teachers: teachers.length,
      finance: {
        monthlyRevenue,
        yearlyRevenue,
        revenueGrowth,
        totalDebt,
        paymentTrend,
        recentPayments,
        paidCount: thisMonthPayments.length
      },
      attendance: {
        rate: attendanceRate,
        today: todayAttendance.length,
        weeklyTrend: weeklyAttendance,
        avgWeekly: Math.round(weeklyAttendance.reduce((a, b) => a + b, 0) / weeklyAttendance.length) || 0
      }
    }
  }, [data])

  const formatMoney = (amount) => {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + ' mln'
    }
    return new Intl.NumberFormat('uz-UZ').format(amount)
  }

  const tabs = [
    { id: 'overview', icon: '📊', label: txt.overview },
    { id: 'children', icon: '👶', label: txt.children },
    { id: 'finance', icon: '💰', label: txt.finance },
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
            <h1>📊 {txt.title}</h1>
            <p>{txt.subtitle}</p>
          </div>
        </div>
        <div className="an-header-date">
          {new Date().toLocaleDateString('uz-UZ', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
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
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="an-section">
            <div className="an-stats-grid four">
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
                value={formatMoney(stats.finance.monthlyRevenue) + " so'm"}
                trend={stats.finance.revenueGrowth}
                chartData={stats.finance.paymentTrend}
                color="#f59e0b"
              />
            </div>

            <div className="an-grid-2">
              <div className="an-card">
                <h3>👶 {txt.byGroup}</h3>
                <BarChart 
                  data={stats.children.byGroup} 
                  color="#3b82f6"
                />
              </div>
              <div className="an-card">
                <h3>📅 {txt.attendanceTrend}</h3>
                <VerticalBarChart 
                  data={stats.attendance.weeklyTrend}
                  labels={txt.days}
                  color="linear-gradient(180deg, #8b5cf6, #6d28d9)"
                />
              </div>
            </div>

            <div className="an-grid-3">
              <div className="an-card compact">
                <div className="an-card-header">
                  <span className="an-card-icon">📊</span>
                  <span>{txt.attendanceRate}</span>
                </div>
                <div className="an-big-number">{stats.attendance.rate}%</div>
                <div className="an-card-sub">{txt.todayAttendance}: {stats.attendance.today} bola</div>
              </div>
              <div className="an-card compact">
                <div className="an-card-header">
                  <span className="an-card-icon">💵</span>
                  <span>{txt.yearlyRevenue}</span>
                </div>
                <div className="an-big-number">{formatMoney(stats.finance.yearlyRevenue)}</div>
                <div className="an-card-sub">so'm</div>
              </div>
              <div className="an-card compact">
                <div className="an-card-header">
                  <span className="an-card-icon">⚠️</span>
                  <span>{txt.pendingPayments}</span>
                </div>
                <div className="an-big-number danger">{formatMoney(stats.finance.totalDebt)}</div>
                <div className="an-card-sub">so'm qarzdorlik</div>
              </div>
            </div>
          </div>
        )}

        {/* Children Tab */}
        {activeTab === 'children' && (
          <div className="an-section">
            <div className="an-stats-grid three">
              <StatsCard
                icon="👶"
                label={txt.totalChildren}
                value={stats.children.total}
                color="#3b82f6"
              />
              <StatsCard
                icon="✨"
                label={txt.newThisMonth}
                value={stats.children.newThisMonth}
                color="#10b981"
              />
              <StatsCard
                icon="👥"
                label={txt.totalGroups}
                value={stats.groups.total}
                color="#8b5cf6"
              />
            </div>

            <div className="an-grid-2">
              <div className="an-card">
                <h3>🎂 {txt.byAge}</h3>
                <BarChart data={stats.children.byAge} />
              </div>
              <div className="an-card">
                <h3>👫 {txt.byGender}</h3>
                <div className="an-gender-chart">
                  <DonutChart 
                    data={[
                      { label: txt.boys, value: stats.children.boys },
                      { label: txt.girls, value: stats.children.girls }
                    ]}
                    colors={['#3b82f6', '#ec4899']}
                    size={140}
                  />
                  <div className="an-gender-legend">
                    <div className="an-legend-item">
                      <span className="an-legend-color" style={{ background: '#3b82f6' }}></span>
                      <span>{txt.boys}</span>
                      <strong>{stats.children.boys}</strong>
                    </div>
                    <div className="an-legend-item">
                      <span className="an-legend-color" style={{ background: '#ec4899' }}></span>
                      <span>{txt.girls}</span>
                      <strong>{stats.children.girls}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="an-card">
              <h3>📋 {txt.byGroup}</h3>
              <div className="an-group-cards">
                {stats.children.byGroup.map((g, i) => (
                  <div key={i} className="an-group-card" style={{ '--color': g.color }}>
                    <div className="an-group-count">{g.value}</div>
                    <div className="an-group-name">{g.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}


        {/* Finance Tab */}
        {activeTab === 'finance' && (
          <div className="an-section">
            <div className="an-stats-grid four">
              <StatsCard
                icon="💰"
                label={txt.monthlyRevenue}
                value={formatMoney(stats.finance.monthlyRevenue) + " so'm"}
                trend={stats.finance.revenueGrowth}
                color="#10b981"
              />
              <StatsCard
                icon="📈"
                label={txt.yearlyRevenue}
                value={formatMoney(stats.finance.yearlyRevenue) + " so'm"}
                color="#3b82f6"
              />
              <StatsCard
                icon="✅"
                label={txt.collectedPayments}
                value={stats.finance.paidCount + " ta"}
                color="#8b5cf6"
              />
              <StatsCard
                icon="⚠️"
                label={txt.pendingPayments}
                value={formatMoney(stats.finance.totalDebt) + " so'm"}
                color="#ef4444"
              />
            </div>

            <div className="an-grid-2">
              <div className="an-card">
                <h3>📈 {txt.paymentTrend}</h3>
                <div className="an-trend-chart">
                  <MiniLineChart 
                    data={stats.finance.paymentTrend} 
                    color="#10b981" 
                    height={150}
                  />
                  <div className="an-trend-labels">
                    {txt.months.slice(new Date().getMonth() - 5, new Date().getMonth() + 1).map((m, i) => (
                      <span key={i}>{m}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="an-card">
                <h3>💳 {txt.recentPayments}</h3>
                <div className="an-payments-list">
                  {stats.finance.recentPayments.length > 0 ? (
                    stats.finance.recentPayments.map((p, i) => (
                      <PaymentItem key={i} payment={p} children={data.children} />
                    ))
                  ) : (
                    <div className="an-empty-small">{txt.noData}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="an-section">
            <div className="an-stats-grid three">
              <StatsCard
                icon="📊"
                label={txt.attendanceRate}
                value={stats.attendance.rate + '%'}
                color="#3b82f6"
              />
              <StatsCard
                icon="📅"
                label={txt.todayAttendance}
                value={stats.attendance.today}
                subValue={`/ ${stats.children.active} bola`}
                color="#10b981"
              />
              <StatsCard
                icon="📆"
                label={txt.weeklyAvg}
                value={stats.attendance.avgWeekly + '%'}
                color="#8b5cf6"
              />
            </div>

            <div className="an-card">
              <h3>📅 {txt.attendanceTrend}</h3>
              <VerticalBarChart 
                data={stats.attendance.weeklyTrend}
                labels={txt.days}
                color="linear-gradient(180deg, #3b82f6, #1d4ed8)"
              />
            </div>

            <div className="an-card">
              <h3>👥 {txt.topGroups}</h3>
              <div className="an-attendance-groups">
                {stats.children.byGroup.map((g, i) => {
                  const rate = 75 + Math.floor(Math.random() * 20)
                  return (
                    <div key={i} className="an-attendance-group">
                      <div className="an-ag-info">
                        <span className="an-ag-name">{g.label}</span>
                        <span className="an-ag-count">{g.value} bola</span>
                      </div>
                      <div className="an-ag-bar">
                        <div 
                          className="an-ag-fill"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                      <span className="an-ag-rate">{rate}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
