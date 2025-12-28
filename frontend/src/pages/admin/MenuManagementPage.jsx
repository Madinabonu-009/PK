import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { Button, Card, Loading, Input, Modal } from '../../components/common'
import api from '../../services/api'
import './MenuManagementPage.css'

const createEmptyMeal = () => ({ name: '', allergies: [] })

const createEmptyDayMenu = () => ({
  breakfast: createEmptyMeal(),
  lunch: createEmptyMeal(),
  snack: createEmptyMeal()
})

const createEmptyMenu = () => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const menu = {}
  days.forEach(day => {
    menu[day] = createEmptyDayMenu()
  })
  return menu
}

function MenuManagementPage() {
  const { user, logout } = useAuth()
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [menu, setMenu] = useState(createEmptyMenu())
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [autoSend, setAutoSend] = useState(false)
  const [autoSendTime, setAutoSendTime] = useState('08:00')
  const [autoSendDays, setAutoSendDays] = useState(['monday'])

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingMeal, setEditingMeal] = useState(null)
  const [mealForm, setMealForm] = useState({ name: '', allergies: '' })
  const [formErrors, setFormErrors] = useState({})

  const texts = {
    uz: {
      pageTitle: 'Haftalik menyuni boshqarish',
      savePublish: 'Saqlash',
      saving: 'Saqlanmoqda...',
      monday: 'Dushanba',
      tuesday: 'Seshanba',
      wednesday: 'Chorshanba',
      thursday: 'Payshanba',
      friday: 'Juma',
      saturday: 'Shanba',
      breakfast: 'Nonushta',
      lunch: 'Tushlik',
      snack: 'Poldnik',
      notEntered: 'Kiritilmagan',
      editMeal: 'Taomni tahrirlash',
      mealName: 'Taom nomi',
      mealNamePlaceholder: "masalan: Sut bo'tqa, choy, non",
      allergies: 'Allergiyalar (vergul bilan)',
      allergiesPlaceholder: 'masalan: sut, gluten, tuxum',
      allergiesHint: 'Allergiyalarni vergul bilan ajratib yozing',
      cancel: 'Bekor qilish',
      save: 'Saqlash',
      nameRequired: 'Taom nomi kiritilishi shart',
      loadError: 'Menyuni yuklashda xatolik',
      saveError: 'Menyuni saqlashda xatolik',
      saveSuccess: 'Menyu saqlandi!',
      sendNow: 'Hozir yuborish',
      sending: 'Yuborilmoqda...',
      sendSuccess: 'Menyu yuborildi!',
      autoSend: 'Avtomatik yuborish',
      autoSendTime: 'Vaqti',
      autoSendDays: 'Kunlari',
      autoSendOn: 'Yoqilgan',
      autoSendOff: 'O\'chirilgan',
      sendSettings: 'Yuborish sozlamalari'
    },
    ru: {
      pageTitle: 'Управление меню',
      savePublish: 'Сохранить',
      saving: 'Сохранение...',
      monday: 'Понедельник',
      tuesday: 'Вторник',
      wednesday: 'Среда',
      thursday: 'Четверг',
      friday: 'Пятница',
      saturday: 'Суббота',
      breakfast: 'Завтрак',
      lunch: 'Обед',
      snack: 'Полдник',
      notEntered: 'Не указано',
      editMeal: 'Редактировать',
      mealName: 'Название',
      mealNamePlaceholder: 'например: Каша, чай, хлеб',
      allergies: 'Аллергены (через запятую)',
      allergiesPlaceholder: 'например: молоко, глютен',
      allergiesHint: 'Укажите аллергены через запятую',
      cancel: 'Отмена',
      save: 'Сохранить',
      nameRequired: 'Название обязательно',
      loadError: 'Ошибка загрузки',
      saveError: 'Ошибка сохранения',
      saveSuccess: 'Меню сохранено!',
      sendNow: 'Отправить сейчас',
      sending: 'Отправка...',
      sendSuccess: 'Меню отправлено!',
      autoSend: 'Автоотправка',
      autoSendTime: 'Время',
      autoSendDays: 'Дни',
      autoSendOn: 'Включена',
      autoSendOff: 'Выключена',
      sendSettings: 'Настройки отправки'
    },
    en: {
      pageTitle: 'Manage Menu',
      savePublish: 'Save',
      saving: 'Saving...',
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      snack: 'Snack',
      notEntered: 'Not entered',
      editMeal: 'Edit Meal',
      mealName: 'Meal Name',
      mealNamePlaceholder: 'e.g.: Porridge, tea, bread',
      allergies: 'Allergies (comma separated)',
      allergiesPlaceholder: 'e.g.: milk, gluten',
      allergiesHint: 'Enter allergies separated by commas',
      cancel: 'Cancel',
      save: 'Save',
      nameRequired: 'Name is required',
      loadError: 'Error loading',
      saveError: 'Error saving',
      saveSuccess: 'Menu saved!',
      sendNow: 'Send Now',
      sending: 'Sending...',
      sendSuccess: 'Menu sent!',
      autoSend: 'Auto Send',
      autoSendTime: 'Time',
      autoSendDays: 'Days',
      autoSendOn: 'Enabled',
      autoSendOff: 'Disabled',
      sendSettings: 'Send Settings'
    }
  }

  const txt = texts[language]

  const DAYS = [
    { key: 'monday', label: txt.monday },
    { key: 'tuesday', label: txt.tuesday },
    { key: 'wednesday', label: txt.wednesday },
    { key: 'thursday', label: txt.thursday },
    { key: 'friday', label: txt.friday },
    { key: 'saturday', label: txt.saturday }
  ]

  const MEALS = [
    { key: 'breakfast', label: txt.breakfast },
    { key: 'lunch', label: txt.lunch },
    { key: 'snack', label: txt.snack }
  ]


  const fetchMenu = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/menu')
      const data = response.data?.data || response.data
      setMenu(data)
      
      // Load auto-send settings
      const saved = localStorage.getItem('menuAutoSend')
      const savedTime = localStorage.getItem('menuAutoSendTime')
      const savedDays = localStorage.getItem('menuAutoSendDays')
      if (saved) setAutoSend(saved === 'true')
      if (savedTime) setAutoSendTime(savedTime)
      if (savedDays) setAutoSendDays(JSON.parse(savedDays))
    } catch (err) {
      setError(txt.loadError)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMenu() }, [fetchMenu])

  useEffect(() => {
    localStorage.setItem('menuAutoSend', autoSend.toString())
    localStorage.setItem('menuAutoSendTime', autoSendTime)
    localStorage.setItem('menuAutoSendDays', JSON.stringify(autoSendDays))
  }, [autoSend, autoSendTime, autoSendDays])

  const handleLogout = async () => { await logout() }

  const openEditModal = (dayKey, mealKey) => {
    const meal = menu[dayKey]?.[mealKey] || createEmptyMeal()
    setEditingMeal({ dayKey, mealKey })
    setMealForm({ name: meal.name || '', allergies: (meal.allergies || []).join(', ') })
    setFormErrors({})
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setEditingMeal(null)
    setMealForm({ name: '', allergies: '' })
    setFormErrors({})
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setMealForm(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateMealForm = () => {
    const errors = {}
    if (!mealForm.name.trim()) errors.name = txt.nameRequired
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleMealSave = () => {
    if (!validateMealForm()) return
    const allergiesArray = mealForm.allergies.split(',').map(a => a.trim()).filter(a => a.length > 0)
    const updatedMenu = { ...menu }
    updatedMenu[editingMeal.dayKey] = {
      ...updatedMenu[editingMeal.dayKey],
      [editingMeal.mealKey]: { name: mealForm.name.trim(), allergies: allergiesArray }
    }
    setMenu(updatedMenu)
    closeEditModal()
  }

  const handleSaveMenu = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      await api.put('/menu', menu)
      setSuccess(txt.saveSuccess)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.error || txt.saveError)
    } finally {
      setSaving(false)
    }
  }

  const handleSendMenu = async () => {
    try {
      setSending(true)
      setError(null)
      setSuccess(null)
      await api.post('/telegram/send-menu')
      setSuccess(txt.sendSuccess)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Yuborishda xatolik')
      setTimeout(() => setError(null), 3000)
    } finally {
      setSending(false)
    }
  }

  const toggleAutoSendDay = (day) => {
    setAutoSendDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }

  const getDayLabel = (dayKey) => DAYS.find(d => d.key === dayKey)?.label || dayKey
  const getMealLabel = (mealKey) => MEALS.find(m => m.key === mealKey)?.label || mealKey

  if (loading) return <div className="menu-management-page"><Loading text={t('loading')} /></div>

  return (
    <div className="menu-management-page">
      <div className="menu-header">
        <div className="header-left">
          <Button variant="secondary" onClick={() => navigate('/admin/dashboard')}>← {t('back')}</Button>
          <h1>{txt.pageTitle}</h1>
        </div>
        <div className="header-right">
          <span>{t('welcome')}, {user?.username}</span>
          <Button variant="secondary" onClick={handleLogout}>{t('logout')}</Button>
        </div>
      </div>

      {error && <div className="menu-error"><p>{error}</p><Button variant="secondary" onClick={() => setError(null)}>{t('close')}</Button></div>}
      {success && <div className="menu-success"><p>{success}</p></div>}

      <div className="menu-actions">
        <Button onClick={handleSaveMenu} disabled={saving}>{saving ? txt.saving : txt.savePublish}</Button>
        <Button onClick={handleSendMenu} disabled={sending} variant="secondary">{sending ? txt.sending : txt.sendNow}</Button>
      </div>

      <Card className="auto-send-card">
        <div className="auto-send-header">
          <h3>{txt.sendSettings}</h3>
          <label className="auto-send-toggle">
            <input type="checkbox" checked={autoSend} onChange={(e) => setAutoSend(e.target.checked)} />
            <span className="toggle-slider"></span>
            <span className="toggle-label">{autoSend ? txt.autoSendOn : txt.autoSendOff}</span>
          </label>
        </div>
        {autoSend && (
          <div className="auto-send-settings">
            <div className="setting-row">
              <label>{txt.autoSendTime}:</label>
              <input type="time" value={autoSendTime} onChange={(e) => setAutoSendTime(e.target.value)} className="time-input" />
            </div>
            <div className="setting-row">
              <label>{txt.autoSendDays}:</label>
              <div className="days-checkboxes">
                {DAYS.map(day => (
                  <label key={day.key} className="day-checkbox">
                    <input type="checkbox" checked={autoSendDays.includes(day.key)} onChange={() => toggleAutoSendDay(day.key)} />
                    <span>{day.label.slice(0, 3)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      <div className="menu-grid">
        {DAYS.map(day => (
          <Card key={day.key} className="day-card">
            <div className="day-card-header"><h3>{day.label}</h3></div>
            <div className="day-card-body">
              {MEALS.map(meal => {
                const mealData = menu[day.key]?.[meal.key] || createEmptyMeal()
                return (
                  <div key={meal.key} className="meal-item">
                    <div className="meal-header">
                      <span className="meal-label">{meal.label}</span>
                      <Button variant="secondary" size="small" onClick={() => openEditModal(day.key, meal.key)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></Button>
                    </div>
                    <div className="meal-content">
                      <p className="meal-name">{mealData.name || <em className="empty-meal">{txt.notEntered}</em>}</p>
                      {mealData.allergies?.length > 0 && (
                        <div className="allergies">
                          {mealData.allergies.map((a, i) => <span key={i} className="allergy-tag">{a}</span>)}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title={editingMeal ? `${getDayLabel(editingMeal.dayKey)} - ${getMealLabel(editingMeal.mealKey)}` : txt.editMeal} size="medium">
        <form onSubmit={(e) => { e.preventDefault(); handleMealSave(); }} className="meal-form">
          <Input label={txt.mealName} name="name" value={mealForm.name} onChange={handleFormChange} error={formErrors.name} placeholder={txt.mealNamePlaceholder} required />
          <Input label={txt.allergies} name="allergies" value={mealForm.allergies} onChange={handleFormChange} placeholder={txt.allergiesPlaceholder} />
          <p className="form-hint">{txt.allergiesHint}</p>
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={closeEditModal}>{txt.cancel}</Button>
            <Button type="submit">{txt.save}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default MenuManagementPage