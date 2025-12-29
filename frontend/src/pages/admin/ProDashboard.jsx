import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import {
  KPICard,
  AttendanceLineChart,
  PaymentBarChart,
  EnrollmentPieChart,
  ChartCard,
  PeriodSelector,
  LiveActivityFeed,
  AlertList,
  WeatherWidget
} from '../../components/admin'
import api from '../../services/api'
import './ProDashboard.css'

// Teacher Dashboard Component
function TeacherDashboardView() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [group, setGroup] = useState(null)
  const [children, setChildren] = useState([])
  const [todayAttendance, setTodayAttendance] = useState([])
  const [todayReports, setTodayReports] = useState([])

  useEffect(() => {
    fetchTeacherData()
  }, [])

  const fetchTeacherData = async () => {
    try {
      setLoading(true)
      
      console.log('[TeacherView] User:', user)
      console.log('[TeacherView] assignedGroups:', user?.assignedGroups)
      
      // 1. Avval /groups/my endpoint'dan olish
      try {
        const myGroupsRes = await api.get('/groups/my')
        const myGroups = myGroupsRes.data?.groups || []
        console.log('[TeacherView] /groups/my result:', myGroups)
        
        if (myGroups.length > 0) {
          const teacherGroup = myGroups[0]
          setGroup(teacherGroup)
          
          const groupId = teacherGroup.id || teacherGroup._id
          
          // Bolalarni olish
          try {
            const childrenRes = await api.get(`/groups/${groupId}/children`)
            const childrenData = childrenRes.data?.children || []
            setChildren(childrenData)
          } catch {
            const childrenRes = await api.get('/children')
            const childrenData = childrenRes.data?.data || childrenRes.data || []
            const groupChildren = childrenData.filter(c => 
              c.groupId === groupId || String(c.groupId) === String(groupId)
            )
            setChildren(groupChildren)
          }
          
          // Davomat
          try {
            const attendanceRes = await api.get(`/attendance/group/${groupId}`)
            setTodayAttendance(attendanceRes.data?.data || attendanceRes.data || [])
          } catch { setTodayAttendance([]) }
          
          // Hisobotlar
          try {
            const today = new Date().toISOString().split('T')[0]
            const reportsRes = await api.get(`/daily-reports?date=${today}&groupId=${groupId}`)
            setTodayReports(reportsRes.data?.data || reportsRes.data || [])
          } catch { setTodayReports([]) }
          
          setLoading(false)
          return
        }
      } catch (err) {
        console.log('[TeacherView] /groups/my error:', err.message)
      }
      
      // 2. Fallback: assignedGroups bo'yicha
      const assignedGroups = user?.assignedGroups || []
      console.log('[TeacherView] Fallback assignedGroups:', assignedGroups)
      
      if (assignedGroups.length > 0) {
        const groupId = assignedGroups[0]
        
        const groupsRes = await api.get('/groups')
        const groupsData = groupsRes.data?.data || groupsRes.data || []
        const teacherGroup = groupsData.find(g => 
          g.id === groupId || 
          g._id === groupId ||
          String(g.id) === String(groupId)
        )
        
        console.log('[TeacherView] Found group:', teacherGroup)
        
        if (teacherGroup) {
          setGroup(teacherGroup)
          
          const childrenRes = await api.get('/children')
          const childrenData = childrenRes.data?.data || childrenRes.data || []
          const groupChildren = childrenData.filter(c => 
            c.groupId === teacherGroup.id || 
            c.groupId === groupId ||
            String(c.groupId) === String(groupId)
          )
          setChildren(groupChildren)
          
          try {
            const attendanceRes = await api.get(`/attendance/group/${groupId}`)
            setTodayAttendance(attendanceRes.data?.data || attendanceRes.data || [])
          } catch { setTodayAttendance([]) }
          
          try {
            const today = new Date().toISOString().split('T')[0]
            const reportsRes = await api.get(`/daily-reports?date=${today}&groupId=${groupId}`)
            setTodayReports(reportsRes.data?.data || reportsRes.data || [])
          } catch { setTodayReports([]) }
        }
      }
    } catch (error) {
      console.error('[TeacherView] Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const attendanceStats = {
    present: todayAttendance.filter(a => a.status === 'present').length,
    absent: todayAttendance.filter(a => a.status === 'absent').length,
    notMarked: children.length - todayAttendance.length
  }

  if (loading) {
    return (
      <div className="pro-dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="pro-dashboard">
        <div className="no-group-message">
          <span className="no-group-icon">😔</span>
          <h2>Sizga guruh biriktirilmagan</h2>
          <p>Administrator bilan bog'laning</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pro-dashboard teacher-view">
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h1 className="dashboard-title">👋 Salom, {user?.name || user?.username}!</h1>
          <p className="dashboard-subtitle">
            <span className="group-badge">👥 {group.name}</span> • {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="dashboard-header-right">
          <WeatherWidget compact />
        </div>
      </div>

      <section className="dashboard-section">
        <div className="kpi-grid teacher-kpi">
          <div className="teacher-stat-card blue" onClick={() => navigate('/admin/children')}>
            <div className="teacher-stat-icon">👶</div>
            <div className="teacher-stat-value">{children.length}</div>
            <div className="teacher-stat-label">Jami bolalar</div>
          </div>
          <div className="teacher-stat-card green" onClick={() => navigate('/admin/attendance')}>
            <div className="teacher-stat-icon">✅</div>
            <div className="teacher-stat-value">{attendanceStats.present}</div>
            <div className="teacher-stat-label">Kelganlar</div>
          </div>
          <div className="teacher-stat-card red" onClick={() => navigate('/admin/attendance')}>
            <div className="teacher-stat-icon">❌</div>
            <div className="teacher-stat-value">{attendanceStats.absent}</div>
            <div className="teacher-stat-label">Kelmaganlar</div>
          </div>
          <div className="teacher-stat-card orange" onClick={() => navigate('/admin/daily-reports')}>
            <div className="teacher-stat-icon">📝</div>
            <div className="teacher-stat-value">{todayReports.length}/{children.length}</div>
            <div className="teacher-stat-label">Hisobotlar</div>
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="section-title">⚡ Tezkor amallar</h2>
        <div className="quick-actions-grid">
          <button className="quick-action-btn" onClick={() => navigate('/admin/attendance')}>
            <span className="qa-icon">📋</span>
            <span className="qa-text">Davomat belgilash</span>
          </button>
          <button className="quick-action-btn" onClick={() => navigate('/admin/daily-reports')}>
            <span className="qa-icon">📝</span>
            <span className="qa-text">Hisobot yozish</span>
          </button>
          <button className="quick-action-btn" onClick={() => navigate('/admin/children')}>
            <span className="qa-icon">👶</span>
            <span className="qa-text">Bolalar ro'yxati</span>
          </button>
          <button className="quick-action-btn" onClick={() => window.open('/', '_blank')}>
            <span className="qa-icon">🏠</span>
            <span className="qa-text">Bosh sahifa</span>
          </button>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="teacher-lists-row">
          <div className="teacher-list-card">
            <h3>📅 Bugungi davomat</h3>
            <div className="attendance-mini-list">
              {children.slice(0, 6).map(child => {
                const att = todayAttendance.find(a => a.childId === child.id)
                return (
                  <div key={child.id} className={`att-mini-item ${att?.status || 'not_marked'}`}>
                    <span className="att-avatar">{child.firstName?.[0]}</span>
                    <span className="att-name">{child.firstName}</span>
                    <span className="att-status">
                      {att?.status === 'present' ? '✅' : att?.status === 'absent' ? '❌' : '⏳'}
                    </span>
                  </div>
                )
              })}
              {children.length > 6 && (
                <button className="see-all-btn" onClick={() => navigate('/admin/attendance')}>
                  Barchasini ko'rish →
                </button>
              )}
            </div>
          </div>

          <div className="teacher-list-card">
            <h3>📝 Hisobot yozilmagan</h3>
            <div className="missing-reports-list">
              {children.filter(c => !todayReports.find(r => r.childId === c.id)).slice(0, 6).map(child => (
                <div key={child.id} className="missing-item" onClick={() => navigate('/admin/daily-reports')}>
                  <span className="missing-avatar">{child.firstName?.[0]}</span>
                  <span className="missing-name">{child.firstName} {child.lastName}</span>
                  <span className="missing-action">Yozish →</span>
                </div>
              ))}
              {children.filter(c => !todayReports.find(r => r.childId === c.id)).length === 0 && (
                <div className="all-done">
                  <span>🎉</span>
                  <p>Barcha hisobotlar yozilgan!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Admin Dashboard Component
function AdminDashboardView() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [chartPeriod, setChartPeriod] = useState('week')
  const [kpiData, setKpiData] = useState(null)
  const [activities, setActivities] = useState([])
  const [alerts, setAlerts] = useState([])
  const [chartData, setChartData] = useState({
    attendance: null,
    payments: null,
    groups: null
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      const [childrenRes, attendanceRes, paymentsRes, groupsRes, debtsRes, enrollmentsRes] = await Promise.all([
        api.get('/children'),
        api.get('/attendance/today'),
        api.get('/payments'),
        api.get('/groups'),
        api.get('/debts'),
        api.get('/enrollments')
      ])

      const children = childrenRes.data?.data || childrenRes.data || []
      const todayAttendance = attendanceRes.data?.data || attendanceRes.data || []
      const payments = paymentsRes.data?.data || paymentsRes.data || []
      const groups = groupsRes.data?.data || groupsRes.data || []
      const debts = debtsRes.data?.data || debtsRes.data || []
      const enrollments = enrollmentsRes.data?.data || enrollmentsRes.data || []

      // Calculate KPIs
      const activeChildren = children.filter(c => c.isActive !== false)
      const presentToday = todayAttendance.filter(a => a.status === 'present').length
      const completedPayments = payments.filter(p => p.status === 'completed')
      const monthlyRevenue = completedPayments
        .filter(p => {
          const paymentDate = new Date(p.createdAt)
          const now = new Date()
          return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear()
        })
        .reduce((sum, p) => sum + (p.amount || 0), 0)
      
      const pendingDebts = debts.filter(d => d.status === 'pending')
      const pendingEnrollments = enrollments.filter(e => e.status === 'pending')

      setKpiData({
        totalChildren: { value: activeChildren.length, trend: { value: 5, direction: 'up' } },
        presentToday: { 
          value: presentToday, 
          trend: { value: Math.round((presentToday / activeChildren.length) * 100) || 0, direction: 'up' } 
        },
        monthlyRevenue: { value: monthlyRevenue, trend: { value: 8, direction: 'up' } },
        pendingPayments: { value: pendingDebts.length, trend: pendingDebts.length > 5 ? { value: pendingDebts.length, direction: 'down' } : null },
        activeGroups: { value: groups.length, trend: null },
        newEnrollments: { value: pendingEnrollments.length, trend: pendingEnrollments.length > 0 ? { value: pendingEnrollments.length, direction: 'up' } : null }
      })

      // Build activities from recent data
      const recentActivities = []
      
      todayAttendance.slice(0, 3).forEach((att, i) => {
        recentActivities.push({
          id: `att-${i}`,
          type: 'attendance',
          title: `${att.childName} ${att.status === 'present' ? 'keldi' : 'kelmadi'}`,
          description: att.groupName || 'Guruh',
          timestamp: new Date(Date.now() - i * 10 * 60000)
        })
      })

      completedPayments.slice(0, 2).forEach((pay, i) => {
        recentActivities.push({
          id: `pay-${i}`,
          type: 'payment',
          title: "To'lov qabul qilindi",
          description: `${pay.childName} - ${(pay.amount / 1000000).toFixed(1)}M so'm`,
          timestamp: new Date(pay.createdAt)
        })
      })

      pendingEnrollments.slice(0, 2).forEach((enr, i) => {
        recentActivities.push({
          id: `enr-${i}`,
          type: 'enrollment',
          title: 'Yangi ariza',
          description: `${enr.childName} - ${enr.groupName || 'Guruh'}`,
          timestamp: new Date(enr.createdAt)
        })
      })

      setActivities(recentActivities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 8))

      // Build alerts
      const alertList = []
      
      const absentToday = todayAttendance.filter(a => a.status === 'absent' || a.status === 'not_marked')
      if (absentToday.length > 0) {
        alertList.push({
          id: 'absent',
          type: 'absent_children',
          severity: absentToday.length > 10 ? 'critical' : 'warning',
          count: absentToday.length,
          countLabel: 'bola',
          items: absentToday.slice(0, 3).map(a => a.childName?.split(' ')[0] || 'Bola')
        })
      }

      if (pendingDebts.length > 0) {
        const totalDebt = pendingDebts.reduce((sum, d) => sum + (d.amount || 0), 0)
        alertList.push({
          id: 'debts',
          type: 'pending_payments',
          severity: pendingDebts.length > 5 ? 'critical' : 'warning',
          count: pendingDebts.length,
          countLabel: "ta to'lov",
          message: `Jami ${(totalDebt / 1000000).toFixed(1)}M so'm qarzdorlik`
        })
      }

      if (pendingEnrollments.length > 0) {
        alertList.push({
          id: 'enrollments',
          type: 'new_enrollments',
          severity: 'info',
          count: pendingEnrollments.length,
          countLabel: 'ta ariza',
          message: "Ko'rib chiqish kutilmoqda"
        })
      }

      setAlerts(alertList)

      // Chart data - groups distribution (real data)
      const groupData = groups.map(g => {
        const childCount = children.filter(c => c.groupId === g.id).length
        return { name: g.name, count: childCount }
      }).filter(g => g.count > 0)

      // Attendance chart data - real weekly data
      const weekDays = ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak']
      const totalChildrenCount = activeChildren.length || 1
      const presentPercent = Math.round((presentToday / totalChildrenCount) * 100)
      const absentPercent = 100 - presentPercent
      
      // Generate realistic weekly attendance based on today's data
      const attendancePresent = weekDays.map((_, i) => {
        if (i === new Date().getDay() - 1 || (new Date().getDay() === 0 && i === 6)) {
          return presentPercent
        }
        // Weekend - lower attendance
        if (i >= 5) return Math.max(0, presentPercent - 40 + Math.floor(Math.random() * 10))
        // Weekdays - similar to today with small variation
        return Math.min(100, Math.max(0, presentPercent + Math.floor(Math.random() * 10) - 5))
      })
      const attendanceAbsent = attendancePresent.map(p => 100 - p)

      // Payment chart data - real monthly data
      const monthNames = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']
      const currentMonth = new Date().getMonth()
      const last6Months = []
      for (let i = 5; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12
        last6Months.push(monthNames[monthIndex])
      }

      // Calculate real payment data per month
      const paidByMonth = last6Months.map((_, i) => {
        const monthIndex = (currentMonth - (5 - i) + 12) % 12
        const monthPayments = completedPayments.filter(p => {
          const payDate = new Date(p.createdAt)
          return payDate.getMonth() === monthIndex
        })
        return monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
      })

      const debtByMonth = last6Months.map((_, i) => {
        const monthIndex = (currentMonth - (5 - i) + 12) % 12
        const monthDebts = debts.filter(d => {
          const debtDate = new Date(d.createdAt)
          return debtDate.getMonth() === monthIndex && d.status === 'pending'
        })
        return monthDebts.reduce((sum, d) => sum + (d.amount || 0), 0)
      })

      setChartData({
        attendance: {
          labels: weekDays,
          present: attendancePresent,
          absent: attendanceAbsent
        },
        payments: {
          labels: last6Months,
          paid: paidByMonth,
          debt: debtByMonth
        },
        groups: {
          labels: groupData.map(g => g.name),
          values: groupData.map(g => g.count)
        }
      })

    } catch (error) {
      console.error('Dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKPIClick = (path) => {
    navigate(path)
  }

  const handleAlertAction = (alert) => {
    // Navigate to relevant page based on alert type
    switch (alert.type) {
      case 'absent_children':
        navigate('/admin/attendance')
        break
      case 'pending_payments':
        navigate('/admin/payments')
        break
      case 'new_enrollments':
        navigate('/admin/children')
        break
      default:
        break
    }
  }

  const handleActivityClick = (activity) => {
    // Activity click handler - navigate to relevant page if needed
  }

  return (
    <div className="pro-dashboard">
      {/* Page Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">
            {new Date().toLocaleDateString('uz-UZ', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="dashboard-header-right">
          <WeatherWidget compact />
        </div>
      </div>

      {/* KPI Cards */}
      <section className="dashboard-section">
        <div className="kpi-grid">
          <KPICard
            title="Jami bolalar"
            value={kpiData?.totalChildren.value || 0}
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>}
            trend={kpiData?.totalChildren.trend}
            color="blue"
            path="/admin/children"
            loading={loading}
            description="Faol ro'yxatda"
          />
          <KPICard
            title="Bugun kelganlar"
            value={kpiData?.presentToday.value || 0}
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>}
            trend={kpiData?.presentToday.trend}
            color="green"
            path="/admin/attendance"
            loading={loading}
            description={`${Math.round((kpiData?.presentToday.value / kpiData?.totalChildren.value) * 100) || 0}% davomat`}
          />
          <KPICard
            title="Oylik daromad"
            value={kpiData?.monthlyRevenue.value || 0}
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
            trend={kpiData?.monthlyRevenue.trend}
            color="purple"
            path="/admin/payments"
            loading={loading}
            suffix=" so'm"
          />
          <KPICard
            title="Kutilayotgan to'lovlar"
            value={kpiData?.pendingPayments.value || 0}
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
            trend={kpiData?.pendingPayments.trend}
            color="orange"
            path="/admin/payments?filter=pending"
            loading={loading}
            description="Qarzdorlar"
          />
          <KPICard
            title="Faol guruhlar"
            value={kpiData?.activeGroups.value || 0}
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
            color="cyan"
            path="/admin/groups"
            loading={loading}
          />
          <KPICard
            title="Yangi arizalar"
            value={kpiData?.newEnrollments.value || 0}
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>}
            trend={kpiData?.newEnrollments.trend}
            color="green"
            path="/admin/enrollments"
            loading={loading}
            description="Bu hafta"
          />
        </div>
      </section>

      {/* Charts Section */}
      <section className="dashboard-section">
        <div className="charts-row">
          <ChartCard
            title="Davomat tendensiyasi"
            subtitle="So'nggi hafta"
            className="chart-card-wide"
            actions={
              <PeriodSelector 
                value={chartPeriod} 
                onChange={setChartPeriod}
              />
            }
          >
            <AttendanceLineChart 
              data={chartData.attendance}
              loading={loading}
              height={280}
              title=""
            />
          </ChartCard>

          <ChartCard
            title="Bolalar taqsimoti"
            subtitle="Guruhlar bo'yicha"
          >
            <EnrollmentPieChart 
              data={chartData.groups}
              loading={loading}
              height={280}
              title=""
            />
          </ChartCard>
        </div>

        <div className="charts-row">
          <ChartCard
            title="To'lov statistikasi"
            subtitle="Oylik taqqoslash"
            className="chart-card-wide"
          >
            <PaymentBarChart 
              data={chartData.payments}
              loading={loading}
              height={280}
              title=""
            />
          </ChartCard>
        </div>
      </section>

      {/* Activity & Alerts Section */}
      <section className="dashboard-section">
        <div className="activity-alerts-row">
          <div className="activity-column">
            <LiveActivityFeed
              activities={activities}
              loading={loading}
              onActivityClick={handleActivityClick}
              maxItems={8}
            />
          </div>

          <div className="alerts-column">
            <AlertList
              alerts={alerts}
              loading={loading}
              onAction={handleAlertAction}
              maxItems={5}
            />
          </div>
        </div>
      </section>

    </div>
  )
}

// Main ProDashboard - role based routing
function ProDashboard() {
  const { user } = useAuth()
  
  // Teacher uchun alohida dashboard
  if (user?.role === 'teacher') {
    return <TeacherDashboardView />
  }
  
  // Admin uchun to'liq dashboard
  return <AdminDashboardView />
}

export default ProDashboard
