import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../components/common/Toast'
import api from '../../services/api'
import './DailyReportsPage.css'

// Translations
const texts = {
  uz: {
    title: 'Kunlik Hisobotlar',
    subtitle: 'Bolalar faoliyati',
    newReport: 'Yangi hisobot',
    selectChild: 'Bolani tanlang',
    allGroups: 'Barcha guruhlar',
    today: 'Bugun',
    noReports: 'Hisobotlar topilmadi',
    childrenPending: 'Hisobot kutilmoqda',
    save: 'Saqlash',
    cancel: 'Bekor qilish',
    edit: 'Tahrirlash',
    delete: "O'chirish",
    send: 'Yuborish',
    sent: 'Yuborilgan',
    pending: 'Kutilmoqda',
    arrival: 'Kelish',
    departure: 'Ketish',
    meals: 'Ovqatlanish',
    sleep: 'Uyqu',
    mood: 'Kayfiyat',
    activities: 'Faoliyatlar',
    behavior: 'Xulq-atvor',
    health: 'Sog\'liq',
    notes: 'Izohlar',
    time: 'Vaqt',
    broughtBy: 'Kim olib keldi',
    pickedUpBy: 'Kim olib ketdi',
    mother: 'Ona',
    father: 'Ota',
    grandparent: 'Buvi/Bobo',
    other: 'Boshqa',
    condition: 'Holati',
    good: 'Yaxshi',
    normal: "O'rtacha",
    poor: 'Yomon',
    breakfast: 'Nonushta',
    lunch: 'Tushlik',
    snack: 'Poldnik',
    full: "To'liq yedi",
    partial: 'Qisman yedi',
    none: 'Yemadi',
    slept: 'Uxladimi',
    yes: 'Ha',
    no: "Yo'q",
    duration: 'Davomiyligi',
    minutes: 'daqiqa',
    quality: 'Sifati',
    morning: 'Ertalab',
    afternoon: 'Tushdan keyin',
    evening: 'Kechqurun'
  },
  ru: {
    title: 'Ежедневные отчеты',
    subtitle: 'Активность детей',
    newReport: 'Новый отчет',
    selectChild: 'Выберите ребенка',
    allGroups: 'Все группы',
    today: 'Сегодня',
    noReports: 'Отчеты не найдены',
    childrenPending: 'Ожидается отчет',
    save: 'Сохранить',
    cancel: 'Отмена',
    edit: 'Редактировать',
    delete: 'Удалить',
    send: 'Отправить',
    sent: 'Отправлено',
    pending: 'Ожидание',
    arrival: 'Приход',
    departure: 'Уход',
    meals: 'Питание',
    sleep: 'Сон',
    mood: 'Настроение',
    activities: 'Занятия',
    behavior: 'Поведение',
    health: 'Здоровье',
    notes: 'Заметки',
    time: 'Время',
    broughtBy: 'Кто привел',
    pickedUpBy: 'Кто забрал',
    mother: 'Мать',
    father: 'Отец',
    grandparent: 'Бабушка/Дедушка',
    other: 'Другой',
    condition: 'Состояние',
    good: 'Хорошо',
    normal: 'Нормально',
    poor: 'Плохо',
    breakfast: 'Завтрак',
    lunch: 'Обед',
    snack: 'Полдник',
    full: 'Съел полностью',
    partial: 'Съел частично',
    none: 'Не ел',
    slept: 'Спал',
    yes: 'Да',
    no: 'Нет',
    duration: 'Продолжительность',
    minutes: 'минут',
    quality: 'Качество',
    morning: 'Утром',
    afternoon: 'После обеда',
    evening: 'Вечером'
  },
  en: {
    title: 'Daily Reports',
    subtitle: 'Children activity',
    newReport: 'New Report',
    selectChild: 'Select child',
    allGroups: 'All groups',
    today: 'Today',
    noReports: 'No reports found',
    childrenPending: 'Report pending',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    send: 'Send',
    sent: 'Sent',
    pending: 'Pending',
    arrival: 'Arrival',
    departure: 'Departure',
    meals: 'Meals',
    sleep: 'Sleep',
    mood: 'Mood',
    activities: 'Activities',
    behavior: 'Behavior',
    health: 'Health',
    notes: 'Notes',
    time: 'Time',
    broughtBy: 'Brought by',
    pickedUpBy: 'Picked up by',
    mother: 'Mother',
    father: 'Father',
    grandparent: 'Grandparent',
    other: 'Other',
    condition: 'Condition',
    good: 'Good',
    normal: 'Normal',
    poor: 'Poor',
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    snack: 'Snack',
    full: 'Ate fully',
    partial: 'Ate partially',
    none: 'Did not eat',
    slept: 'Slept',
    yes: 'Yes',
    no: 'No',
    duration: 'Duration',
    minutes: 'minutes',
    quality: 'Quality',
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening'
  }
}

// Empty form template
const getEmptyForm = () => ({
  arrival: { time: '', broughtBy: 'mother', condition: 'good' },
  departure: { time: '', pickedUpBy: '', condition: 'good' },
  meals: {
    breakfast: { eaten: 'full', notes: '' },
    lunch: { eaten: 'full', notes: '' },
    snack: { eaten: 'full', notes: '' }
  },
  sleep: { slept: true, duration: 120, quality: 'good' },
  mood: { morning: 'happy', afternoon: 'happy', evening: 'happy' },
  activities: [],
  behavior: { overall: 'good', notes: '' },
  health: { temperature: '', symptoms: [], notes: '' },
  teacherNotes: '',
  parentNotes: ''
})

// Stats Card Component
function StatsCard({ icon, label, value, color }) {
  return (
    <div className="dr-stat-card" style={{ '--accent': color }}>
      <div className="dr-stat-icon">{icon}</div>
      <div className="dr-stat-info">
        <span className="dr-stat-value">{value}</span>
        <span className="dr-stat-label">{label}</span>
      </div>
    </div>
  )
}

// Report Card Component
function ReportCard({ report, child, group, txt, onEdit, onSend, onDelete }) {
  const getMoodEmoji = (mood) => {
    const moods = { happy: '😊', calm: '😌', sad: '😢', angry: '😠', tired: '😴', neutral: '😐' }
    return moods[mood] || '😐'
  }

  const getEatenBadge = (eaten) => {
    if (eaten === 'full') return { class: 'success', text: '✓' }
    if (eaten === 'partial') return { class: 'warning', text: '½' }
    return { class: 'danger', text: '✗' }
  }

  return (
    <div className="dr-report-card">
      <div className="dr-card-header">
        <div className="dr-child-info">
          <div className="dr-avatar">
            {child?.photo ? (
              <img src={child.photo} alt={child?.firstName} />
            ) : (
              <span>{child?.firstName?.[0]}{child?.lastName?.[0]}</span>
            )}
          </div>
          <div className="dr-child-details">
            <h3>{child?.firstName} {child?.lastName}</h3>
            <span className="dr-group-name">{group?.name || 'Guruh'}</span>
          </div>
        </div>
        <div className={`dr-status-badge ${report.sentToTelegram ? 'sent' : 'pending'}`}>
          {report.sentToTelegram ? txt.sent : txt.pending}
        </div>
      </div>

      <div className="dr-card-body">
        <div className="dr-info-grid">
          <div className="dr-info-item">
            <span className="dr-info-icon">🚶</span>
            <div className="dr-info-content">
              <span className="dr-info-label">{txt.arrival}</span>
              <span className="dr-info-value">{report.arrival?.time || '--:--'}</span>
            </div>
          </div>
          <div className="dr-info-item">
            <span className="dr-info-icon">🏠</span>
            <div className="dr-info-content">
              <span className="dr-info-label">{txt.departure}</span>
              <span className="dr-info-value">{report.departure?.time || '--:--'}</span>
            </div>
          </div>
        </div>

        <div className="dr-meals-row">
          <div className="dr-meal-item">
            <span className="dr-meal-icon">🍳</span>
            <span className={`dr-meal-badge ${getEatenBadge(report.meals?.breakfast?.eaten).class}`}>
              {getEatenBadge(report.meals?.breakfast?.eaten).text}
            </span>
          </div>
          <div className="dr-meal-item">
            <span className="dr-meal-icon">🍲</span>
            <span className={`dr-meal-badge ${getEatenBadge(report.meals?.lunch?.eaten).class}`}>
              {getEatenBadge(report.meals?.lunch?.eaten).text}
            </span>
          </div>
          <div className="dr-meal-item">
            <span className="dr-meal-icon">🍎</span>
            <span className={`dr-meal-badge ${getEatenBadge(report.meals?.snack?.eaten).class}`}>
              {getEatenBadge(report.meals?.snack?.eaten).text}
            </span>
          </div>
        </div>

        <div className="dr-mood-row">
          <span className="dr-mood-label">{txt.mood}:</span>
          <div className="dr-mood-emojis">
            <span title={txt.morning}>{getMoodEmoji(report.mood?.morning)}</span>
            <span title={txt.afternoon}>{getMoodEmoji(report.mood?.afternoon)}</span>
            <span title={txt.evening}>{getMoodEmoji(report.mood?.evening)}</span>
          </div>
        </div>

        {report.sleep?.slept && (
          <div className="dr-sleep-info">
            <span className="dr-sleep-icon">💤</span>
            <span>{report.sleep.duration} {txt.minutes}</span>
          </div>
        )}
      </div>

      <div className="dr-card-footer">
        <button className="dr-btn dr-btn-edit" onClick={onEdit}>
          <span>✏️</span> {txt.edit}
        </button>
        {!report.sentToTelegram && (
          <button className="dr-btn dr-btn-send" onClick={onSend}>
            <span>📤</span> {txt.send}
          </button>
        )}
        <button className="dr-btn dr-btn-delete" onClick={onDelete}>
          <span>🗑️</span>
        </button>
      </div>
    </div>
  )
}

// Report Form Modal Component
function ReportFormModal({ show, onClose, child, report, txt, onSave }) {
  const [formData, setFormData] = useState(getEmptyForm())
  const [activeTab, setActiveTab] = useState('arrival')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (report) {
      setFormData({
        arrival: report.arrival || getEmptyForm().arrival,
        departure: report.departure || getEmptyForm().departure,
        meals: report.meals || getEmptyForm().meals,
        sleep: report.sleep || getEmptyForm().sleep,
        mood: report.mood || getEmptyForm().mood,
        activities: report.activities || [],
        behavior: report.behavior || getEmptyForm().behavior,
        health: report.health || getEmptyForm().health,
        teacherNotes: report.teacherNotes || '',
        parentNotes: report.parentNotes || ''
      })
    } else {
      setFormData(getEmptyForm())
    }
    setActiveTab('arrival')
  }, [report, show])

  const updateField = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' 
        ? { ...prev[section], [field]: value }
        : value
    }))
  }

  const updateMeal = (meal, field, value) => {
    setFormData(prev => ({
      ...prev,
      meals: {
        ...prev.meals,
        [meal]: { ...prev.meals[meal], [field]: value }
      }
    }))
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  if (!show) return null

  const tabs = [
    { id: 'arrival', icon: '🚶', label: txt.arrival },
    { id: 'meals', icon: '🍽️', label: txt.meals },
    { id: 'sleep', icon: '💤', label: txt.sleep },
    { id: 'mood', icon: '😊', label: txt.mood },
    { id: 'notes', icon: '📝', label: txt.notes }
  ]

  return (
    <div className="dr-modal-overlay" onClick={onClose}>
      <div className="dr-modal" onClick={e => e.stopPropagation()}>
        <div className="dr-modal-header">
          <div className="dr-modal-title">
            <h2>{report ? txt.edit : txt.newReport}</h2>
            {child && <span className="dr-modal-child">{child.firstName} {child.lastName}</span>}
          </div>
          <button className="dr-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="dr-modal-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`dr-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="dr-tab-icon">{tab.icon}</span>
              <span className="dr-tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="dr-modal-body">
          {activeTab === 'arrival' && (
            <div className="dr-form-section">
              <div className="dr-form-grid">
                <div className="dr-form-card">
                  <h4>🚶 {txt.arrival}</h4>
                  <div className="dr-form-row">
                    <label>{txt.time}</label>
                    <input
                      type="time"
                      value={formData.arrival.time}
                      onChange={e => updateField('arrival', 'time', e.target.value)}
                    />
                  </div>
                  <div className="dr-form-row">
                    <label>{txt.broughtBy}</label>
                    <select
                      value={formData.arrival.broughtBy}
                      onChange={e => updateField('arrival', 'broughtBy', e.target.value)}
                    >
                      <option value="mother">{txt.mother}</option>
                      <option value="father">{txt.father}</option>
                      <option value="grandparent">{txt.grandparent}</option>
                      <option value="other">{txt.other}</option>
                    </select>
                  </div>
                  <div className="dr-form-row">
                    <label>{txt.condition}</label>
                    <div className="dr-condition-btns">
                      {['good', 'normal', 'poor'].map(c => (
                        <button
                          key={c}
                          className={`dr-condition-btn ${formData.arrival.condition === c ? 'active' : ''}`}
                          onClick={() => updateField('arrival', 'condition', c)}
                        >
                          {c === 'good' ? '😊' : c === 'normal' ? '😐' : '😢'} {txt[c]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="dr-form-card">
                  <h4>🏠 {txt.departure}</h4>
                  <div className="dr-form-row">
                    <label>{txt.time}</label>
                    <input
                      type="time"
                      value={formData.departure.time}
                      onChange={e => updateField('departure', 'time', e.target.value)}
                    />
                  </div>
                  <div className="dr-form-row">
                    <label>{txt.pickedUpBy}</label>
                    <select
                      value={formData.departure.pickedUpBy}
                      onChange={e => updateField('departure', 'pickedUpBy', e.target.value)}
                    >
                      <option value="">{txt.selectChild}</option>
                      <option value="mother">{txt.mother}</option>
                      <option value="father">{txt.father}</option>
                      <option value="grandparent">{txt.grandparent}</option>
                      <option value="other">{txt.other}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'meals' && (
            <div className="dr-form-section">
              {['breakfast', 'lunch', 'snack'].map(meal => (
                <div key={meal} className="dr-meal-card">
                  <h4>
                    {meal === 'breakfast' ? '🍳' : meal === 'lunch' ? '🍲' : '🍎'} {txt[meal]}
                  </h4>
                  <div className="dr-eaten-btns">
                    {['full', 'partial', 'none'].map(status => (
                      <button
                        key={status}
                        className={`dr-eaten-btn ${formData.meals[meal].eaten === status ? 'active ' + status : ''}`}
                        onClick={() => updateMeal(meal, 'eaten', status)}
                      >
                        {status === 'full' ? '✓' : status === 'partial' ? '½' : '✗'} {txt[status]}
                      </button>
                    ))}
                  </div>
                  <textarea
                    placeholder={txt.notes}
                    value={formData.meals[meal].notes}
                    onChange={e => updateMeal(meal, 'notes', e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'sleep' && (
            <div className="dr-form-section">
              <div className="dr-form-card">
                <h4>💤 {txt.sleep}</h4>
                <div className="dr-form-row">
                  <label>{txt.slept}</label>
                  <div className="dr-toggle-btns">
                    <button
                      className={`dr-toggle-btn ${formData.sleep.slept ? 'active' : ''}`}
                      onClick={() => updateField('sleep', 'slept', true)}
                    >
                      {txt.yes}
                    </button>
                    <button
                      className={`dr-toggle-btn ${!formData.sleep.slept ? 'active' : ''}`}
                      onClick={() => updateField('sleep', 'slept', false)}
                    >
                      {txt.no}
                    </button>
                  </div>
                </div>
                {formData.sleep.slept && (
                  <>
                    <div className="dr-form-row">
                      <label>{txt.duration} ({txt.minutes})</label>
                      <input
                        type="number"
                        value={formData.sleep.duration}
                        onChange={e => updateField('sleep', 'duration', parseInt(e.target.value) || 0)}
                        min="0"
                        max="300"
                      />
                    </div>
                    <div className="dr-form-row">
                      <label>{txt.quality}</label>
                      <div className="dr-condition-btns">
                        {['good', 'normal', 'poor'].map(q => (
                          <button
                            key={q}
                            className={`dr-condition-btn ${formData.sleep.quality === q ? 'active' : ''}`}
                            onClick={() => updateField('sleep', 'quality', q)}
                          >
                            {txt[q]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'mood' && (
            <div className="dr-form-section">
              <div className="dr-mood-grid">
                {['morning', 'afternoon', 'evening'].map(time => (
                  <div key={time} className="dr-mood-card">
                    <h4>{txt[time]}</h4>
                    <div className="dr-mood-options">
                      {['happy', 'calm', 'neutral', 'sad', 'tired'].map(mood => (
                        <button
                          key={mood}
                          className={`dr-mood-btn ${formData.mood[time] === mood ? 'active' : ''}`}
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            mood: { ...prev.mood, [time]: mood }
                          }))}
                        >
                          {mood === 'happy' ? '😊' : mood === 'calm' ? '😌' : mood === 'neutral' ? '😐' : mood === 'sad' ? '😢' : '😴'}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="dr-form-section">
              <div className="dr-form-card">
                <h4>📝 {txt.notes}</h4>
                <textarea
                  className="dr-notes-textarea"
                  placeholder="Tarbiyachi izohi..."
                  value={formData.teacherNotes}
                  onChange={e => setFormData(prev => ({ ...prev, teacherNotes: e.target.value }))}
                />
                <textarea
                  className="dr-notes-textarea"
                  placeholder="Ota-ona uchun eslatma..."
                  value={formData.parentNotes}
                  onChange={e => setFormData(prev => ({ ...prev, parentNotes: e.target.value }))}
                />
              </div>
            </div>
          )}
        </div>

        <div className="dr-modal-footer">
          <button className="dr-btn dr-btn-cancel" onClick={onClose}>{txt.cancel}</button>
          <button className="dr-btn dr-btn-save" onClick={handleSubmit} disabled={saving}>
            {saving ? '...' : txt.save}
          </button>
        </div>
      </div>
    </div>
  )
}

// Main Component
export default function DailyReportsPage() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const navigate = useNavigate()
  const toast = useToast()

  const [reports, setReports] = useState([])
  const [children, setChildren] = useState([])
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedChild, setSelectedChild] = useState(null)
  const [editingReport, setEditingReport] = useState(null)

  const txt = texts[language] || texts.uz

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]
      const [reportsRes, childrenRes, groupsRes] = await Promise.all([
        api.get(`/daily-reports?date=${today}`),
        api.get('/children'),
        api.get('/groups')
      ])
      setReports(reportsRes.data?.data || reportsRes.data || [])
      setChildren((childrenRes.data?.data || childrenRes.data || []).filter(c => c.isActive !== false))
      setGroups(groupsRes.data?.data || groupsRes.data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Ma\'lumotlarni yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenForm = (child = null, report = null) => {
    setSelectedChild(child)
    setEditingReport(report)
    setShowModal(true)
  }

  const handleSave = async (formData) => {
    try {
      if (editingReport) {
        await api.put(`/daily-reports/${editingReport.id}`, formData)
      } else {
        await api.post('/daily-reports', { childId: selectedChild?.id, ...formData })
      }
      fetchData()
      toast.success('Hisobot saqlandi!')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Xatolik yuz berdi')
      throw error
    }
  }

  const handleSendTelegram = async (reportId) => {
    try {
      await api.post(`/daily-reports/${reportId}/send-telegram`)
      fetchData()
      toast.success('Telegram ga yuborildi!')
    } catch (error) {
      toast.error('Yuborishda xatolik')
    }
  }

  const handleDelete = async (reportId) => {
    if (!window.confirm('Hisobotni o\'chirishni tasdiqlaysizmi?')) return
    try {
      await api.delete(`/daily-reports/${reportId}`)
      fetchData()
      toast.success('O\'chirildi')
    } catch (error) {
      toast.error('O\'chirishda xatolik')
    }
  }

  const filteredReports = useMemo(() => {
    if (selectedGroup === 'all') return reports
    return reports.filter(r => {
      const child = children.find(c => c.id === r.childId)
      return child?.groupId === selectedGroup
    })
  }, [reports, children, selectedGroup])

  const childrenWithoutReport = useMemo(() => {
    return children.filter(c =>
      !reports.find(r => r.childId === c.id) &&
      (selectedGroup === 'all' || c.groupId === selectedGroup)
    )
  }, [children, reports, selectedGroup])

  const getChildById = (id) => children.find(c => c.id === id)
  const getGroupById = (id) => groups.find(g => g.id === id)

  if (loading) {
    return (
      <div className="dr-page">
        <div className="dr-loading">
          <div className="dr-spinner"></div>
          <p>Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dr-page">
      {/* Header */}
      <div className="dr-header">
        <div className="dr-header-content">
          <button className="dr-back-btn" onClick={() => navigate('/admin/dashboard')}>
            ← Orqaga
          </button>
          <div className="dr-header-title">
            <h1>{txt.title}</h1>
            <p>{txt.subtitle}</p>
          </div>
        </div>
        <button className="dr-new-btn" onClick={() => setShowModal(true)}>
          <span>+</span> {txt.newReport}
        </button>
      </div>

      {/* Stats */}
      <div className="dr-stats">
        <StatsCard
          icon="📊"
          label={txt.today}
          value={reports.length}
          color="#3b82f6"
        />
        <StatsCard
          icon="✅"
          label={txt.sent}
          value={reports.filter(r => r.sentToTelegram).length}
          color="#10b981"
        />
        <StatsCard
          icon="⏳"
          label={txt.pending}
          value={reports.filter(r => !r.sentToTelegram).length}
          color="#f59e0b"
        />
        <StatsCard
          icon="👶"
          label={txt.childrenPending}
          value={childrenWithoutReport.length}
          color="#ef4444"
        />
      </div>

      {/* Filter */}
      <div className="dr-filter-section">
        <div className="dr-filter-row">
          <select
            value={selectedGroup}
            onChange={e => setSelectedGroup(e.target.value)}
            className="dr-select"
          >
            <option value="all">{txt.allGroups}</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Children without report */}
      {childrenWithoutReport.length > 0 && (
        <div className="dr-pending-section">
          <h3>⚠️ Hisobot yozilmagan bolalar:</h3>
          <div className="dr-pending-chips">
            {childrenWithoutReport.map(child => (
              <button
                key={child.id}
                className="dr-pending-chip"
                onClick={() => handleOpenForm(child)}
              >
                {child.firstName} {child.lastName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reports Grid */}
      <div className="dr-reports-grid">
        {filteredReports.length === 0 ? (
          <div className="dr-empty">
            <span className="dr-empty-icon">📋</span>
            <p>{txt.noReports}</p>
          </div>
        ) : (
          filteredReports.map(report => {
            const child = getChildById(report.childId)
            const group = child ? getGroupById(child.groupId) : null
            return (
              <ReportCard
                key={report.id}
                report={report}
                child={child}
                group={group}
                txt={txt}
                onEdit={() => handleOpenForm(child, report)}
                onSend={() => handleSendTelegram(report.id)}
                onDelete={() => handleDelete(report.id)}
              />
            )
          })
        )}
      </div>

      {/* Modal */}
      <ReportFormModal
        show={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedChild(null)
          setEditingReport(null)
        }}
        child={selectedChild || (editingReport ? getChildById(editingReport.childId) : null)}
        report={editingReport}
        txt={txt}
        onSave={handleSave}
      />
    </div>
  )
}
