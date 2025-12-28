import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import api from '../../services/api'
import './OurChildrenPage.css'

const OurChildrenPage = () => {
  const { language } = useLanguage()
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedChild, setSelectedChild] = useState(null)
  const [activeGroup, setActiveGroup] = useState('all')
  const [groups, setGroups] = useState([])

  const texts = {
    uz: {
      title: "Bizning Bolalar",
      subtitle: "Play Kids bog'chasining yulduzlari",
      all: "Barchasi",
      age: "yosh",
      group: "Guruh",
      achievements: "Yutuqlar",
      skills: "Ko'nikmalar",
      interests: "Qiziqishlari",
      close: "Yopish",
      noChildren: "Hozircha bolalar yo'q",
      loading: "Yuklanmoqda...",
      level: "Daraja",
      points: "Ball"
    },
    ru: {
      title: "Наши Дети",
      subtitle: "Звёзды детского сада Play Kids",
      all: "Все",
      age: "лет",
      group: "Группа",
      achievements: "Достижения",
      skills: "Навыки",
      interests: "Интересы",
      close: "Закрыть",
      noChildren: "Пока нет детей",
      loading: "Загрузка...",
      level: "Уровень",
      points: "Баллы"
    },
    en: {
      title: "Our Children",
      subtitle: "Stars of Play Kids Kindergarten",
      all: "All",
      age: "years",
      group: "Group",
      achievements: "Achievements",
      skills: "Skills",
      interests: "Interests",
      close: "Close",
      noChildren: "No children yet",
      loading: "Loading...",
      level: "Level",
      points: "Points"
    }
  }

  const txt = texts[language] || texts.uz

  const defaultGroups = [
    { id: "g1", name: "Quyoshlar", emoji: "\u2600\uFE0F", color: "#FF9F43", ageRange: "2-3" },
    { id: "g2", name: "Yulduzlar", emoji: "\u2B50", color: "#00D2D3", ageRange: "4-5" },
    { id: "g3", name: "Oylar", emoji: "\uD83C\uDF19", color: "#5F27CD", ageRange: "5-6" },
  ]

  const achievementsList = {
    'a1': { name: language === 'uz' ? "Eng faol" : language === 'ru' ? "Самый активный" : "Most Active", emoji: "\uD83C\uDFC3", color: "#FF6B6B" },
    'a2': { name: language === 'uz' ? "Rassom" : language === 'ru' ? "Художник" : "Artist", emoji: "\uD83C\uDFA8", color: "#4ECDC4" },
    'a3': { name: language === 'uz' ? "Musiqachi" : language === 'ru' ? "Музыкант" : "Musician", emoji: "\uD83C\uDFB5", color: "#45B7D1" },
    'a4': { name: language === 'uz' ? "Kitobxon" : language === 'ru' ? "Книголюб" : "Bookworm", emoji: "\uD83D\uDCDA", color: "#96CEB4" },
    'good_behavior': { name: language === 'uz' ? "Yaxshi xulq" : language === 'ru' ? "Хорошее поведение" : "Good Behavior", emoji: "\u2B50", color: "#FFEAA7" },
    'artist': { name: language === 'uz' ? "Rassom" : language === 'ru' ? "Художник" : "Artist", emoji: "\uD83C\uDFA8", color: "#4ECDC4" },
    'helper': { name: language === 'uz' ? "Yordamchi" : language === 'ru' ? "Помощник" : "Helper", emoji: "\uD83E\uDD1D", color: "#DDA0DD" },
  }

  const skillsList = [
    { name: language === 'uz' ? "Rasm chizish" : language === 'ru' ? "Рисование" : "Drawing", emoji: "\uD83D\uDD8D\uFE0F" },
    { name: language === 'uz' ? "Qo'shiq aytish" : language === 'ru' ? "Пение" : "Singing", emoji: "\uD83C\uDFA4" },
    { name: language === 'uz' ? "Raqs" : language === 'ru' ? "Танцы" : "Dancing", emoji: "\uD83D\uDC83" },
    { name: language === 'uz' ? "Sport" : language === 'ru' ? "Спорт" : "Sports", emoji: "\uD83C\uDFC0" },
    { name: language === 'uz' ? "O'qish" : language === 'ru' ? "Чтение" : "Reading", emoji: "\uD83D\uDCD6" },
    { name: language === 'uz' ? "Matematika" : language === 'ru' ? "Математика" : "Math", emoji: "\uD83D\uDD22" },
  ]

  const interestsList = [
    { name: language === 'uz' ? "Dinozavrlar" : language === 'ru' ? "Динозавры" : "Dinosaurs", emoji: "\uD83E\uDD95" },
    { name: language === 'uz' ? "Kosmik kemalar" : language === 'ru' ? "Космос" : "Space", emoji: "\uD83D\uDE80" },
    { name: language === 'uz' ? "Hayvonlar" : language === 'ru' ? "Животные" : "Animals", emoji: "\uD83D\uDC3E" },
    { name: language === 'uz' ? "Mashinalar" : language === 'ru' ? "Машины" : "Cars", emoji: "\uD83D\uDE97" },
    { name: language === 'uz' ? "Qo'g'irchoqlar" : language === 'ru' ? "Куклы" : "Dolls", emoji: "\uD83C\uDF80" },
    { name: language === 'uz' ? "Lego" : language === 'ru' ? "Лего" : "Lego", emoji: "\uD83E\uDDF1" },
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      console.log('[OurChildrenPage] Fetching children and groups...')
      
      const [childrenRes, groupsRes] = await Promise.all([
        api.get('/children/public'),
        api.get('/groups')
      ])
      
      console.log('[OurChildrenPage] Children API Response:', childrenRes)
      console.log('[OurChildrenPage] Children data:', childrenRes.data)
      console.log('[OurChildrenPage] Children data type:', typeof childrenRes.data)
      console.log('[OurChildrenPage] Children is array:', Array.isArray(childrenRes.data))
      
      console.log('[OurChildrenPage] Groups API Response:', groupsRes)
      console.log('[OurChildrenPage] Groups data:', groupsRes.data)
      
      const childrenData = childrenRes.data?.data || childrenRes.data || []
      const groupsData = groupsRes.data?.data || groupsRes.data || []
      
      console.log('[OurChildrenPage] Processed children:', childrenData)
      console.log('[OurChildrenPage] Children count:', childrenData.length)
      console.log('[OurChildrenPage] Processed groups:', groupsData)
      console.log('[OurChildrenPage] Groups count:', groupsData.length)
      
      if (childrenData.length > 0) {
        const enrichedChildren = childrenData.map((child) => {
          const birthDate = new Date(child.birthDate)
          const today = new Date()
          let age = today.getFullYear() - birthDate.getFullYear()
          const monthDiff = today.getMonth() - birthDate.getMonth()
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--
          }
          
          return {
            ...child,
            age,
            achievements: child.achievements?.map(a => a.achievementId) || [],
            skills: [],
            interests: [],
            bio: child.notes || ""
          }
        })
        setChildren(enrichedChildren)
        
        const enrichedGroups = (groupsData.length > 0 ? groupsData : defaultGroups).map(g => ({
          ...g,
          emoji: g.id === 'g1' ? '\u2600\uFE0F' : g.id === 'g2' ? '\u2B50' : '\uD83C\uDF19',
          color: g.id === 'g1' ? '#FF9F43' : g.id === 'g2' ? '#00D2D3' : '#5F27CD'
        }))
        setGroups(enrichedGroups)
      } else {
        setChildren([])
        setGroups(defaultGroups)
      }
    } catch (error) {
      console.error('[OurChildrenPage] Error:', error)
      console.error('[OurChildrenPage] Error response:', error.response)
      setChildren([])
      setGroups(defaultGroups)
    } finally {
      setLoading(false)
    }
  }

  const filteredChildren = activeGroup === 'all' 
    ? children 
    : children.filter(child => {
        // groupId ni string sifatida solishtirish
        const childGroupId = String(child.groupId || '')
        const filterGroupId = String(activeGroup)
        console.log('[OurChildrenPage] Filtering:', child.firstName, 'groupId:', childGroupId, 'filter:', filterGroupId, 'match:', childGroupId === filterGroupId)
        return childGroupId === filterGroupId
      })

  const getAvatarGradient = (name, gender) => {
    const gradients = gender === 'female' 
      ? ['linear-gradient(135deg, #FF6B9D 0%, #C44569 100%)', 'linear-gradient(135deg, #A855F7 0%, #6366F1 100%)', 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)']
      : ['linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)', 'linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)', 'linear-gradient(135deg, #FA709A 0%, #FEE140 100%)']
    const index = name.charCodeAt(0) % gradients.length
    return gradients[index]
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const getLevelBadge = (level) => {
    const badges = ['\uD83C\uDF31', '\uD83C\uDF3F', '\uD83C\uDF33', '\uD83C\uDF1F', '\uD83D\uDC51']
    return badges[Math.min(level - 1, 4)] || '\uD83C\uDF31'
  }

  const achievementsCount = Object.keys(achievementsList).length

  return (
    <div className="our-children-page">
      <section className="oc-hero">
        <div className="oc-hero-bg">
          <div className="oc-blob oc-blob-1"></div>
          <div className="oc-blob oc-blob-2"></div>
          <div className="oc-blob oc-blob-3"></div>
        </div>
        <div className="oc-floating-icons">
          <span className="oc-float-icon">{"\uD83C\uDF88"}</span>
          <span className="oc-float-icon">{"\uD83C\uDF08"}</span>
          <span className="oc-float-icon">{"\uD83C\uDFA8"}</span>
          <span className="oc-float-icon">{"\u2B50"}</span>
          <span className="oc-float-icon">{"\uD83C\uDFB5"}</span>
          <span className="oc-float-icon">{"\uD83D\uDCDA"}</span>
        </div>
        <div className="container">
          <motion.div 
            className="oc-hero-content"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="oc-hero-title">{txt.title}</h1>
            <p className="oc-hero-subtitle">{txt.subtitle}</p>
            <div className="oc-stats-row">
              <div className="oc-stat-item">
                <span className="oc-stat-num">{children.length}</span>
                <span className="oc-stat-label">{language === 'uz' ? 'Bola' : language === 'ru' ? 'Детей' : 'Children'}</span>
              </div>
              <div className="oc-stat-divider"></div>
              <div className="oc-stat-item">
                <span className="oc-stat-num">{groups.length}</span>
                <span className="oc-stat-label">{language === 'uz' ? 'Guruh' : language === 'ru' ? 'Групп' : 'Groups'}</span>
              </div>
              <div className="oc-stat-divider"></div>
              <div className="oc-stat-item">
                <span className="oc-stat-num">{achievementsCount}+</span>
                <span className="oc-stat-label">{txt.achievements}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="oc-filter-section">
        <div className="container">
          <div className="oc-group-filter">
            <motion.button
              className={`oc-filter-btn ${activeGroup === 'all' ? 'active' : ''}`}
              onClick={() => setActiveGroup('all')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="oc-btn-emoji">{"\uD83C\uDF08"}</span>
              <span>{txt.all}</span>
              <span className="oc-btn-count">{children.length}</span>
            </motion.button>
            {groups.map(group => (
              <motion.button
                key={group.id}
                className={`oc-filter-btn ${String(activeGroup) === String(group.id) ? 'active' : ''}`}
                onClick={() => setActiveGroup(String(group.id))}
                style={{ '--btn-accent': group.color }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="oc-btn-emoji">{group.emoji}</span>
                <span>{group.name}</span>
                <span className="oc-btn-count">
                  {children.filter(c => String(c.groupId) === String(group.id)).length}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <section className="oc-grid-section">
        <div className="container">
          {loading ? (
            <div className="oc-loading">
              <div className="oc-loader"></div>
              <p>{txt.loading}</p>
            </div>
          ) : filteredChildren.length === 0 ? (
            <div className="oc-empty">
              <span className="oc-empty-icon">{"\uD83D\uDC76"}</span>
              <p>{txt.noChildren}</p>
            </div>
          ) : (
            <motion.div 
              className="oc-children-grid"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
              }}
              key={activeGroup}
            >
              {filteredChildren.map((child) => (
                <motion.div
                  key={child.id}
                  className="oc-child-card"
                  variants={{
                    hidden: { opacity: 0, y: 30, scale: 0.9 },
                    visible: { opacity: 1, y: 0, scale: 1 }
                  }}
                  whileHover={{ y: -12, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
                  onClick={() => setSelectedChild(child)}
                >
                  <div className="oc-card-header" style={{ background: getAvatarGradient(child.firstName, child.gender) }}>
                    <div className="oc-card-avatar">
                      {child.avatar ? (
                        <img src={child.avatar} alt={child.firstName} />
                      ) : (
                        <span className="oc-avatar-text">{getInitials(child.firstName, child.lastName)}</span>
                      )}
                    </div>
                    <div className="oc-level-badge">{getLevelBadge(child.level)}</div>
                    <div className="oc-gender-badge">{child.gender === 'female' ? '\uD83D\uDC67' : '\uD83D\uDC66'}</div>
                  </div>

                  <div className="oc-card-body">
                    <h3 className="oc-child-name">{child.firstName}</h3>
                    <p className="oc-child-surname">{child.lastName}</p>
                    
                    <div className="oc-child-meta">
                      <span className="oc-meta-item">
                        <span className="oc-meta-icon">{"\uD83C\uDF82"}</span>
                        {child.age} {txt.age}
                      </span>
                      <span className="oc-meta-item">
                        <span className="oc-meta-icon">{groups.find(g => g.id === child.groupId)?.emoji}</span>
                        {child.groupName}
                      </span>
                    </div>

                    <div className="oc-achievements-preview">
                      {child.achievements?.slice(0, 4).map(achId => {
                        const ach = achievementsList[achId]
                        return ach ? (
                          <span 
                            key={achId} 
                            className="oc-ach-badge"
                            style={{ background: ach.color }}
                            title={ach.name}
                          >
                            {ach.emoji}
                          </span>
                        ) : null
                      })}
                      {child.achievements?.length > 4 && (
                        <span className="oc-ach-more">+{child.achievements.length - 4}</span>
                      )}
                    </div>

                    <div className="oc-points-bar">
                      <span className="oc-points-icon">{"\u2B50"}</span>
                      <span className="oc-points-value">{child.points || 0}</span>
                      <span className="oc-points-label">{txt.points}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {selectedChild && (
          <motion.div 
            className="oc-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedChild(null)}
          >
            <motion.div 
              className="oc-modal"
              initial={{ scale: 0.8, opacity: 0, y: 60 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 60 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="oc-modal-close" onClick={() => setSelectedChild(null)}>x</button>
              
              <div className="oc-modal-header" style={{ background: getAvatarGradient(selectedChild.firstName, selectedChild.gender) }}>
                <div className="oc-modal-avatar">
                  {selectedChild.avatar ? (
                    <img src={selectedChild.avatar} alt={selectedChild.firstName} />
                  ) : (
                    <span>{getInitials(selectedChild.firstName, selectedChild.lastName)}</span>
                  )}
                </div>
                <div className="oc-modal-badges">
                  <span className="oc-badge-level">{getLevelBadge(selectedChild.level)} {txt.level} {selectedChild.level}</span>
                  <span className="oc-badge-points">{"\u2B50"} {selectedChild.points}</span>
                </div>
              </div>

              <div className="oc-modal-body">
                <h2 className="oc-modal-name">{selectedChild.firstName} {selectedChild.lastName}</h2>
                
                <div className="oc-modal-info">
                  <div className="oc-info-item">
                    <span className="oc-info-icon">{selectedChild.gender === 'female' ? '\uD83D\uDC67' : '\uD83D\uDC66'}</span>
                    <span>{selectedChild.age} {txt.age}</span>
                  </div>
                  <div className="oc-info-item">
                    <span className="oc-info-icon">{groups.find(g => g.id === selectedChild.groupId)?.emoji}</span>
                    <span>{txt.group}: {selectedChild.groupName}</span>
                  </div>
                </div>

                {selectedChild.bio && (
                  <p className="oc-modal-bio">"{selectedChild.bio}"</p>
                )}

                <div className="oc-modal-section">
                  <h4 className="oc-section-title">{"\uD83C\uDFC6"} {txt.achievements}</h4>
                  <div className="oc-achievements-list">
                    {selectedChild.achievements?.map(achId => {
                      const ach = achievementsList[achId]
                      return ach ? (
                        <div key={achId} className="oc-achievement-item" style={{ background: ach.color + '20', borderColor: ach.color }}>
                          <span className="oc-ach-emoji">{ach.emoji}</span>
                          <span className="oc-ach-name">{ach.name}</span>
                        </div>
                      ) : null
                    })}
                  </div>
                </div>

                <div className="oc-modal-section">
                  <h4 className="oc-section-title">{"\uD83D\uDCAA"} {txt.skills}</h4>
                  <div className="oc-tags-list">
                    {selectedChild.skills?.map(skillIdx => {
                      const skill = skillsList[skillIdx]
                      return skill ? (
                        <span key={skillIdx} className="oc-tag">
                          {skill.emoji} {skill.name}
                        </span>
                      ) : null
                    })}
                  </div>
                </div>

                <div className="oc-modal-section">
                  <h4 className="oc-section-title">{"\u2764\uFE0F"} {txt.interests}</h4>
                  <div className="oc-tags-list">
                    {selectedChild.interests?.map(intIdx => {
                      const interest = interestsList[intIdx]
                      return interest ? (
                        <span key={intIdx} className="oc-tag oc-tag-interest">
                          {interest.emoji} {interest.name}
                        </span>
                      ) : null
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default OurChildrenPage
