import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
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

function ProDashboard() {
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

      // Chart data - groups distribution
      const groupData = groups.map(g => {
        const childCount = children.filter(c => c.groupId === g.id).length
        return { name: g.name, count: childCount }
      }).filter(g => g.count > 0)

      setChartData({
        attendance: null, // Will use default mock
        payments: null,   // Will use default mock
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
    console.log('Alert action:', alert)
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
    console.log('Activity clicked:', activity)
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

export default ProDashboard
