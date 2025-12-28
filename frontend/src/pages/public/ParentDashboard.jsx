/**
 * Parent Dashboard
 * Ota-onalar kabineti
 */

import { useState, useEffect, memo } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import HealthDashboard from '../../components/health/HealthDashboard'
import './ParentDashboard.css'

const translations = {
  uz: {
    title: "Ota-ona kabineti",
    welcome: "Xush kelibsiz",
    tabs: {
      overview: "Umumiy",
      health: "Sog'liq",
      payments: "To'lovlar",
      reports: "Hisobotlar",
      messages: "Xabarlar"
    },
    childInfo: "Bola haqida",
    group: "Guruh",
    age: "Yosh",
    attendance: "Davomat",
    todayStatus: "Bugungi holat",
    present: "Keldi",
    absent: "Kelmadi",
    recentActivity: "So'nggi faoliyat",
    upcomingEvents: "Yaqinlashayotgan tadbirlar",
    paymentStatus: "To'lov holati",
    paid: "To'langan",
    pending: "Kutilmoqda",
    overdue: "Muddati o'tgan",
    nextPayment: "Keyingi to'lov",
    viewAll: "Barchasini ko'rish",
    noEvents: "Tadbirlar yo'q",
    dailyReport: "Kunlik hisobot",
    meals: "Ovqatlanish",
    sleep: "Uyqu",
    activities: "Mashg'ulotlar",
    mood: "Kayfiyat"
  },
  ru: {
    title: "Кабинет родителя",
    welcome: "Добро пожаловать",
    tabs: {
      overview: "Обзор",
      health: "Здоровье",
      payments: "Оплата",
      reports: "Отчёты",
      messages: "Сообщения"
    },
    childInfo: "О ребёнке",
    group: "Группа",
    age: "Возраст",
    attendance: "Посещаемость",
    todayStatus: "Статус сегодня",
    present: "Присутствует",
    absent: "Отсутствует",
    recentActivity: "Последняя активность",
    upcomingEvents: "Предстоящие события",
    paymentStatus: "Статус оплаты",
    paid: "Оплачено",
    pending: "Ожидает",
    overdue: "Просрочено",
    nextPayment: "Следующий платёж",
    viewAll: "Смотреть все",
    noEvents: "Нет событий",
    dailyReport: "Ежедневный отчёт",
    meals: "Питание",
    sleep: "Сон",
    activities: "Занятия",
    mood: "Настроение"
  },
  en: {
    title: "Parent Dashboard",
    welcome: "Welcome",
    tabs: {
      overview: "Overview",
      health: "Health",
      payments: "Payments",
      reports: "Reports",
      messages: "Messages"
    },
    childInfo: "Child Info",
    group: "Group",
    age: "Age",
    attendance: "Attendance",
    todayStatus: "Today's Status",
    present: "Present",
    absent: "Absent",
    recentActivity: "Recent Activity",
    upcomingEvents: "Upcoming Events",
    paymentStatus: "Payment Status",
    paid: "Paid",
    pending: "Pending",
    overdue: "Overdue",
    nextPayment: "Next Payment",
    viewAll: "View All",
    noEvents: "No events",
    dailyReport: "Daily Report",
    meals: "Meals",
    sleep: "Sleep",
    activities: "Activities",
    mood: "Mood"
  }
}

function ParentDashboard() {
  const { language } = useLanguage()
  const t = translations[language] || translations.uz
  
  const [activeTab, setActiveTab] = useState('overview')
  const [childData, setChildData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch child data
    fetchChildData()
  }, [])

  const fetchChildData = async () => {
    try {
      // Mock data for now
      setChildData({
        id: '1',
        name: 'Ali Karimov',
        avatar: '👦',
        group: 'Quyosh',
        age: 5,
        attendance: 92,
        todayPresent: true,
        paymentStatus: 'paid',
        nextPayment: '2025-01-15',
        recentActivities: [
          { type: 'game', name: "Xotira o'yini", score: 85, date: new Date() },
          { type: 'learning', name: 'Harflar', progress: 70, date: new Date() }
        ],
        dailyReport: {
          meals: { breakfast: true, lunch: true, snack: true },
          sleep: '2 soat',
          mood: 'excellent',
          activities: ["Rasm chizish", "O'yin", "Qo'shiq"]
        }
      })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'overview', icon: '📊', label: t.tabs.overview },
    { id: 'health', icon: '🏥', label: t.tabs.health },
    { id: 'payments', icon: '💳', label: t.tabs.payments },
    { id: 'reports', icon: '📋', label: t.tabs.reports },
    { id: 'messages', icon: '💬', label: t.tabs.messages }
  ]

  if (loading) {
    return <div className="loading-screen">🐼 Yuklanmoqda...</div>
  }

  return (
    <div className="parent-dashboard">
      <header className="dashboard-header">
        <div className="child-avatar">{childData?.avatar}</div>
        <div className="header-info">
          <h1>{t.welcome}, {childData?.name}!</h1>
          <p>{t.group}: {childData?.group} • {childData?.age} {t.age}</p>
        </div>
        <div className={`today-status ${childData?.todayPresent ? 'present' : 'absent'}`}>
          {childData?.todayPresent ? '✅ ' + t.present : '❌ ' + t.absent}
        </div>
      </header>

      <nav className="dashboard-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="dashboard-content">
        {activeTab === 'overview' && (
          <OverviewTab data={childData} t={t} />
        )}
        {activeTab === 'health' && (
          <HealthDashboard childId={childData?.id} />
        )}
        {activeTab === 'payments' && (
          <PaymentsTab data={childData} t={t} />
        )}
        {activeTab === 'reports' && (
          <ReportsTab data={childData} t={t} />
        )}
        {activeTab === 'messages' && (
          <MessagesTab t={t} />
        )}
      </main>
    </div>
  )
}

// Overview Tab
const OverviewTab = memo(({ data, t }) => (
  <div className="overview-tab">
    <div className="stats-grid">
      <div className="stat-card attendance">
        <span className="stat-icon">📅</span>
        <div className="stat-info">
          <span className="stat-value">{data?.attendance}%</span>
          <span className="stat-label">{t.attendance}</span>
        </div>
      </div>
      
      <div className={`stat-card payment ${data?.paymentStatus}`}>
        <span className="stat-icon">💳</span>
        <div className="stat-info">
          <span className="stat-value">{t[data?.paymentStatus]}</span>
          <span className="stat-label">{t.paymentStatus}</span>
        </div>
      </div>
    </div>

    <div className="daily-report-card">
      <h3>📋 {t.dailyReport}</h3>
      <div className="report-grid">
        <div className="report-item">
          <span className="report-icon">🍽️</span>
          <span className="report-label">{t.meals}</span>
          <div className="meals-status">
            {data?.dailyReport?.meals?.breakfast && <span>🌅</span>}
            {data?.dailyReport?.meals?.lunch && <span>☀️</span>}
            {data?.dailyReport?.meals?.snack && <span>🌙</span>}
          </div>
        </div>
        <div className="report-item">
          <span className="report-icon">😴</span>
          <span className="report-label">{t.sleep}</span>
          <span className="report-value">{data?.dailyReport?.sleep}</span>
        </div>
        <div className="report-item">
          <span className="report-icon">😊</span>
          <span className="report-label">{t.mood}</span>
          <span className="report-value">
            {data?.dailyReport?.mood === 'excellent' ? '😄' : '🙂'}
          </span>
        </div>
      </div>
      {data?.dailyReport?.activities && (
        <div className="activities-list">
          <strong>{t.activities}:</strong>
          {data.dailyReport.activities.map((a, i) => (
            <span key={i} className="activity-tag">{a}</span>
          ))}
        </div>
      )}
    </div>

    <div className="recent-activity">
      <h3>🎮 {t.recentActivity}</h3>
      {data?.recentActivities?.map((activity, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="activity-item"
        >
          <span className="activity-icon">
            {activity.type === 'game' ? '🎮' : '📚'}
          </span>
          <div className="activity-info">
            <span className="activity-name">{activity.name}</span>
            <span className="activity-score">
              {activity.score ? `${activity.score} ball` : `${activity.progress}%`}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
))

// Payments Tab
const PaymentsTab = memo(({ data, t }) => (
  <div className="payments-tab">
    <div className="payment-summary">
      <div className={`payment-status-card ${data?.paymentStatus}`}>
        <span className="status-icon">
          {data?.paymentStatus === 'paid' ? '✅' : data?.paymentStatus === 'pending' ? '⏳' : '⚠️'}
        </span>
        <span className="status-text">{t[data?.paymentStatus]}</span>
      </div>
      <div className="next-payment">
        <span>{t.nextPayment}:</span>
        <strong>{new Date(data?.nextPayment).toLocaleDateString()}</strong>
      </div>
    </div>
    <div className="payment-history">
      <h3>📜 To'lovlar tarixi</h3>
      {/* Payment history list */}
    </div>
  </div>
))

// Reports Tab
const ReportsTab = memo(({ data, t }) => (
  <div className="reports-tab">
    <h3>📊 Hisobotlar</h3>
    <p>Bolangizning rivojlanish hisobotlari</p>
  </div>
))

// Messages Tab
const MessagesTab = memo(({ t }) => (
  <div className="messages-tab">
    <h3>💬 {t.tabs.messages}</h3>
    <p>O'qituvchi bilan aloqa</p>
  </div>
))

export default memo(ParentDashboard)
