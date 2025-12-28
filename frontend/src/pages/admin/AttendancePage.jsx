import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { Button, Card, Loading } from '../../components/common'
import { useToast } from '../../components/common/Toast'
import api from '../../services/api'
import './AttendancePage.css'

// SVG Icons
const CheckCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)

const XCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
)

const ClockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)

const ChartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
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

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)

const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
)

const CheckInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
)

const CheckOutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

function AttendancePage() {
  const { user, logout } = useAuth()
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const toast = useToast()
  const [attendance, setAttendance] = useState([])
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('all')
  const [loading, setLoading] = useState(true)
  const [checkModal, setCheckModal] = useState(null)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [heatmapData, setHeatmapData] = useState([])
  const [children, setChildren] = useState([])

  const texts = {
    uz: {
      title: 'Davomat',
      allGroups: 'Barcha guruhlar',
      present: 'Keldi',
      absent: 'Kelmadi',
      notMarked: 'Belgilanmagan',
      checkIn: 'Keldi',
      checkOut: 'Ketdi',
      markAbsent: 'Kelmadi',
      checkedIn: 'Kelgan',
      checkedOut: 'Ketgan',
      by: 'Kim olib keldi/ketdi',
      stats: 'Statistika',
      presentCount: 'Kelganlar',
      absentCount: 'Kelmaganlar',
      notMarkedCount: 'Belgilanmagan',
      time: 'Vaqt',
      heatmap: 'Heatmap',
      last30Days: 'Oxirgi 30 kun',
      showHeatmap: 'Heatmap ko\'rish',
      hideHeatmap: 'Yopish',
      sendTelegram: 'Telegramga yuborish'
    },
    ru: {
      title: 'Посещаемость',
      allGroups: 'Все группы',
      present: 'Присутствует',
      absent: 'Отсутствует',
      notMarked: 'Не отмечен',
      checkIn: 'Пришел',
      checkOut: 'Ушел',
      markAbsent: 'Отсутствует',
      checkedIn: 'Пришел',
      checkedOut: 'Ушел',
      by: 'Кто привел/забрал',
      stats: 'Статистика',
      presentCount: 'Присутствуют',
      absentCount: 'Отсутствуют',
      notMarkedCount: 'Не отмечены',
      time: 'Время',
      heatmap: 'Тепловая карта',
      last30Days: 'Последние 30 дней',
      showHeatmap: 'Показать тепловую карту',
      hideHeatmap: 'Скрыть',
      sendTelegram: 'Отправить в Telegram'
    },
    en: {
      title: 'Attendance',
      allGroups: 'All groups',
      present: 'Present',
      absent: 'Absent',
      notMarked: 'Not marked',
      checkIn: 'Check In',
      checkOut: 'Check Out',
      markAbsent: 'Mark Absent',
      checkedIn: 'Checked In',
      checkedOut: 'Checked Out',
      by: 'Brought/Picked by',
      stats: 'Statistics',
      presentCount: 'Present',
      absentCount: 'Absent',
      notMarkedCount: 'Not marked',
      time: 'Time',
      heatmap: 'Heatmap',
      last30Days: 'Last 30 days',
      showHeatmap: 'Show Heatmap',
      hideHeatmap: 'Hide',
      sendTelegram: 'Send to Telegram'
    }
  }

  const txt = texts[language]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [attRes, groupsRes, allAttRes, childrenRes] = await Promise.all([
        api.get('/attendance/today'),
        api.get('/groups'),
        api.get('/attendance'),
        api.get('/children')
      ])
      // Handle API response format
      const attData = attRes.data?.data || (Array.isArray(attRes.data) ? attRes.data : [])
      const groupsData = groupsRes.data?.data || (Array.isArray(groupsRes.data) ? groupsRes.data : [])
      const childrenData = childrenRes.data?.data || (Array.isArray(childrenRes.data) ? childrenRes.data : [])
      const allAttData = allAttRes.data?.data || (Array.isArray(allAttRes.data) ? allAttRes.data : [])
      
      setAttendance(attData)
      setGroups(groupsData)
      setChildren(childrenData)
      
      // Process heatmap data - last 30 days
      const last30Days = []
      const today = new Date()
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        last30Days.push(date.toISOString().split('T')[0])
      }
      setHeatmapData({ dates: last30Days, attendance: allAttData })
    } catch (error) {
      // Error handled by UI state
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async (childId, by) => {
    try {
      await api.post('/attendance/checkin', { childId, by })
      fetchData()
      setCheckModal(null)
      toast.success('Keldi belgilandi!')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Xatolik')
    }
  }

  const handleCheckOut = async (childId, by) => {
    try {
      await api.post('/attendance/checkout', { childId, by })
      fetchData()
      setCheckModal(null)
      toast.success('Ketdi belgilandi!')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Xatolik')
    }
  }

  const handleMarkAbsent = async (childId) => {
    try {
      await api.post('/attendance/absent', { childId, reason: '' })
      fetchData()
      toast.info('Kelmadi belgilandi')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Xatolik')
    }
  }

  const handleSendTelegram = async () => {
    try {
      await api.post('/telegram/send-attendance')
      toast.success('Davomat hisoboti Telegramga yuborildi!')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Xatolik')
    }
  }

  const filteredAttendance = selectedGroup === 'all' 
    ? attendance 
    : attendance.filter(a => a.groupId === selectedGroup)

  const stats = {
    present: filteredAttendance.filter(a => a.status === 'present').length,
    absent: filteredAttendance.filter(a => a.status === 'absent').length,
    notMarked: filteredAttendance.filter(a => a.status === 'not_marked').length
  }

  if (loading) {
    return <div className="attendance-page"><Loading /></div>
  }

  return (
    <div className="attendance-page">
      <div className="attendance-header">
        <div className="header-left">
          <Button variant="secondary" onClick={() => navigate('/admin/dashboard')}>
            <BackIcon /> {t('back')}
          </Button>
          <h1><CheckCircleIcon /> {txt.title}</h1>
          <span className="today-date">{new Date().toLocaleDateString('uz-UZ')}</span>
        </div>
        <div className="header-right">
          <Button onClick={handleSendTelegram}><SendIcon /> {txt.sendTelegram}</Button>
          <span>{t('welcome')}, {user?.username}</span>
          <Button variant="secondary" onClick={logout}>{t('logout')}</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="attendance-stats">
        <Card className="stat-card stat-present">
          <span className="stat-icon"><CheckCircleIcon /></span>
          <div>
            <h3>{stats.present}</h3>
            <p>{txt.presentCount}</p>
          </div>
        </Card>
        <Card className="stat-card stat-absent">
          <span className="stat-icon"><XCircleIcon /></span>
          <div>
            <h3>{stats.absent}</h3>
            <p>{txt.absentCount}</p>
          </div>
        </Card>
        <Card className="stat-card stat-not-marked">
          <span className="stat-icon"><ClockIcon /></span>
          <div>
            <h3>{stats.notMarked}</h3>
            <p>{txt.notMarkedCount}</p>
          </div>
        </Card>
      </div>

      {/* Heatmap Toggle */}
      <div className="heatmap-toggle">
        <Button 
          variant={showHeatmap ? 'primary' : 'secondary'} 
          onClick={() => setShowHeatmap(!showHeatmap)}
        >
          <ChartIcon /> {showHeatmap ? txt.hideHeatmap : txt.showHeatmap}
        </Button>
      </div>

      {/* Attendance Heatmap */}
      {showHeatmap && heatmapData.dates && (
        <Card className="heatmap-card">
          <h3><CalendarIcon /> {txt.heatmap} - {txt.last30Days}</h3>
          <div className="heatmap-container">
            <div className="heatmap-header">
              <div className="heatmap-name-col"></div>
              {heatmapData.dates.map(date => (
                <div key={date} className="heatmap-date" title={date}>
                  {new Date(date).getDate()}
                </div>
              ))}
            </div>
            <div className="heatmap-body">
              {children.filter(c => c.isActive).slice(0, 15).map(child => {
                const childAtt = heatmapData.attendance.filter(a => a.childId === child.id)
                return (
                  <div key={child.id} className="heatmap-row">
                    <div className="heatmap-name">{child.firstName}</div>
                    {heatmapData.dates.map(date => {
                      const dayAtt = childAtt.find(a => a.date === date)
                      const status = dayAtt?.status || 'none'
                      return (
                        <div 
                          key={date} 
                          className={`heatmap-cell ${status}`}
                          title={`${child.firstName}: ${date} - ${status}`}
                        />
                      )
                    })}
                  </div>
                )
              })}
            </div>
            <div className="heatmap-legend">
              <span><span className="legend-box present"></span> {txt.present}</span>
              <span><span className="legend-box absent"></span> {txt.absent}</span>
              <span><span className="legend-box none"></span> {txt.notMarked}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Filter */}
      <div className="attendance-filter">
        <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
          <option value="all">{txt.allGroups}</option>
          {groups.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      {/* Attendance List */}
      <div className="attendance-grid">
        {filteredAttendance.map(item => (
          <Card key={item.childId} className={`attendance-card status-${item.status}`}>
            <div className="child-info">
              <div className="child-avatar">
                {item.photo ? (
                  <img src={item.photo} alt={item.childName} />
                ) : (
                  <span>{item.childName.split(' ').map(n => n[0]).join('')}</span>
                )}
              </div>
              <div className="child-details">
                <h3>{item.childName}</h3>
                <span className={`status-badge ${item.status}`}>
                  {item.status === 'present' ? txt.present : 
                   item.status === 'absent' ? txt.absent : txt.notMarked}
                </span>
              </div>
            </div>

            {item.attendance && (
              <div className="attendance-times">
                {item.attendance.checkIn && (
                  <div className="time-item checkin">
                    <span><CheckInIcon /> {txt.checkedIn}: {item.attendance.checkIn.time}</span>
                    {item.attendance.checkIn.by && <small>{item.attendance.checkIn.by}</small>}
                  </div>
                )}
                {item.attendance.checkOut && (
                  <div className="time-item checkout">
                    <span><CheckOutIcon /> {txt.checkedOut}: {item.attendance.checkOut.time}</span>
                    {item.attendance.checkOut.by && <small>{item.attendance.checkOut.by}</small>}
                  </div>
                )}
              </div>
            )}

            <div className="attendance-actions">
              {item.status === 'not_marked' && (
                <>
                  <Button size="small" onClick={() => setCheckModal({ type: 'checkin', childId: item.childId, name: item.childName })}>
                    <CheckInIcon /> {txt.checkIn}
                  </Button>
                  <Button size="small" variant="secondary" onClick={() => handleMarkAbsent(item.childId)}>
                    {txt.markAbsent}
                  </Button>
                </>
              )}
              {item.status === 'present' && !item.attendance?.checkOut && (
                <Button size="small" variant="secondary" onClick={() => setCheckModal({ type: 'checkout', childId: item.childId, name: item.childName })}>
                  <CheckOutIcon /> {txt.checkOut}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Check Modal */}
      {checkModal && (
        <div className="modal-overlay" onClick={() => setCheckModal(null)}>
          <div className="check-modal" onClick={e => e.stopPropagation()}>
            <h3>{checkModal.type === 'checkin' ? txt.checkIn : txt.checkOut}</h3>
            <p>{checkModal.name}</p>
            <input 
              type="text" 
              placeholder={txt.by}
              id="byInput"
              autoFocus
            />
            <div className="modal-actions">
              <Button onClick={() => {
                const by = document.getElementById('byInput').value
                if (checkModal.type === 'checkin') {
                  handleCheckIn(checkModal.childId, by)
                } else {
                  handleCheckOut(checkModal.childId, by)
                }
              }}>
                <CheckCircleIcon /> {t('save')}
              </Button>
              <Button variant="secondary" onClick={() => setCheckModal(null)}>
                {t('cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AttendancePage
