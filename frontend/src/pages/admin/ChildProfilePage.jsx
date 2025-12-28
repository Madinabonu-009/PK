import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { Button, Card, Loading } from '../../components/common'
import { useToast } from '../../components/common/Toast'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Doughnut, Radar } from 'react-chartjs-2'
import api from '../../services/api'
import './ChildProfilePage.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
)

function ChildProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { language } = useLanguage()
  const toast = useToast()
  const [child, setChild] = useState(null)
  const [achievements, setAchievements] = useState([])
  const [allAchievements, setAllAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAwardModal, setShowAwardModal] = useState(false)
  const [showPointsModal, setShowPointsModal] = useState(false)
  const [pointsToAdd, setPointsToAdd] = useState('')
  const [pointsReason, setPointsReason] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [attendanceHistory, setAttendanceHistory] = useState([])
  const [paymentHistory, setPaymentHistory] = useState([])
  const [dailyReports, setDailyReports] = useState([])
  const [progressData, setProgressData] = useState(null)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [childRes, achievementsRes, allAchievementsRes, attendanceRes, debtsRes, reportsRes, progressRes] = await Promise.all([
        api.get(`/children/${id}`),
        api.get(`/achievements/child/${id}`),
        api.get('/achievements'),
        api.get('/attendance'),
        api.get('/debts'),
        api.get('/daily-reports'),
        api.get('/progress').catch(() => ({ data: [] }))
      ])
      
      // Handle API response format
      const childData = childRes.data?.data || childRes.data
      const achievementsData = achievementsRes.data?.achievements || achievementsRes.data?.data || []
      const allAchievementsData = allAchievementsRes.data?.data || (Array.isArray(allAchievementsRes.data) ? allAchievementsRes.data : [])
      const attendanceData = attendanceRes.data?.data || (Array.isArray(attendanceRes.data) ? attendanceRes.data : [])
      const debtsData = debtsRes.data?.data || (Array.isArray(debtsRes.data) ? debtsRes.data : [])
      const reportsData = reportsRes.data?.data || (Array.isArray(reportsRes.data) ? reportsRes.data : [])
      const progressData = progressRes.data?.data || (Array.isArray(progressRes.data) ? progressRes.data : [])
      
      setChild(childData)
      setAchievements(achievementsData)
      setAllAchievements(allAchievementsData)
      
      // Filter attendance for this child
      const childAttendance = attendanceData
        .filter(a => a.childId === id)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 30)
      setAttendanceHistory(childAttendance)
      
      // Filter debts/payments for this child
      const childPayments = debtsData
        .filter(d => d.childId === id)
        .sort((a, b) => new Date(b.createdAt || b.dueDate) - new Date(a.createdAt || a.dueDate))
      setPaymentHistory(childPayments)
      
      // Filter daily reports for this child
      const childReports = reportsData
        .filter(r => r.childId === id)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10)
      setDailyReports(childReports)
      
      // Get progress data
      const childProgress = progressData.find(p => p.childId === id)
      setProgressData(childProgress)
    } catch (error) {
      // Error handled by UI state
    } finally {
      setLoading(false)
    }
  }

  const awardAchievement = async (achievementId) => {
    try {
      await api.post('/achievements/award', {
        childId: id,
        achievementId
      })
      fetchData()
      setShowAwardModal(false)
      toast.success('Yutuq berildi!')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Xatolik yuz berdi')
    }
  }

  const addPoints = async () => {
    if (!pointsToAdd || parseInt(pointsToAdd) <= 0) {
      toast.warning('Ball miqdorini kiriting')
      return
    }
    try {
      await api.put(`/children/${id}`, {
        points: (child.points || 0) + parseInt(pointsToAdd)
      })
      fetchData()
      setShowPointsModal(false)
      setPointsToAdd('')
      setPointsReason('')
      toast.success('Ball qo\'shildi!')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Xatolik yuz berdi')
    }
  }

  const updateLevel = async (newLevel) => {
    try {
      await api.put(`/children/${id}`, { level: newLevel })
      fetchData()
      toast.success('Daraja yangilandi!')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Xatolik yuz berdi')
    }
  }

  const calculateAge = (birthDate) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const totalPoints = achievements.reduce((sum, a) => sum + (a.points || 0), 0)

  const getLevel = (points) => {
    // CSS variables dan ranglarni olish
    const colors = {
      warning: getComputedStyle(document.documentElement).getPropertyValue('--chart-warning').trim() || '#f59e0b',
      purple: getComputedStyle(document.documentElement).getPropertyValue('--chart-purple').trim() || '#8b5cf6',
      primary: getComputedStyle(document.documentElement).getPropertyValue('--chart-primary').trim() || '#3b82f6',
      success: getComputedStyle(document.documentElement).getPropertyValue('--chart-success').trim() || '#22c55e',
      muted: getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#6b7280'
    }
    
    if (points >= 200) return { level: 5, name: 'Superstar', icon: '👑', color: colors.warning }
    if (points >= 150) return { level: 4, name: 'Champion', icon: '🏆', color: colors.purple }
    if (points >= 100) return { level: 3, name: 'Expert', icon: '⭐', color: colors.primary }
    if (points >= 50) return { level: 2, name: 'Rising Star', icon: '🌟', color: colors.success }
    return { level: 1, name: 'Beginner', icon: '🌱', color: colors.muted }
  }

  const levelInfo = getLevel(totalPoints)
  const nextLevelPoints = [50, 100, 150, 200, 250][levelInfo.level - 1] || 250
  const progress = Math.min((totalPoints / nextLevelPoints) * 100, 100)

  const texts = {
    uz: {
      back: 'Orqaga',
      overview: 'Umumiy',
      attendance: 'Davomat',
      payments: 'To\'lovlar',
      reports: 'Hisobotlar',
      progress: 'Progress',
      age: 'Yosh',
      points: 'Ball',
      medals: 'Medal',
      nextLevel: 'Keyingi daraja',
      group: 'Guruh',
      birthDate: 'Tug\'ilgan sana',
      notAssigned: 'Belgilanmagan',
      achievements: 'Yutuqlar va medallar',
      awardMedal: 'Medal berish',
      noMedals: 'Hali medallar yo\'q',
      giveFirst: 'Bolaga birinchi medalini bering!',
      allEarned: 'Barcha medallar berilgan!',
      cancel: 'Bekor qilish',
      present: 'Keldi',
      absent: 'Kelmadi',
      late: 'Kechikdi',
      paid: 'To\'langan',
      pending: 'Kutilmoqda',
      overdue: 'Muddati o\'tgan',
      noData: 'Ma\'lumot yo\'q',
      attendanceRate: 'Davomat foizi',
      last30Days: 'Oxirgi 30 kun',
      paymentStatus: 'To\'lov holati',
      teacherNotes: 'Tarbiyachi izohlari',
      mood: 'Kayfiyat',
      meals: 'Ovqatlanish',
      sleep: 'Uyqu',
      activities: 'Faoliyatlar',
      skills: 'Ko\'nikmalar',
      addPoints: 'Ball qo\'shish',
      pointsAmount: 'Ball miqdori',
      reason: 'Sabab',
      changeLevel: 'Daraja o\'zgartirish',
      level: 'Daraja'
    },
    ru: {
      back: 'Назад',
      overview: 'Обзор',
      attendance: 'Посещаемость',
      payments: 'Платежи',
      reports: 'Отчеты',
      progress: 'Прогресс',
      age: 'Возраст',
      points: 'Баллы',
      medals: 'Медали',
      nextLevel: 'Следующий уровень',
      group: 'Группа',
      birthDate: 'Дата рождения',
      notAssigned: 'Не назначено',
      achievements: 'Достижения и медали',
      awardMedal: 'Дать медаль',
      noMedals: 'Пока нет медалей',
      giveFirst: 'Дайте ребенку первую медаль!',
      allEarned: 'Все медали получены!',
      cancel: 'Отмена',
      present: 'Присутствовал',
      absent: 'Отсутствовал',
      late: 'Опоздал',
      paid: 'Оплачено',
      pending: 'Ожидается',
      overdue: 'Просрочено',
      noData: 'Нет данных',
      attendanceRate: 'Процент посещаемости',
      last30Days: 'Последние 30 дней',
      paymentStatus: 'Статус оплаты',
      teacherNotes: 'Заметки воспитателя',
      mood: 'Настроение',
      meals: 'Питание',
      sleep: 'Сон',
      activities: 'Активности',
      skills: 'Навыки',
      addPoints: 'Добавить баллы',
      pointsAmount: 'Количество баллов',
      reason: 'Причина',
      changeLevel: 'Изменить уровень',
      level: 'Уровень'
    },
    en: {
      back: 'Back',
      overview: 'Overview',
      attendance: 'Attendance',
      payments: 'Payments',
      reports: 'Reports',
      progress: 'Progress',
      age: 'Age',
      points: 'Points',
      medals: 'Medals',
      nextLevel: 'Next Level',
      group: 'Group',
      birthDate: 'Birth Date',
      notAssigned: 'Not Assigned',
      achievements: 'Achievements & Medals',
      awardMedal: 'Award Medal',
      noMedals: 'No medals yet',
      giveFirst: 'Give the child their first medal!',
      allEarned: 'All medals earned!',
      cancel: 'Cancel',
      present: 'Present',
      absent: 'Absent',
      late: 'Late',
      paid: 'Paid',
      pending: 'Pending',
      overdue: 'Overdue',
      noData: 'No data',
      attendanceRate: 'Attendance Rate',
      last30Days: 'Last 30 days',
      paymentStatus: 'Payment Status',
      teacherNotes: 'Teacher Notes',
      mood: 'Mood',
      meals: 'Meals',
      sleep: 'Sleep',
      activities: 'Activities',
      skills: 'Skills',
      addPoints: 'Add Points',
      pointsAmount: 'Points amount',
      reason: 'Reason',
      changeLevel: 'Change Level',
      level: 'Level'
    }
  }
  const txt = texts[language] || texts.uz

  // Calculate attendance stats
  const attendanceStats = {
    present: attendanceHistory.filter(a => a.status === 'present').length,
    absent: attendanceHistory.filter(a => a.status === 'absent').length,
    total: attendanceHistory.length
  }
  const attendanceRate = attendanceStats.total > 0 
    ? Math.round((attendanceStats.present / attendanceStats.total) * 100) 
    : 0

  // Chart colors from CSS variables
  const chartColorsProfile = {
    success: getComputedStyle(document.documentElement).getPropertyValue('--chart-success').trim() || '#22c55e',
    danger: getComputedStyle(document.documentElement).getPropertyValue('--chart-danger').trim() || '#ef4444',
    primary: getComputedStyle(document.documentElement).getPropertyValue('--chart-primary').trim() || '#667eea'
  }

  // Attendance chart data
  const attendanceChartData = {
    labels: [txt.present, txt.absent],
    datasets: [{
      data: [attendanceStats.present, attendanceStats.absent],
      backgroundColor: [chartColorsProfile.success, chartColorsProfile.danger],
      borderWidth: 0
    }]
  }

  // Payment stats
  const paymentStats = {
    paid: paymentHistory.filter(p => p.status === 'paid').length,
    pending: paymentHistory.filter(p => p.status === 'pending').length,
    totalAmount: paymentHistory.reduce((sum, p) => sum + (p.amount || 0), 0),
    paidAmount: paymentHistory.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.paidAmount || p.amount || 0), 0)
  }

  // Skills radar chart
  const skillsData = progressData?.skills || {
    speech: 70,
    logic: 65,
    physical: 80,
    creative: 75,
    social: 60
  }
  
  const radarChartData = {
    labels: [
      language === 'uz' ? 'Nutq' : language === 'ru' ? 'Речь' : 'Speech',
      language === 'uz' ? 'Mantiq' : language === 'ru' ? 'Логика' : 'Logic',
      language === 'uz' ? 'Jismoniy' : language === 'ru' ? 'Физическое' : 'Physical',
      language === 'uz' ? 'Ijodiy' : language === 'ru' ? 'Творческое' : 'Creative',
      language === 'uz' ? 'Ijtimoiy' : language === 'ru' ? 'Социальное' : 'Social'
    ],
    datasets: [{
      label: txt.skills,
      data: [skillsData.speech, skillsData.logic, skillsData.physical, skillsData.creative, skillsData.social],
      backgroundColor: `${chartColorsProfile.primary}33`,
      borderColor: chartColorsProfile.primary,
      borderWidth: 2,
      pointBackgroundColor: chartColorsProfile.primary
    }]
  }

  const getMoodText = (mood) => {
    const moods = { happy: 'Xursand', calm: 'Tinch', tired: 'Charchagan', sad: 'Xafa', excited: 'Hayajonli' }
    return moods[mood] || 'Oddiy'
  }

  const getMoodEmoji = (mood) => {
    const emojis = { happy: '😊', calm: '😌', tired: '😴', sad: '😢', excited: '🤩', neutral: '😐' }
    return emojis[mood] || '😐'
  }

  const getMealStatus = (ate) => {
    if (ate === 'full') return { text: '100%', color: chartColorsProfile.success }
    if (ate === 'partial') return { text: '50%', color: getComputedStyle(document.documentElement).getPropertyValue('--chart-warning').trim() || '#f59e0b' }
    return { text: '0%', color: chartColorsProfile.danger }
  }

  if (loading) {
    return <Loading text="Yuklanmoqda..." />
  }

  if (!child) {
    return (
      <div className="child-profile-page">
        <p>Bola topilmadi</p>
        <Button onClick={() => navigate('/admin/children')}>Orqaga</Button>
      </div>
    )
  }

  const unearnedAchievements = allAchievements.filter(
    a => !achievements.some(ea => ea.id === a.id)
  )

  return (
    <div className="child-profile-page">
      <div className="profile-header">
        <Button variant="secondary" onClick={() => navigate('/admin/children')}>
          ← {txt.back}
        </Button>
        <h1 className="page-title">360° {language === 'uz' ? 'Bola kartasi' : language === 'ru' ? 'Карта ребенка' : 'Child Card'}</h1>
      </div>

      <div className="profile-layout">
        {/* Left Sidebar - Profile Card */}
        <Card className="profile-card">
          <div className="profile-avatar">
            {child.photo ? (
              <img src={child.photo} alt={child.firstName} />
            ) : (
              <div className="avatar-placeholder">
                {(child.firstName || child.name || '?').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="level-badge" style={{ backgroundColor: levelInfo.color }}>
              {levelInfo.icon} {levelInfo.level}
            </div>
          </div>
          
          <h1 className="profile-name">{child.firstName} {child.lastName}</h1>
          <p className="profile-level" style={{ color: levelInfo.color }}>
            {levelInfo.name}
          </p>
          
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-value">{calculateAge(child.birthDate)}</span>
              <span className="stat-label">{txt.age}</span>
            </div>
            <div className="stat">
              <span className="stat-value">{totalPoints}</span>
              <span className="stat-label">{txt.points}</span>
            </div>
            <div className="stat">
              <span className="stat-value">{achievements.length}</span>
              <span className="stat-label">{txt.medals}</span>
            </div>
          </div>

          <div className="level-progress">
            <div className="progress-header">
              <span>{txt.nextLevel}</span>
              <span>{totalPoints}/{nextLevelPoints}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%`, backgroundColor: levelInfo.color }}
              />
            </div>
          </div>

          <div className="profile-info">
            <p><strong>{txt.group}:</strong> {child.groupName || txt.notAssigned}</p>
            <p><strong>{txt.birthDate}:</strong> {new Date(child.birthDate).toLocaleDateString()}</p>
            {child.parentName && <p><strong>{language === 'uz' ? 'Ota-ona' : 'Родитель'}:</strong> {child.parentName}</p>}
            {child.parentPhone && <p><strong>{language === 'uz' ? 'Telefon' : 'Телефон'}:</strong> {child.parentPhone}</p>}
          </div>

          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="quick-stat" style={{ background: attendanceRate >= 80 ? '#dcfce7' : attendanceRate >= 50 ? '#fef3c7' : '#fee2e2' }}>
              <span className="quick-stat-value">{attendanceRate}%</span>
              <span className="quick-stat-label">{txt.attendance}</span>
            </div>
            <div className="quick-stat" style={{ background: paymentStats.pending === 0 ? '#dcfce7' : '#fee2e2' }}>
              <span className="quick-stat-value">{paymentStats.pending === 0 ? '✓' : paymentStats.pending}</span>
              <span className="quick-stat-label">{txt.payments}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="profile-actions">
            <Button size="small" onClick={() => setShowPointsModal(true)}>
              ⭐ {txt.addPoints}
            </Button>
            <Button size="small" variant="secondary" onClick={() => setShowAwardModal(true)}>
              🏅 {txt.awardMedal}
            </Button>
          </div>
        </Card>

        {/* Right Content - Tabs */}
        <div className="profile-content">
          {/* Tab Navigation */}
          <div className="profile-tabs">
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              {txt.overview}
            </button>
            <button 
              className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
              onClick={() => setActiveTab('attendance')}
            >
              {txt.attendance}
            </button>
            <button 
              className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              {txt.payments}
            </button>
            <button 
              className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              {txt.reports}
            </button>
            <button 
              className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
              onClick={() => setActiveTab('achievements')}
            >
              {txt.medals}
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="overview-tab">
                <div className="overview-grid">
                  {/* Attendance Chart */}
                  <Card className="overview-card">
                    <h3>{txt.attendanceRate}</h3>
                    <p className="subtitle">{txt.last30Days}</p>
                    <div className="chart-container-small">
                      <Doughnut data={attendanceChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                    </div>
                    <div className="attendance-summary">
                      <span className="present">✓ {attendanceStats.present} {txt.present}</span>
                      <span className="absent">✗ {attendanceStats.absent} {txt.absent}</span>
                    </div>
                  </Card>

                  {/* Skills Radar */}
                  <Card className="overview-card">
                    <h3>{txt.skills}</h3>
                    <div className="chart-container-small">
                      <Radar data={radarChartData} options={{ maintainAspectRatio: false, scales: { r: { min: 0, max: 100 } } }} />
                    </div>
                  </Card>

                  {/* Recent Reports */}
                  <Card className="overview-card wide">
                    <h3>📝 {txt.teacherNotes}</h3>
                    {dailyReports.length === 0 ? (
                      <p className="no-data">{txt.noData}</p>
                    ) : (
                      <div className="recent-reports">
                        {dailyReports.slice(0, 3).map(report => (
                          <div key={report.id} className="report-preview">
                            <div className="report-date">{new Date(report.date).toLocaleDateString()}</div>
                            <div className="report-moods">
                              {report.mood && (
                                <>
                                  <span title="Morning">{getMoodEmoji(report.mood.morning)}</span>
                                  <span title="Afternoon">{getMoodEmoji(report.mood.afternoon)}</span>
                                  <span title="Evening">{getMoodEmoji(report.mood.evening)}</span>
                                </>
                              )}
                            </div>
                            <p className="report-note">{report.teacherNotes || '-'}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            )}

            {/* Attendance Tab */}
            {activeTab === 'attendance' && (
              <div className="attendance-tab">
                <Card>
                  <h3>📅 {txt.attendance} - {txt.last30Days}</h3>
                  {attendanceHistory.length === 0 ? (
                    <p className="no-data">{txt.noData}</p>
                  ) : (
                    <div className="attendance-calendar">
                      {attendanceHistory.map(att => (
                        <div 
                          key={att.id} 
                          className={`attendance-day ${att.status}`}
                          title={`${att.date}: ${txt[att.status] || att.status}`}
                        >
                          <span className="day-date">{new Date(att.date).getDate()}</span>
                          <span className="day-status">
                            {att.status === 'present' ? '✓' : att.status === 'absent' ? '✗' : '⏰'}
                          </span>
                          {att.checkIn && <span className="check-time">{att.checkIn.time}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="payments-tab">
                <Card>
                  <h3>{txt.paymentStatus}</h3>
                  <div className="payment-summary">
                    <div className="payment-stat paid">
                      <span className="amount">{(paymentStats.paidAmount / 1000000).toFixed(1)}M</span>
                      <span className="label">{txt.paid}</span>
                    </div>
                    <div className="payment-stat pending">
                      <span className="amount">{((paymentStats.totalAmount - paymentStats.paidAmount) / 1000000).toFixed(1)}M</span>
                      <span className="label">{txt.pending}</span>
                    </div>
                  </div>
                  
                  {paymentHistory.length === 0 ? (
                    <p className="no-data">{txt.noData}</p>
                  ) : (
                    <div className="payment-list">
                      {paymentHistory.map(payment => (
                        <div key={payment.id} className={`payment-item ${payment.status}`}>
                          <div className="payment-info">
                            <span className="payment-month">{payment.month}</span>
                            <span className="payment-amount">{(payment.amount / 1000000).toFixed(1)}M so'm</span>
                          </div>
                          <span className={`payment-status ${payment.status}`}>
                            {txt[payment.status] || payment.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="reports-tab">
                {dailyReports.length === 0 ? (
                  <Card><p className="no-data">{txt.noData}</p></Card>
                ) : (
                  dailyReports.map(report => (
                    <Card key={report.id} className="report-card">
                      <div className="report-header">
                        <h3>{new Date(report.date).toLocaleDateString()}</h3>
                        <div className="mood-icons">
                          {report.mood && (
                            <>
                              <span title="Ertalab">{getMoodText(report.mood.morning)}</span>
                              <span title="Kunduzi">{getMoodText(report.mood.afternoon)}</span>
                              <span title="Kechqurun">{getMoodText(report.mood.evening)}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {report.meals && (
                        <div className="report-section">
                          <h4>{txt.meals}</h4>
                          <div className="meals-grid">
                            {Object.entries(report.meals).map(([meal, data]) => (
                              <div key={meal} className="meal-item">
                                <span className="meal-name">{meal}</span>
                                <span style={{ color: getMealStatus(data.ate).color }}>
                                  {getMealStatus(data.ate).text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {report.sleep && (
                        <div className="report-section">
                          <h4>{txt.sleep}</h4>
                          <p>{report.sleep.slept ? `${report.sleep.duration} min - ${report.sleep.quality}` : 'Uxlamadi'}</p>
                        </div>
                      )}

                      {report.activities && report.activities.length > 0 && (
                        <div className="report-section">
                          <h4>{txt.activities}</h4>
                          <ul className="activities-list">
                            {report.activities.map((act, i) => (
                              <li key={i}>{act.description}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {report.teacherNotes && (
                        <div className="report-section teacher-notes">
                          <h4>{txt.teacherNotes}</h4>
                          <p>{report.teacherNotes}</p>
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div className="achievements-tab">
                <div className="section-header">
                  <h2>{txt.achievements}</h2>
                  <Button onClick={() => setShowAwardModal(true)}>
                    + {txt.awardMedal}
                  </Button>
                </div>

                {achievements.length === 0 ? (
                  <Card className="empty-achievements">
                    <p>{txt.noMedals}</p>
                    <span>{txt.giveFirst}</span>
                  </Card>
                ) : (
                  <div className="achievements-grid">
                    {achievements.map(achievement => (
                      <Card 
                        key={achievement.id} 
                        className="achievement-card"
                        style={{ borderColor: achievement.color }}
                      >
                        <div className="achievement-icon" style={{ backgroundColor: achievement.color }}>
                          {achievement.icon}
                        </div>
                        <h3>{achievement.name?.[language] || achievement.name}</h3>
                        <p>{achievement.description?.[language] || achievement.description}</p>
                        <div className="achievement-meta">
                          <span className="points">+{achievement.points} {txt.points}</span>
                          <span className="date">
                            {new Date(achievement.earnedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Award Modal */}
      {showAwardModal && (
        <div className="modal-overlay" onClick={() => setShowAwardModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{txt.awardMedal}</h2>
            <p>{language === 'uz' ? 'Qaysi medalni bermoqchisiz?' : 'Какую медаль хотите дать?'}</p>
            
            <div className="award-options">
              {unearnedAchievements.map(achievement => (
                <button
                  key={achievement.id}
                  className="award-option"
                  onClick={() => awardAchievement(achievement.id)}
                >
                  <span className="award-icon" style={{ backgroundColor: achievement.color }}>
                    {achievement.icon}
                  </span>
                  <div className="award-info">
                    <strong>{achievement.name?.[language] || achievement.name}</strong>
                    <span>+{achievement.points} {txt.points}</span>
                  </div>
                </button>
              ))}
            </div>

            {unearnedAchievements.length === 0 && (
              <p className="all-earned">{txt.allEarned}</p>
            )}

            <Button variant="secondary" onClick={() => setShowAwardModal(false)}>
              {txt.cancel}
            </Button>
          </div>
        </div>
      )}

      {/* Points Modal */}
      {showPointsModal && (
        <div className="modal-overlay" onClick={() => setShowPointsModal(false)}>
          <div className="modal-content points-modal" onClick={e => e.stopPropagation()}>
            <h2>{txt.addPoints}</h2>
            <p>{child.firstName} {child.lastName}</p>
            <p className="current-points">{language === 'uz' ? 'Hozirgi ball' : 'Текущие баллы'}: <strong>{child.points || 0}</strong></p>
            
            <div className="points-form">
              <input
                type="number"
                placeholder={txt.pointsAmount}
                value={pointsToAdd}
                onChange={(e) => setPointsToAdd(e.target.value)}
                min="1"
                max="100"
              />
              <div className="quick-points">
                <button onClick={() => setPointsToAdd('5')}>+5</button>
                <button onClick={() => setPointsToAdd('10')}>+10</button>
                <button onClick={() => setPointsToAdd('25')}>+25</button>
                <button onClick={() => setPointsToAdd('50')}>+50</button>
              </div>
              <input
                type="text"
                placeholder={txt.reason}
                value={pointsReason}
                onChange={(e) => setPointsReason(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <Button onClick={addPoints}>
                {language === 'uz' ? 'Qo\'shish' : 'Добавить'}
              </Button>
              <Button variant="secondary" onClick={() => setShowPointsModal(false)}>
                {txt.cancel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChildProfilePage
