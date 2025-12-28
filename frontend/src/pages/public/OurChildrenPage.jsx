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
      subtitle: "Play Kids bog'chasining yulduzlari ✨",
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
      points: "Ball",
      joinedDate: "Qo'shilgan",
      parent: "Ota-ona"
    },
    ru: {
      title: "Наши Дети",
      subtitle: "Звёзды детского сада Play Kids ✨",
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
      points: "Баллы",
      joinedDate: "Присоединился",
      parent: "Родитель"
    },
    en: {
      title: "Our Children",
      subtitle: "Stars of Play Kids Kindergarten ✨",
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
      points: "Points",
      joinedDate: "Joined",
      parent: "Parent"
    }
  }

  const txt = texts[language] || texts.uz

  // Demo data - 3 guruh
  const demoGroups = [
    { id: 1, name: "Quyosh", emoji: "☀️", color: "#FF9F43", ageRange: "2-3" },
    { id: 2, name: "Yulduz", emoji: "⭐", color: "#00D2D3", ageRange: "3-5" },
    { id: 3, name: "Oy", emoji: "🌙", color: "#5F27CD", ageRange: "5-7" },
  ]

  const achievementsList = [
    { id: 1, name: language === 'uz' ? "Eng faol" : language === 'ru' ? "Самый активный" : "Most Active", emoji: "🏃", color: "#FF6B6B" },
    { id: 2, name: language === 'uz' ? "Rassom" : language === 'ru' ? "Художник" : "Artist", emoji: "🎨", color: "#4ECDC4" },
    { id: 3, name: language === 'uz' ? "Musiqachi" : language === 'ru' ? "Музыкант" : "Musician", emoji: "🎵", color: "#45B7D1" },
    { id: 4, name: language === 'uz' ? "Kitobxon" : language === 'ru' ? "Книголюб" : "Bookworm", emoji: "📚", color: "#96CEB4" },
    { id: 5, name: language === 'uz' ? "Yordamchi" : language === 'ru' ? "Помощник" : "Helper", emoji: "🤝", color: "#FFEAA7" },
    { id: 6, name: language === 'uz' ? "Sportchi" : language === 'ru' ? "Спортсмен" : "Athlete", emoji: "⚽", color: "#DDA0DD" },
    { id: 7, name: language === 'uz' ? "Do'st" : language === 'ru' ? "Друг" : "Friend", emoji: "💝", color: "#F7DC6F" },
    { id: 8, name: language === 'uz' ? "Olim" : language === 'ru' ? "Учёный" : "Scientist", emoji: "🔬", color: "#BB8FCE" },
  ]

  const skillsList = [
    { name: language === 'uz' ? "Rasm chizish" : language === 'ru' ? "Рисование" : "Drawing", emoji: "🖍️" },
    { name: language === 'uz' ? "Qo'shiq aytish" : language === 'ru' ? "Пение" : "Singing", emoji: "🎤" },
    { name: language === 'uz' ? "Raqs" : language === 'ru' ? "Танцы" : "Dancing", emoji: "💃" },
    { name: language === 'uz' ? "Sport" : language === 'ru' ? "Спорт" : "Sports", emoji: "🏀" },
    { name: language === 'uz' ? "O'qish" : language === 'ru' ? "Чтение" : "Reading", emoji: "📖" },
    { name: language === 'uz' ? "Matematika" : language === 'ru' ? "Математика" : "Math", emoji: "🔢" },
  ]

  const interestsList = [
    { name: language === 'uz' ? "Dinozavrlar" : language === 'ru' ? "Динозавры" : "Dinosaurs", emoji: "🦕" },
    { name: language === 'uz' ? "Kosmik kemalar" : language === 'ru' ? "Космос" : "Space", emoji: "🚀" },
    { name: language === 'uz' ? "Hayvonlar" : language === 'ru' ? "Животные" : "Animals", emoji: "🐾" },
    { name: language === 'uz' ? "Mashinalar" : language === 'ru' ? "Машины" : "Cars", emoji: "🚗" },
    { name: language === 'uz' ? "Qo'g'irchoqlar" : language === 'ru' ? "Куклы" : "Dolls", emoji: "🎀" },
    { name: language === 'uz' ? "Lego" : language === 'ru' ? "Лего" : "Lego", emoji: "🧱" },
  ]

  // Demo bolalar - ko'proq ma'lumot bilan
  const demoChildren = [
    { 
      id: 1, firstName: "Aziza", lastName: "Karimova", age: 5, gender: "female", 
      groupId: 2, groupName: "Yulduz", avatar: null, level: 4, points: 850,
      achievements: [1, 2, 7], skills: [0, 2, 4], interests: [2, 4],
      bio: language === 'uz' ? "Raqs va rasm chizishni yaxshi ko'radi" : "Loves dancing and drawing"
    },
    { 
      id: 2, firstName: "Jasur", lastName: "Toshmatov", age: 4, gender: "male", 
      groupId: 2, groupName: "Yulduz", avatar: null, level: 3, points: 620,
      achievements: [5, 6], skills: [3, 5], interests: [1, 3],
      bio: language === 'uz' ? "Sport va kosmosga qiziqadi" : "Interested in sports and space"
    },
    { 
      id: 3, firstName: "Madina", lastName: "Rahimova", age: 6, gender: "female", 
      groupId: 3, groupName: "Oy", avatar: null, level: 5, points: 1200,
      achievements: [3, 4, 7, 8], skills: [1, 4, 5], interests: [0, 2],
      bio: language === 'uz' ? "Kitob o'qish va musiqa" : "Reading and music lover"
    },
    { 
      id: 4, firstName: "Bobur", lastName: "Aliyev", age: 6, gender: "male", 
      groupId: 3, groupName: "Oy", avatar: null, level: 4, points: 980,
      achievements: [1, 6, 8], skills: [3, 5], interests: [0, 5],
      bio: language === 'uz' ? "Matematika va sport" : "Math and sports enthusiast"
    },
    { 
      id: 5, firstName: "Nilufar", lastName: "Saidova", age: 3, gender: "female", 
      groupId: 1, groupName: "Quyosh", avatar: null, level: 2, points: 320,
      achievements: [2, 7], skills: [0, 2], interests: [2, 4],
      bio: language === 'uz' ? "Rasm chizish va hayvonlar" : "Drawing and animals"
    },
    { 
      id: 6, firstName: "Sardor", lastName: "Umarov", age: 3, gender: "male", 
      groupId: 1, groupName: "Quyosh", avatar: null, level: 2, points: 280,
      achievements: [1, 5], skills: [3], interests: [3, 5],
      bio: language === 'uz' ? "Mashinalar va Lego" : "Cars and Lego fan"
    },
    { 
      id: 7, firstName: "Zarina", lastName: "Nazarova", age: 7, gender: "female", 
      groupId: 3, groupName: "Oy", avatar: null, level: 5, points: 1450,
      achievements: [2, 3, 4, 7], skills: [0, 1, 4], interests: [2],
      bio: language === 'uz' ? "San'at va musiqa iste'dodi" : "Art and music talent"
    },
    { 
      id: 8, firstName: "Amir", lastName: "Qodirov", age: 5, gender: "male", 
      groupId: 2, groupName: "Yulduz", avatar: null, level: 3, points: 550,
      achievements: [5, 6], skills: [3, 5], interests: [1, 3],
      bio: language === 'uz' ? "Kelajak sportchi" : "Future athlete"
    },
    { 
      id: 9, firstName: "Laylo", lastName: "Ergasheva", age: 4, gender: "female", 
      groupId: 2, groupName: "Yulduz", avatar: null, level: 3, points: 480,
      achievements: [2, 7], skills: [0, 2], interests: [4],
      bio: language === 'uz' ? "Ijodkor va mehribon" : "Creative and kind"
    },
    { 
      id: 10, firstName: "Temur", lastName: "Xolmatov", age: 6, gender: "male", 
      groupId: 3, groupName: "Oy", avatar: null, level: 4, points: 890,
      achievements: [4, 8], skills: [4, 5], interests: [0, 1],
      bio: language === 'uz' ? "Kichik olim" : "Little scientist"
    },
    { 
      id: 11, firstName: "Sabina", lastName: "Mirzayeva", age: 2, gender: "female", 
      groupId: 1, groupName: "Quyosh", avatar: null, level: 1, points: 150,
      achievements: [7], skills: [2], interests: [2, 4],
      bio: language === 'uz' ? "Eng kichik yulduzcha" : "Our little star"
    },
    { 
      id: 12, firstName: "Shoxrux", lastName: "Abdullayev", age: 7, gender: "male", 
      groupId: 3, groupName: "Oy", avatar: null, level: 5, points: 1380,
      achievements: [1, 4, 6, 8], skills: [3, 4, 5], interests: [1, 5],
      bio: language === 'uz' ? "Maktabga tayyor!" : "Ready for school!"
    },
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [childrenRes, groupsRes] = await Promise.all([
        api.get('/children'),
        api.get('/groups')
      ])
      
      const childrenData = childrenRes.data?.data || childrenRes.data || []
      const groupsData = groupsRes.data?.data || groupsRes.data || []
      
      if (childrenData.length > 0) {
        // Add demo achievements/skills to real data
        const enrichedChildren = childrenData.map((child, idx) => ({
          ...child,
          achievements: demoChildren[idx % demoChildren.length]?.achievements || [1],
          skills: demoChildren[idx % demoChildren.length]?.skills || [0],
          interests: demoChildren[idx % demoChildren.length]?.interests || [0],
          bio: demoChildren[idx % demoChildren.length]?.bio || ""
        }))
        setChildren(enrichedChildren)
        setGroups(groupsData.length > 0 ? groupsData : demoGroups)
      } else {
        setChildren(demoChildren)
        setGroups(demoGroups)
      }
    } catch (error) {
      console.log('Using demo data')
      setChildren(demoChildren)
      setGroups(demoGroups)
    } finally {
      setLoading(false)
    }
  }

  const filteredChildren = activeGroup === 'all' 
    ? children 
    : children.filter(child => String(child.groupId) === String(activeGroup))

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
    const badges = ['🌱', '🌿', '🌳', '🌟', '👑']
    return badges[Math.min(level - 1, 4)] || '🌱'
  }

  return (
    <div className="our-children-page">
      {/* Hero Section */}
      <section className="oc-hero">
        <div className="oc-hero-bg">
          <div className="oc-blob oc-blob-1"></div>
          <div className="oc-blob oc-blob-2"></div>
          <div className="oc-blob oc-blob-3"></div>
        </div>
        <div className="oc-floating-icons">
          <span className="oc-float-icon">🎈</span>
          <span className="oc-float-icon">🌈</span>
          <span className="oc-float-icon">🎨</span>
          <span className="oc-float-icon">⭐</span>
          <span className="oc-float-icon">🎵</span>
          <span className="oc-float-icon">📚</span>
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
                <span className="oc-stat-num">{achievementsList.length}+</span>
                <span className="oc-stat-label">{txt.achievements}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="oc-filter-section">
        <div className="container">
          <div className="oc-group-filter">
            <motion.button
              className={`oc-filter-btn ${activeGroup === 'all' ? 'active' : ''}`}
              onClick={() => setActiveGroup('all')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="oc-btn-emoji">🌈</span>
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

      {/* Children Grid */}
      <section className="oc-grid-section">
        <div className="container">
          {loading ? (
            <div className="oc-loading">
              <div className="oc-loader"></div>
              <p>{txt.loading}</p>
            </div>
          ) : filteredChildren.length === 0 ? (
            <div className="oc-empty">
              <span className="oc-empty-icon">👶</span>
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
                  {/* Card Header with Avatar */}
                  <div className="oc-card-header" style={{ background: getAvatarGradient(child.firstName, child.gender) }}>
                    <div className="oc-card-avatar">
                      {child.avatar ? (
                        <img src={child.avatar} alt={child.firstName} />
                      ) : (
                        <span className="oc-avatar-text">{getInitials(child.firstName, child.lastName)}</span>
                      )}
                    </div>
                    <div className="oc-level-badge">{getLevelBadge(child.level)}</div>
                    <div className="oc-gender-badge">{child.gender === 'female' ? '👧' : '👦'}</div>
                  </div>

                  {/* Card Body */}
                  <div className="oc-card-body">
                    <h3 className="oc-child-name">{child.firstName}</h3>
                    <p className="oc-child-surname">{child.lastName}</p>
                    
                    <div className="oc-child-meta">
                      <span className="oc-meta-item">
                        <span className="oc-meta-icon">🎂</span>
                        {child.age} {txt.age}
                      </span>
                      <span className="oc-meta-item">
                        <span className="oc-meta-icon">{groups.find(g => g.id === child.groupId)?.emoji}</span>
                        {child.groupName}
                      </span>
                    </div>

                    {/* Achievements Preview */}
                    <div className="oc-achievements-preview">
                      {child.achievements?.slice(0, 4).map(achId => {
                        const ach = achievementsList.find(a => a.id === achId)
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

                    {/* Points */}
                    <div className="oc-points-bar">
                      <span className="oc-points-icon">⭐</span>
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

      {/* Child Modal */}
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
              <button className="oc-modal-close" onClick={() => setSelectedChild(null)}>×</button>
              
              {/* Modal Header */}
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
                  <span className="oc-badge-points">⭐ {selectedChild.points}</span>
                </div>
              </div>

              {/* Modal Body */}
              <div className="oc-modal-body">
                <h2 className="oc-modal-name">{selectedChild.firstName} {selectedChild.lastName}</h2>
                
                <div className="oc-modal-info">
                  <div className="oc-info-item">
                    <span className="oc-info-icon">{selectedChild.gender === 'female' ? '👧' : '👦'}</span>
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

                {/* Achievements */}
                <div className="oc-modal-section">
                  <h4 className="oc-section-title">🏆 {txt.achievements}</h4>
                  <div className="oc-achievements-list">
                    {selectedChild.achievements?.map(achId => {
                      const ach = achievementsList.find(a => a.id === achId)
                      return ach ? (
                        <div key={achId} className="oc-achievement-item" style={{ background: ach.color + '20', borderColor: ach.color }}>
                          <span className="oc-ach-emoji">{ach.emoji}</span>
                          <span className="oc-ach-name">{ach.name}</span>
                        </div>
                      ) : null
                    })}
                  </div>
                </div>

                {/* Skills */}
                <div className="oc-modal-section">
                  <h4 className="oc-section-title">💪 {txt.skills}</h4>
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

                {/* Interests */}
                <div className="oc-modal-section">
                  <h4 className="oc-section-title">❤️ {txt.interests}</h4>
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
