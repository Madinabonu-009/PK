import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { Button, Card, Loading } from '../../components/common'
import { useToast } from '../../components/common/Toast'
import { StaggeredList, GlassReveal, AnimatedProgressBar } from '../../components/animations/WowEffects'
import api from '../../services/api'
import './ProgressPage.css'

const SKILLS = [
  { id: 'speech', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, label: { uz: 'Nutq', ru: 'Речь', en: 'Speech' } },
  { id: 'logic', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>, label: { uz: 'Mantiq', ru: 'Логика', en: 'Logic' } },
  { id: 'physical', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>, label: { uz: 'Jismoniy', ru: 'Физическое', en: 'Physical' } },
  { id: 'creative', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/></svg>, label: { uz: 'Ijodiy', ru: 'Творческое', en: 'Creative' } },
  { id: 'social', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, label: { uz: 'Ijtimoiy', ru: 'Социальное', en: 'Social' } },
  { id: 'selfCare', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, label: { uz: 'Mustaqillik', ru: 'Самостоятельность', en: 'Self-care' } }
]

const LEVELS = [
  { value: 1, label: { uz: 'Boshlang\'ich', ru: 'Начальный', en: 'Beginner' }, color: '#ef4444' },
  { value: 2, label: { uz: 'Rivojlanmoqda', ru: 'Развивается', en: 'Developing' }, color: '#f59e0b' },
  { value: 3, label: { uz: 'O\'rtacha', ru: 'Средний', en: 'Average' }, color: '#eab308' },
  { value: 4, label: { uz: 'Yaxshi', ru: 'Хорошо', en: 'Good' }, color: '#22c55e' },
  { value: 5, label: { uz: 'A\'lo', ru: 'Отлично', en: 'Excellent' }, color: '#3b82f6' }
]

function ProgressPage() {
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const toast = useToast()
  const [children, setChildren] = useState([])
  const [groups, setGroups] = useState([])
  const [progress, setProgress] = useState([])
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedChild, setSelectedChild] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [showAchievementModal, setShowAchievementModal] = useState(false)

  const [form, setForm] = useState({
    skills: {},
    achievements: [],
    recommendations: ''
  })

  const txt = {
    uz: {
      title: 'Bolalar rivojlanishi',
      selectChild: 'Bolani tanlang',
      allGroups: 'Barcha guruhlar',
      evaluate: 'Baholash',
      addAchievement: 'Yutuq qo\'shish',
      skills: 'Ko\'nikmalar',
      achievements: 'Yutuqlar',
      recommendations: 'Tavsiyalar',
      save: 'Saqlash',
      cancel: 'Bekor qilish',
      noProgress: 'Hali baholanmagan',
      lastEvaluation: 'Oxirgi baholash',
      totalPoints: 'Jami ball',
      level: 'Daraja',
      notes: 'Izoh',
      history: 'Tarix',
      viewProfile: 'Profilni ko\'rish'
    },
    ru: {
      title: 'Развитие детей',
      selectChild: 'Выберите ребенка',
      allGroups: 'Все группы',
      evaluate: 'Оценить',
      addAchievement: 'Добавить достижение',
      skills: 'Навыки',
      achievements: 'Достижения',
      recommendations: 'Рекомендации',
      save: 'Сохранить',
      cancel: 'Отмена',
      noProgress: 'Еще не оценен',
      lastEvaluation: 'Последняя оценка',
      totalPoints: 'Всего баллов',
      level: 'Уровень',
      notes: 'Заметка',
      history: 'История',
      viewProfile: 'Посмотреть профиль'
    },
    en: {
      title: 'Child Development',
      selectChild: 'Select child',
      allGroups: 'All groups',
      evaluate: 'Evaluate',
      addAchievement: 'Add Achievement',
      skills: 'Skills',
      achievements: 'Achievements',
      recommendations: 'Recommendations',
      save: 'Save',
      cancel: 'Cancel',
      noProgress: 'Not evaluated yet',
      lastEvaluation: 'Last evaluation',
      totalPoints: 'Total points',
      level: 'Level',
      notes: 'Notes',
      history: 'History',
      viewProfile: 'View profile'
    }
  }[language]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [childrenRes, groupsRes, progressRes, achievementsRes] = await Promise.all([
        api.get('/children'),
        api.get('/groups'),
        api.get('/progress'),
        api.get('/achievements')
      ])
      const childrenData = childrenRes.data?.data || (Array.isArray(childrenRes.data) ? childrenRes.data : [])
      const groupsData = groupsRes.data?.data || (Array.isArray(groupsRes.data) ? groupsRes.data : [])
      const progressData = progressRes.data?.data || (Array.isArray(progressRes.data) ? progressRes.data : [])
      const achievementsData = achievementsRes.data?.data || (Array.isArray(achievementsRes.data) ? achievementsRes.data : [])
      
      setChildren(childrenData.filter(c => c.isActive !== false))
      setGroups(groupsData)
      setProgress(progressData)
      setAchievements(achievementsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getChildProgress = (childId) => {
    return progress
      .filter(p => p.childId === childId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
  }

  const getChildAchievements = (childId) => {
    const childProgress = progress.filter(p => p.childId === childId)
    const achievementIds = childProgress.flatMap(p => p.achievements || [])
    return [...new Set(achievementIds)]
  }

  const calculateTotalPoints = (childId) => {
    const childAchievements = getChildAchievements(childId)
    return childAchievements.reduce((sum, achId) => {
      const ach = achievements.find(a => a.id === achId)
      return sum + (ach?.points || 0)
    }, 0)
  }

  const getOverallLevel = (childProgress) => {
    if (!childProgress?.skills) return 0
    const values = Object.values(childProgress.skills).map(s => s.level || 0)
    return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0
  }

  const openEvaluateModal = (child) => {
    const existingProgress = getChildProgress(child.id)
    setSelectedChild(child)
    setForm({
      skills: existingProgress?.skills || SKILLS.reduce((acc, s) => ({ ...acc, [s.id]: { level: 3, notes: '' } }), {}),
      achievements: existingProgress?.achievements || [],
      recommendations: existingProgress?.recommendations || ''
    })
    setShowModal(true)
  }

  const openAchievementModal = (child) => {
    setSelectedChild(child)
    setShowAchievementModal(true)
  }

  const handleSaveProgress = async () => {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7)
      await api.post('/progress', {
        childId: selectedChild.id,
        month: currentMonth,
        skills: form.skills,
        achievements: form.achievements,
        recommendations: form.recommendations
      })
      fetchData()
      setShowModal(false)
      toast.success('Baholash saqlandi!')
    } catch (error) {
      toast.error('Xatolik yuz berdi')
    }
  }

  const handleAddAchievement = async (achievementId) => {
    try {
      const existingProgress = getChildProgress(selectedChild.id)
      const currentAchievements = existingProgress?.achievements || []
      
      if (currentAchievements.includes(achievementId)) {
        toast.warning('Bu yutuq allaqachon qo\'shilgan')
        return
      }

      const currentMonth = new Date().toISOString().slice(0, 7)
      await api.post('/progress', {
        childId: selectedChild.id,
        month: currentMonth,
        skills: existingProgress?.skills || {},
        achievements: [...currentAchievements, achievementId],
        recommendations: existingProgress?.recommendations || ''
      })
      fetchData()
      setShowAchievementModal(false)
      toast.success('Yutuq qo\'shildi!')
    } catch (error) {
      toast.error('Xatolik yuz berdi')
    }
  }

  const filteredChildren = selectedGroup === 'all' 
    ? children 
    : children.filter(c => c.groupId === selectedGroup)

  if (loading) return <div className="progress-page"><Loading /></div>

  return (
    <div className="progress-page">
      <div className="page-header">
        <div className="header-left">
          <Button variant="secondary" onClick={() => navigate('/admin/dashboard')}>← {t('back')}</Button>
          <h1>{txt.title}</h1>
        </div>
        <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)} className="group-filter">
          <option value="all">{txt.allGroups}</option>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>

      <StaggeredList className="children-grid" staggerDelay={0.08}>
        {filteredChildren.map(child => {
          const childProgress = getChildProgress(child.id)
          const overallLevel = getOverallLevel(childProgress)
          const totalPoints = calculateTotalPoints(child.id)
          const childAchievements = getChildAchievements(child.id)
          const group = groups.find(g => g.id === child.groupId)

          return (
            <div key={child.id}>
              <Card className="child-progress-card">
                <div className="child-header">
                  <div className="child-avatar" style={{ background: `hsl(${child.id.charCodeAt(0) * 20}, 70%, 60%)` }}>
                    {child.firstName?.[0]}{child.lastName?.[0]}
                  </div>
                  <div className="child-info">
                    <h3>{child.firstName} {child.lastName}</h3>
                    <span className="child-group">{group?.name || '-'}</span>
                  </div>
                  <div className="child-points">
                    <span className="points-value">{totalPoints}</span>
                    <span className="points-label">ball</span>
                  </div>
                </div>

                {childProgress ? (
                  <>
                    <div className="skills-preview">
                      {SKILLS.map(skill => {
                        const skillData = childProgress.skills?.[skill.id]
                        const level = skillData?.level || 0
                        const levelInfo = LEVELS.find(l => l.value === level)
                        return (
                          <div key={skill.id} className="skill-bar">
                            <span className="skill-icon">{skill.icon}</span>
                            <div className="skill-progress">
                              <motion.div 
                                className="skill-fill" 
                                initial={{ width: 0 }}
                                animate={{ width: `${level * 20}%` }}
                                transition={{ duration: 0.8 }}
                                style={{ background: levelInfo?.color }} 
                              />
                            </div>
                            <span className="skill-level">{level}/5</span>
                          </div>
                        )
                      })}
                    </div>

                    <div className="overall-level">
                      <span>O'rtacha daraja:</span>
                      <div className="level-stars">
                        {[1, 2, 3, 4, 5].map(i => (
                          <motion.span 
                            key={i} 
                            className={`star ${i <= overallLevel ? 'filled' : ''}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            ★
                          </motion.span>
                        ))}
                      </div>
                    </div>

                    {childAchievements.length > 0 && (
                      <div className="achievements-preview">
                        {childAchievements.slice(0, 5).map(achId => {
                          const ach = achievements.find(a => a.id === achId)
                          return ach ? (
                            <motion.span 
                              key={achId} 
                              className="achievement-badge" 
                              title={ach.name?.[language] || ach.name} 
                              style={{ background: ach.color }}
                              whileHover={{ scale: 1.2 }}
                            >
                              {ach.icon}
                            </motion.span>
                          ) : null
                        })}
                        {childAchievements.length > 5 && <span className="more-badge">+{childAchievements.length - 5}</span>}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="no-progress">
                    <span className="no-progress-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></span>
                    <p>{txt.noProgress}</p>
                  </div>
                )}

                <div className="card-actions">
                  <Button size="small" onClick={() => openEvaluateModal(child)}>{txt.evaluate}</Button>
                  <Button size="small" variant="secondary" onClick={() => openAchievementModal(child)}>Yutuq</Button>
                </div>
              </Card>
            </div>
          )
        })}
      </StaggeredList>

      {/* Evaluate Modal */}
      <AnimatePresence>
        {showModal && selectedChild && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="evaluate-modal" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedChild.firstName} {selectedChild.lastName}</h2>
                <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
              </div>

              <div className="modal-body">
                <h3>{txt.skills}</h3>
                <div className="skills-form">
                  {SKILLS.map(skill => (
                    <div key={skill.id} className="skill-input">
                      <div className="skill-label">
                        <span>{skill.icon}</span>
                        <span>{skill.label[language]}</span>
                      </div>
                      <div className="level-selector">
                        {LEVELS.map(level => (
                          <button
                            key={level.value}
                            className={`level-btn ${form.skills[skill.id]?.level === level.value ? 'active' : ''}`}
                            style={{ '--level-color': level.color }}
                            onClick={() => setForm({
                              ...form,
                              skills: { ...form.skills, [skill.id]: { ...form.skills[skill.id], level: level.value } }
                            })}
                          >
                            {level.value}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder={txt.notes}
                        value={form.skills[skill.id]?.notes || ''}
                        onChange={e => setForm({
                          ...form,
                          skills: { ...form.skills, [skill.id]: { ...form.skills[skill.id], notes: e.target.value } }
                        })}
                      />
                    </div>
                  ))}
                </div>

                <h3>{txt.recommendations}</h3>
                <textarea
                  value={form.recommendations}
                  onChange={e => setForm({ ...form, recommendations: e.target.value })}
                  placeholder="Tavsiyalar..."
                  rows={3}
                />
              </div>

              <div className="modal-footer">
                <Button variant="secondary" onClick={() => setShowModal(false)}>{txt.cancel}</Button>
                <Button onClick={handleSaveProgress}>{txt.save}</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement Modal */}
      <AnimatePresence>
        {showAchievementModal && selectedChild && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAchievementModal(false)}>
            <motion.div className="achievement-modal" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{txt.addAchievement}</h2>
                <button className="close-btn" onClick={() => setShowAchievementModal(false)}>×</button>
              </div>

              <div className="modal-body">
                <p className="modal-subtitle">{selectedChild.firstName} {selectedChild.lastName} uchun yutuq tanlang:</p>
                <div className="achievements-grid">
                  {achievements.map(ach => {
                    const isEarned = getChildAchievements(selectedChild.id).includes(ach.id)
                    return (
                      <div
                        key={ach.id}
                        className={`achievement-item ${isEarned ? 'earned' : ''}`}
                        onClick={() => !isEarned && handleAddAchievement(ach.id)}
                      >
                        <div className="achievement-icon" style={{ background: ach.color }}>{ach.icon}</div>
                        <div className="achievement-info">
                          <h4>{ach.name?.[language] || ach.name}</h4>
                          <p>{ach.description?.[language] || ach.description}</p>
                          <span className="achievement-points">+{ach.points} ball</span>
                        </div>
                        {isEarned && <span className="earned-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProgressPage
