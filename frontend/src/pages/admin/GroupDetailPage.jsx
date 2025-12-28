/**
 * GroupDetailPage - Guruh tafsilotlari sahifasi
 * 
 * Guruh haqida to'liq ma'lumot, bolalar ro'yxati va jadval
 */
import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { Loading } from '../../components/common'
import api from '../../services/api'
import './GroupDetailPage.css'

// Icons
const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
)

const ChildIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="4"/>
    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
  </svg>
)

const TeacherIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

function GroupDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { language } = useLanguage()
  
  const [loading, setLoading] = useState(true)
  const [group, setGroup] = useState(null)
  const [children, setChildren] = useState([])
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('children')
  const [searchQuery, setSearchQuery] = useState('')

  const texts = {
    uz: {
      back: 'Orqaga',
      children: 'Bolalar',
      schedule: 'Jadval',
      teacher: 'Tarbiyachi',
      notAssigned: 'Tayinlanmagan',
      capacity: 'Sig\'im',
      occupied: 'Band',
      ageRange: 'Yosh oralig\'i',
      search: 'Qidirish...',
      noChildren: 'Bu guruhda bolalar yo\'q',
      viewProfile: 'Profilni ko\'rish',
      edit: 'Tahrirlash',
      notFound: 'Guruh topilmadi',
      loadError: 'Ma\'lumotlarni yuklashda xatolik'
    },
    ru: {
      back: 'Назад',
      children: 'Дети',
      schedule: 'Расписание',
      teacher: 'Воспитатель',
      notAssigned: 'Не назначен',
      capacity: 'Вместимость',
      occupied: 'Занято',
      ageRange: 'Возраст',
      search: 'Поиск...',
      noChildren: 'В этой группе нет детей',
      viewProfile: 'Просмотр профиля',
      edit: 'Редактировать',
      notFound: 'Группа не найдена',
      loadError: 'Ошибка загрузки данных'
    },
    en: {
      back: 'Back',
      children: 'Children',
      schedule: 'Schedule',
      teacher: 'Teacher',
      notAssigned: 'Not assigned',
      capacity: 'Capacity',
      occupied: 'Occupied',
      ageRange: 'Age range',
      search: 'Search...',
      noChildren: 'No children in this group',
      viewProfile: 'View profile',
      edit: 'Edit',
      notFound: 'Group not found',
      loadError: 'Error loading data'
    }
  }

  const txt = texts[language] || texts.uz

  // Yoshni hisoblash funksiyasi
  const calculateAge = (birthDate) => {
    if (!birthDate) return null
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  // Bola ismini olish funksiyasi
  const getChildName = (child) => {
    if (child.name) return child.name
    if (child.firstName && child.lastName) return `${child.firstName} ${child.lastName}`
    if (child.firstName) return child.firstName
    return txt.notAssigned
  }

  const fetchGroupData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Guruh ma'lumotlarini olish
      const groupRes = await api.get(`/groups/${id}`)
      const groupData = groupRes.data?.data || groupRes.data

      if (!groupData) {
        setError(txt.notFound)
        return
      }

      setGroup(groupData)

      // Bolalarni guruh ID bo'yicha olish
      const childrenRes = await api.get('/children', { params: { groupId: id } })
      const childrenData = childrenRes.data?.data || childrenRes.data || []

      // Bolalar ma'lumotlarini formatlash
      const formattedChildren = (Array.isArray(childrenData) ? childrenData : []).map(child => ({
        ...child,
        name: getChildName(child),
        age: child.age || calculateAge(child.birthDate)
      }))
      
      setChildren(formattedChildren)
    } catch (err) {
      console.error('Error fetching group:', err)
      setError(txt.loadError)
    } finally {
      setLoading(false)
    }
  }, [id, txt.notFound, txt.loadError, txt.notAssigned])

  useEffect(() => {
    if (id) {
      fetchGroupData()
    }
  }, [id, fetchGroupData])

  const filteredChildren = children.filter(child => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    const fullName = child.name || `${child.firstName || ''} ${child.lastName || ''}`
    return fullName.toLowerCase().includes(query)
  })

  const capacityPercentage = group ? Math.round((children.length / group.capacity) * 100) : 0

  if (loading) {
    return (
      <div className="group-detail-page">
        <Loading />
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className="group-detail-page">
        <div className="group-detail-error">
          <h2>😕</h2>
          <p>{error || txt.notFound}</p>
          <button onClick={() => navigate('/admin/groups')} className="back-btn">
            <BackIcon /> {txt.back}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="group-detail-page">
      {/* Header */}
      <div className="group-detail-header">
        <button onClick={() => navigate('/admin/groups')} className="back-btn">
          <BackIcon /> {txt.back}
        </button>
        <div className="group-detail-title">
          <h1>{group.name}</h1>
          <span className="group-age-badge">{group.ageRange}</span>
        </div>
        <button onClick={() => navigate(`/admin/groups`)} className="edit-btn">
          <EditIcon /> {txt.edit}
        </button>
      </div>

      {/* Stats */}
      <div className="group-detail-stats">
        <div className="stat-card">
          <div className="stat-icon children-icon"><ChildIcon /></div>
          <div className="stat-info">
            <span className="stat-value">{children.length}</span>
            <span className="stat-label">{txt.children}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon capacity-icon"><ChildIcon /></div>
          <div className="stat-info">
            <span className="stat-value">{group.capacity}</span>
            <span className="stat-label">{txt.capacity}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon occupied-icon"><CalendarIcon /></div>
          <div className="stat-info">
            <span className="stat-value">{capacityPercentage}%</span>
            <span className="stat-label">{txt.occupied}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon teacher-icon"><TeacherIcon /></div>
          <div className="stat-info">
            <span className="stat-value">{group.teacherName || txt.notAssigned}</span>
            <span className="stat-label">{txt.teacher}</span>
          </div>
        </div>
      </div>

      {/* Capacity Bar */}
      <div className="capacity-bar-container">
        <div className="capacity-bar">
          <div 
            className={`capacity-fill ${capacityPercentage >= 100 ? 'full' : capacityPercentage >= 80 ? 'warning' : ''}`}
            style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
          />
        </div>
        <span className="capacity-text">{children.length} / {group.capacity} {txt.children.toLowerCase()}</span>
      </div>

      {/* Tabs */}
      <div className="group-detail-tabs">
        <button 
          className={`tab-btn ${activeTab === 'children' ? 'active' : ''}`}
          onClick={() => setActiveTab('children')}
        >
          <ChildIcon /> {txt.children} ({children.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          <CalendarIcon /> {txt.schedule}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'children' && (
        <div className="children-section">
          <div className="children-header">
            <input
              type="text"
              className="search-input"
              placeholder={txt.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {filteredChildren.length === 0 ? (
            <div className="empty-children">
              <span className="empty-icon">👶</span>
              <p>{txt.noChildren}</p>
            </div>
          ) : (
            <div className="children-grid">
              {filteredChildren.map((child, index) => {
                const childId = child.id || child._id
                const childName = child.name || `${child.firstName || ''} ${child.lastName || ''}`.trim()
                const childAge = child.age || calculateAge(child.birthDate)
                const firstLetter = childName?.charAt(0) || (child.firstName?.charAt(0)) || '?'
                
                return (
                  <motion.div
                    key={childId || `child-${index}`}
                    className="child-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      if (childId) {
                        navigate(`/admin/children/${childId}`)
                      } else {
                        console.warn('Child ID not found:', child)
                      }
                    }}
                    style={{ cursor: childId ? 'pointer' : 'default' }}
                  >
                    <div className="child-avatar">
                      {child.photo ? (
                        <img src={child.photo} alt={childName} />
                      ) : (
                        <span>{firstLetter}</span>
                      )}
                    </div>
                    <div className="child-info">
                      <h4>{childName || txt.notAssigned}</h4>
                      <p>{childAge ? `${childAge} yosh` : '-'}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="schedule-section">
          <div className="schedule-placeholder">
            <CalendarIcon />
            <p>Jadval tez orada qo'shiladi</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default GroupDetailPage
