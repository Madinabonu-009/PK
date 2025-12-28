import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { Button, Card, Loading } from '../../components/common'
import api from '../../services/api'
import './TeacherDashboard.css'

// Professional SVG Icons
const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)

const XCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
)

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)

const ClipboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
)

const FrownIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
    <line x1="9" y1="9" x2="9.01" y2="9"/>
    <line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
)

function TeacherDashboard() {
  const { user, logout } = useAuth()
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [group, setGroup] = useState(null)
  const [children, setChildren] = useState([])
  const [todayAttendance, setTodayAttendance] = useState([])
  const [todayReports, setTodayReports] = useState([])

  const texts = {
    uz: {
      title: "O'qituvchi Paneli",
      myGroup: 'Mening guruhim',
      todayAttendance: 'Bugungi davomat',
      todayReports: 'Bugungi hisobotlar',
      present: 'Keldi',
      absent: 'Kelmadi',
      notMarked: 'Belgilanmagan',
      markAttendance: 'Davomat belgilash',
      writeReport: 'Hisobot yozish',
      children: 'Bolalar',
      noGroup: 'Sizga guruh biriktirilmagan'
    },
    ru: {
      title: 'Панель воспитателя',
      myGroup: 'Моя группа',
      todayAttendance: 'Посещаемость сегодня',
      todayReports: 'Отчеты сегодня',
      present: 'Присутствует',
      absent: 'Отсутствует',
      notMarked: 'Не отмечен',
      markAttendance: 'Отметить посещаемость',
      writeReport: 'Написать отчет',
      children: 'Дети',
      noGroup: 'Вам не назначена группа'
    },
    en: {
      title: 'Teacher Panel',
      myGroup: 'My Group',
      todayAttendance: 'Today\'s Attendance',
      todayReports: 'Today\'s Reports',
      present: 'Present',
      absent: 'Absent',
      notMarked: 'Not marked',
      markAttendance: 'Mark Attendance',
      writeReport: 'Write Report',
      children: 'Children',
      noGroup: 'No group assigned to you'
    }
  }

  const txt = texts[language]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // O'qituvchining guruhini topish (teacherId yoki groupId orqali)
      const groupsRes = await api.get('/groups')
      const groupsData = groupsRes.data?.data || (Array.isArray(groupsRes.data) ? groupsRes.data : [])
      const teacherGroup = groupsData.find(g => 
        g.teacherId === user?.id || g.id === user?.groupId
      )
      
      if (teacherGroup) {
        setGroup(teacherGroup)
        
        // Guruh bolalari
        const childrenRes = await api.get('/children')
        const childrenData = childrenRes.data?.data || (Array.isArray(childrenRes.data) ? childrenRes.data : [])
        const groupChildren = childrenData.filter(c => c.groupId === teacherGroup.id)
        setChildren(groupChildren)
        
        // Bugungi davomat
        const attendanceRes = await api.get(`/attendance/group/${teacherGroup.id}`)
        const attendanceData = attendanceRes.data?.data || (Array.isArray(attendanceRes.data) ? attendanceRes.data : [])
        setTodayAttendance(attendanceData)
        
        // Bugungi hisobotlar
        const today = new Date().toISOString().split('T')[0]
        const reportsRes = await api.get(`/daily-reports?date=${today}&groupId=${teacherGroup.id}`)
        const reportsData = reportsRes.data?.data || (Array.isArray(reportsRes.data) ? reportsRes.data : [])
        setTodayReports(reportsData)
      }
    } catch (error) {
      // Error handled by UI state
    } finally {
      setLoading(false)
    }
  }

  const attendanceStats = {
    present: todayAttendance.filter(a => a.status === 'present').length,
    absent: todayAttendance.filter(a => a.status === 'absent').length,
    notMarked: todayAttendance.filter(a => a.status === 'not_marked').length
  }

  if (loading) return <div className="teacher-dashboard"><Loading /></div>

  if (!group) {
    return (
      <div className="teacher-dashboard">
        <div className="no-group">
          <h2><FrownIcon /> {txt.noGroup}</h2>
          <Button onClick={logout}>{t('logout')}</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="teacher-dashboard">
      <div className="teacher-header">
        <div className="header-left">
          <h1><UserIcon /> {txt.title}</h1>
          <span className="group-badge"><UsersIcon /> {group.name}</span>
        </div>
        <div className="header-right">
          <span>{t('welcome')}, {user?.username}</span>
          <Button variant="secondary" onClick={logout}>{t('logout')}</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="teacher-stats">
        <Card className="stat-card">
          <span className="stat-icon"><UsersIcon /></span>
          <div>
            <h3>{children.length}</h3>
            <p>{txt.children}</p>
          </div>
        </Card>
        <Card className="stat-card stat-present">
          <span className="stat-icon"><CheckCircleIcon /></span>
          <div>
            <h3>{attendanceStats.present}</h3>
            <p>{txt.present}</p>
          </div>
        </Card>
        <Card className="stat-card stat-absent">
          <span className="stat-icon"><XCircleIcon /></span>
          <div>
            <h3>{attendanceStats.absent}</h3>
            <p>{txt.absent}</p>
          </div>
        </Card>
        <Card className="stat-card stat-pending">
          <span className="stat-icon"><ClockIcon /></span>
          <div>
            <h3>{attendanceStats.notMarked}</h3>
            <p>{txt.notMarked}</p>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Button onClick={() => navigate('/admin/attendance')}>
          <CheckCircleIcon /> {txt.markAttendance}
        </Button>
        <Button onClick={() => navigate('/admin/daily-reports')}>
          <ClipboardIcon /> {txt.writeReport}
        </Button>
      </div>

      {/* Today's Attendance */}
      <Card className="section-card">
        <h2>{txt.todayAttendance}</h2>
        <div className="attendance-list">
          {todayAttendance.map(item => (
            <div key={item.childId} className={`attendance-item status-${item.status}`}>
              <div className="child-avatar">
                {item.childName?.split(' ').map(n => n[0]).join('')}
              </div>
              <span className="child-name">{item.childName}</span>
              <span className={`status-badge ${item.status}`}>
                {item.status === 'present' ? <CheckCircleIcon /> : item.status === 'absent' ? <XCircleIcon /> : <ClockIcon />}
              </span>
              {item.attendance?.checkIn && (
                <span className="check-time">{item.attendance.checkIn.time}</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Today's Reports */}
      <Card className="section-card">
        <h2>{txt.todayReports}</h2>
        <div className="reports-summary">
          <p>
            <ClipboardIcon /> {todayReports.length} / {children.length} {language === 'uz' ? 'hisobot yozilgan' : 'reports written'}
          </p>
          {children.filter(c => !todayReports.find(r => r.childId === c.id)).length > 0 && (
            <div className="missing-reports">
              <p>{language === 'uz' ? 'Hisobot yozilmagan:' : 'Missing reports:'}</p>
              {children
                .filter(c => !todayReports.find(r => r.childId === c.id))
                .map(c => (
                  <span key={c.id} className="missing-child">{c.firstName}</span>
                ))
              }
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default TeacherDashboard
