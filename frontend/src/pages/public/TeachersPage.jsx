import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { motion } from 'framer-motion'
import PropTypes from 'prop-types'
import { useLanguage } from '../../context/LanguageContext'
import { Loading } from '../../components/common'
import { FadeUp, SlideLeft, SlideRight, ScaleIn, WaveDivider } from '../../components/animations'
import api from '../../services/api'
import './TeachersPage.css'

const CATEGORIES = [
  { id: 'all', label: { uz: 'Barchasi', ru: 'Все', en: 'All' } },
  { id: 'teacher', label: { uz: 'Tarbiyachilar', ru: 'Воспитатели', en: 'Teachers' } },
  { id: 'specialist', label: { uz: 'Mutaxassislar', ru: 'Специалисты', en: 'Specialists' } },
  { id: 'medical', label: { uz: 'Tibbiyot', ru: 'Медицина', en: 'Medical' } },
  { id: 'staff', label: { uz: 'Xodimlar', ru: 'Персонал', en: 'Staff' } }
]

const PAGE_TEXTS = {
  uz: {
    title: 'Bizning Jamoamiz',
    subtitle: 'Farzandlaringiz uchun eng yaxshi tarbiya va ta\'limni ta\'minlaydigan professional jamoa',
    teachers: 'Guruh Tarbiyachilari',
    specialists: 'Mutaxassislar',
    medicalStaff: 'Tibbiyot va Xizmat Ko\'rsatish',
    staff: 'Xodimlar',
    groups: 'Guruhlar',
    experience: 'Yillik tajriba',
    withLove: 'Mehr bilan',
    error: 'Xodimlar ma\'lumotlarini yuklashda xatolik',
    retry: 'Qayta urinish'
  },
  ru: {
    title: 'Наша Команда',
    subtitle: 'Профессиональная команда, обеспечивающая лучшее воспитание и образование для ваших детей',
    teachers: 'Воспитатели Групп',
    specialists: 'Специалисты',
    medicalStaff: 'Медицина и Обслуживание',
    staff: 'Сотрудников',
    groups: 'Групп',
    experience: 'Лет опыта',
    withLove: 'С любовью',
    error: 'Ошибка загрузки данных сотрудников',
    retry: 'Повторить'
  },
  en: {
    title: 'Our Team',
    subtitle: 'Professional team providing the best care and education for your children',
    teachers: 'Group Teachers',
    specialists: 'Specialists',
    medicalStaff: 'Medical & Support Staff',
    staff: 'Staff Members',
    groups: 'Groups',
    experience: 'Years Experience',
    withLove: 'With Love',
    error: 'Error loading staff data',
    retry: 'Try Again'
  }
}

const StaffCard = memo(function StaffCard({ staff, index, language }) {
  const getLocalizedText = useCallback((obj) => {
    if (!obj) return ''
    if (typeof obj === 'string') return obj
    return obj[language] || obj.uz || obj.en || ''
  }, [language])

  return (
    <motion.div 
      className="staff-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10, boxShadow: 'var(--shadow-lg)' }}
    >
      <div className="staff-image-wrapper">
        <img src={staff.photo} alt={staff.name} className="staff-image" loading="lazy" />
        {staff.group && <span className="staff-group-badge">{staff.group}</span>}
      </div>
      <div className="staff-info">
        <h3 className="staff-name">{staff.name}</h3>
        <p className="staff-role">{getLocalizedText(staff.role)}</p>
        <p className="staff-experience"><span className="experience-icon">⏱️</span>{getLocalizedText(staff.experience)}</p>
        <p className="staff-education"><span className="education-icon">🎓</span>{getLocalizedText(staff.education)}</p>
        <p className="staff-bio">{getLocalizedText(staff.bio)}</p>
      </div>
    </motion.div>
  )
})

StaffCard.propTypes = {
  staff: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  language: PropTypes.string.isRequired
}

const StaffSection = memo(function StaffSection({ title, icon, staff, language }) {
  if (staff.length === 0) return null
  
  return (
    <section className="staff-section">
      <div className="staff-container">
        <FadeUp>
          <h2 className="section-title"><span className="section-icon">{icon}</span>{title}</h2>
        </FadeUp>
        <div className="staff-grid">
          {staff.map((person, index) => (
            <StaffCard key={person.id} staff={person} index={index} language={language} />
          ))}
        </div>
      </div>
    </section>
  )
})

StaffSection.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  staff: PropTypes.array.isRequired,
  language: PropTypes.string.isRequired
}

function TeachersPage() {
  const { language } = useLanguage()
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')

  const txt = useMemo(() => PAGE_TEXTS[language], [language])

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true)
        const response = await api.get('/teachers')
        
        // API to'g'ridan-to'g'ri array qaytaradi
        let data = []
        if (Array.isArray(response.data)) {
          data = response.data
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          data = response.data.data
        } else if (response.data && typeof response.data === 'object') {
          // Agar object bo'lsa, values ni olish
          data = Object.values(response.data).filter(item => item && typeof item === 'object' && item.name)
        }
        
        setStaff(data)
        setError(null)
      } catch (err) {
        console.error('[TeachersPage] Error:', err)
        console.error('[TeachersPage] Error response:', err.response)
        setError(txt.error)
        setStaff([])
      } finally {
        setLoading(false)
      }
    }
    fetchStaff()
  }, [txt.error])

  const { filteredStaff, groupedByCategory, hasCategories } = useMemo(() => {
    
    const grouped = {
      teacher: staff.filter(s => s.category === 'teacher'),
      specialist: staff.filter(s => s.category === 'specialist'),
      medical: staff.filter(s => s.category === 'medical'),
      staff: staff.filter(s => s.category === 'staff')
    }
    
    const hasAnyCategory = grouped.teacher.length > 0 || 
                           grouped.specialist.length > 0 || 
                           grouped.medical.length > 0 || 
                           grouped.staff.length > 0
    
    const filtered = activeCategory === 'all' ? staff : staff.filter(s => s.category === activeCategory)
    return { filteredStaff: filtered, groupedByCategory: grouped, hasCategories: hasAnyCategory }
  }, [staff, activeCategory])

  if (loading) return <div className="staff-page"><Loading /></div>

  if (error) {
    return (
      <div className="staff-page">
        <div className="staff-error">
          <p>❌ {error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">🔄 {txt.retry}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="staff-page">
      <section className="staff-hero">
        <div className="staff-container">
          <FadeUp><h1 className="staff-title">{txt.title}</h1></FadeUp>
          <FadeUp delay={0.2}><p className="staff-subtitle">{txt.subtitle}</p></FadeUp>
        </div>
      </section>

      <WaveDivider color="var(--bg-secondary)" />

      <section className="staff-filter-section">
        <div className="staff-container">
          <div className="category-filters">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label[language]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {activeCategory === 'all' ? (
        <>
          {/* Agar category bo'yicha guruhlar bo'sh bo'lsa, barcha staff'ni ko'rsatish */}
          {!hasCategories && staff.length > 0 ? (
            <section className="staff-section">
              <div className="staff-container">
                <FadeUp>
                  <h2 className="section-title"><span className="section-icon">👩‍🏫</span>{txt.teachers}</h2>
                </FadeUp>
                <div className="staff-grid">
                  {staff.map((person, index) => (
                    <StaffCard key={person.id || person._id || index} staff={person} index={index} language={language} />
                  ))}
                </div>
              </div>
            </section>
          ) : hasCategories ? (
            <>
              <StaffSection title={txt.teachers} icon="👩‍🏫" staff={groupedByCategory.teacher} language={language} />
              <WaveDivider color="var(--bg-primary)" flip />
              <StaffSection title={txt.specialists} icon="🎯" staff={groupedByCategory.specialist} language={language} />
              <WaveDivider color="var(--bg-secondary)" />
              <StaffSection title={txt.medicalStaff} icon="🏥" staff={[...groupedByCategory.medical, ...groupedByCategory.staff]} language={language} />
            </>
          ) : null}
        </>
      ) : (
        <section className="staff-section">
          <div className="staff-container">
            <div className="staff-grid">
              {filteredStaff.map((person, index) => (
                <StaffCard key={person.id} staff={person} index={index} language={language} />
              ))}
            </div>
          </div>
        </section>
      )}

      <WaveDivider color="var(--bg-primary)" flip />

      <section className="staff-stats">
        <div className="staff-container">
          <div className="stats-grid">
            <SlideLeft><div className="stat-card"><span className="stat-number">{staff.length}</span><span className="stat-label">{txt.staff}</span></div></SlideLeft>
            <ScaleIn delay={0.1}><div className="stat-card"><span className="stat-number">3</span><span className="stat-label">{txt.groups}</span></div></ScaleIn>
            <ScaleIn delay={0.2}><div className="stat-card"><span className="stat-number">100+</span><span className="stat-label">{txt.experience}</span></div></ScaleIn>
            <SlideRight delay={0.3}><div className="stat-card"><span className="stat-number">❤️</span><span className="stat-label">{txt.withLove}</span></div></SlideRight>
          </div>
        </div>
      </section>
    </div>
  )
}

export default TeachersPage
