import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/common/Toast'
import api from '../../services/api'
import './SettingsPage.css'

// LocalStorage keys
const STORAGE_KEYS = {
  general: 'playkids_settings_general',
  notifications: 'playkids_settings_notifications',
  security: 'playkids_settings_security'
}

// Translations
const texts = {
  uz: {
    title: 'Sozlamalar',
    subtitle: 'Tizim sozlamalari',
    general: 'Umumiy',
    profile: 'Profil',
    notifications: 'Bildirishnomalar',
    security: 'Xavfsizlik',
    database: 'Ma\'lumotlar bazasi',
    kindergartenName: 'Bog\'cha nomi',
    address: 'Manzil',
    phone: 'Telefon',
    email: 'Email',
    workingHours: 'Ish vaqti',
    monthlyFee: 'Oylik to\'lov',
    currency: 'Valyuta',
    language: 'Til',
    name: 'Ism',
    currentPassword: 'Joriy parol',
    newPassword: 'Yangi parol',
    confirmPassword: 'Parolni tasdiqlash',
    emailNotifications: 'Email bildirishnomalar',
    telegramNotifications: 'Telegram bildirishnomalar',
    smsNotifications: 'SMS bildirishnomalar',
    save: 'Saqlash',
    saved: 'Saqlandi!',
    changePassword: 'Parolni o\'zgartirish',
    twoFactor: 'Ikki bosqichli autentifikatsiya',
    sessions: 'Faol sessiyalar',
    logout: 'Chiqish',
    logoutAll: 'Barcha qurilmalardan chiqish',
    fixData: 'Ma\'lumotlarni tuzatish',
    fixDataDesc: 'Agar xodimlar yoki bolalar ko\'rinmasa, bu tugmani bosing',
    reseedData: 'Ma\'lumotlarni qayta yuklash',
    reseedDataDesc: 'JSON fayllardan MongoDB\'ga qayta yuklash',
    fixing: 'Tuzatilmoqda...',
    reseeding: 'Yuklanmoqda...',
    fixSuccess: 'Ma\'lumotlar tuzatildi!',
    reseedSuccess: 'Ma\'lumotlar qayta yuklandi!',
    dbStatus: 'Ma\'lumotlar bazasi holati'
  },
  ru: {
    title: 'Настройки',
    subtitle: 'Системные настройки',
    general: 'Общие',
    profile: 'Профиль',
    notifications: 'Уведомления',
    security: 'Безопасность',
    database: 'База данных',
    kindergartenName: 'Название детсада',
    address: 'Адрес',
    phone: 'Телефон',
    email: 'Email',
    workingHours: 'Рабочие часы',
    monthlyFee: 'Месячная плата',
    currency: 'Валюта',
    language: 'Язык',
    name: 'Имя',
    currentPassword: 'Текущий пароль',
    newPassword: 'Новый пароль',
    confirmPassword: 'Подтвердите пароль',
    emailNotifications: 'Email уведомления',
    telegramNotifications: 'Telegram уведомления',
    smsNotifications: 'SMS уведомления',
    save: 'Сохранить',
    saved: 'Сохранено!',
    changePassword: 'Изменить пароль',
    twoFactor: 'Двухфакторная аутентификация',
    sessions: 'Активные сессии',
    logout: 'Выход',
    logoutAll: 'Выйти со всех устройств',
    fixData: 'Исправить данные',
    fixDataDesc: 'Если сотрудники или дети не отображаются, нажмите эту кнопку',
    reseedData: 'Перезагрузить данные',
    reseedDataDesc: 'Перезагрузить из JSON файлов в MongoDB',
    fixing: 'Исправление...',
    reseeding: 'Загрузка...',
    fixSuccess: 'Данные исправлены!',
    reseedSuccess: 'Данные перезагружены!',
    dbStatus: 'Статус базы данных'
  },
  en: {
    title: 'Settings',
    subtitle: 'System settings',
    general: 'General',
    profile: 'Profile',
    notifications: 'Notifications',
    security: 'Security',
    database: 'Database',
    kindergartenName: 'Kindergarten name',
    address: 'Address',
    phone: 'Phone',
    email: 'Email',
    workingHours: 'Working hours',
    monthlyFee: 'Monthly fee',
    currency: 'Currency',
    language: 'Language',
    name: 'Name',
    currentPassword: 'Current password',
    newPassword: 'New password',
    confirmPassword: 'Confirm password',
    emailNotifications: 'Email notifications',
    telegramNotifications: 'Telegram notifications',
    smsNotifications: 'SMS notifications',
    save: 'Save',
    saved: 'Saved!',
    changePassword: 'Change password',
    twoFactor: 'Two-factor authentication',
    sessions: 'Active sessions',
    logout: 'Logout',
    logoutAll: 'Logout from all devices',
    fixData: 'Fix Data',
    fixDataDesc: 'If staff or children are not showing, click this button',
    reseedData: 'Reseed Data',
    reseedDataDesc: 'Reload from JSON files to MongoDB',
    fixing: 'Fixing...',
    reseeding: 'Loading...',
    fixSuccess: 'Data fixed!',
    reseedSuccess: 'Data reseeded!',
    dbStatus: 'Database Status'
  }
}

// Toggle Switch Component
function ToggleSwitch({ checked, onChange, label }) {
  return (
    <label className="st-toggle">
      <span className="st-toggle-label">{label}</span>
      <div className="st-toggle-switch">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
        <span className="st-toggle-slider"></span>
      </div>
    </label>
  )
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { language, setLanguage } = useLanguage()
  const { user, logout } = useAuth()
  const toast = useToast()

  // Get initial tab from URL or default to 'general'
  const initialTab = searchParams.get('tab') || 'general'
  const [activeTab, setActiveTab] = useState(initialTab)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Default values
  const defaultGeneralSettings = {
    kindergartenName: 'Play Kids',
    address: 'Toshkent, Chilonzor tumani',
    phone: '+998 90 123 45 67',
    email: 'info@playkids.uz',
    workingHours: '08:00 - 18:00',
    monthlyFee: 1500000,
    currency: 'UZS'
  }

  const defaultNotificationSettings = {
    email: true,
    telegram: true,
    sms: false
  }

  const [generalSettings, setGeneralSettings] = useState(defaultGeneralSettings)

  const [profileSettings, setProfileSettings] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  })

  const [notificationSettings, setNotificationSettings] = useState(defaultNotificationSettings)

  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactor: false
  })

  const [dbStatus, setDbStatus] = useState(null)
  const [fixingData, setFixingData] = useState(false)
  const [reseedingData, setReseedingData] = useState(false)

  const txt = texts[language] || texts.uz
  
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  // Sync tab with URL parameter
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab')
    if (tabFromUrl && ['general', 'database', 'profile', 'notifications', 'security'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl)
    }
  }, [searchParams])

  // Load database status
  useEffect(() => {
    const loadDbStatus = async () => {
      try {
        const response = await api.get('/seed/status')
        setDbStatus(response.data)
      } catch (error) {
        console.error('DB status error:', error)
      }
    }
    if (isAdmin) {
      loadDbStatus()
    }
  }, [isAdmin])

  // Load settings from API and localStorage on mount
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true)
      try {
        // Try to load from API first
        const response = await api.get('/settings')
        const apiSettings = response.data

        // Merge API settings with defaults
        if (apiSettings.general) {
          setGeneralSettings(prev => ({ ...prev, ...apiSettings.general }))
        }
        if (apiSettings.notifications) {
          setNotificationSettings(prev => ({ ...prev, ...apiSettings.notifications }))
        }

        // Save to localStorage as backup
        if (apiSettings.general) {
          localStorage.setItem(STORAGE_KEYS.general, JSON.stringify(apiSettings.general))
        }
        if (apiSettings.notifications) {
          localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(apiSettings.notifications))
        }
      } catch {
        // Fallback to localStorage if API fails
        const savedGeneral = localStorage.getItem(STORAGE_KEYS.general)
        if (savedGeneral) {
          try {
            setGeneralSettings(prev => ({ ...prev, ...JSON.parse(savedGeneral) }))
          } catch (e) {
            console.error('Error parsing general settings:', e)
          }
        }

        const savedNotifications = localStorage.getItem(STORAGE_KEYS.notifications)
        if (savedNotifications) {
          try {
            setNotificationSettings(prev => ({ ...prev, ...JSON.parse(savedNotifications) }))
          } catch (e) {
            console.error('Error parsing notification settings:', e)
          }
        }
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  // Teacher faqat profile, notifications va security ko'radi
  const tabs = isAdmin ? [
    { id: 'general', icon: '⚙️', label: txt.general },
    { id: 'database', icon: '🗄️', label: txt.database },
    { id: 'profile', icon: '👤', label: txt.profile },
    { id: 'notifications', icon: '🔔', label: txt.notifications },
    { id: 'security', icon: '🔒', label: txt.security }
  ] : [
    { id: 'profile', icon: '👤', label: txt.profile },
    { id: 'notifications', icon: '🔔', label: txt.notifications },
    { id: 'security', icon: '🔒', label: txt.security }
  ]

  // Teacher uchun default tab profile bo'lsin
  useEffect(() => {
    if (!isAdmin && activeTab === 'general') {
      setActiveTab('profile')
    }
  }, [isAdmin, activeTab])

  const handleSaveGeneral = async () => {
    setSaving(true)
    try {
      // Save to localStorage first (immediate backup)
      localStorage.setItem(STORAGE_KEYS.general, JSON.stringify(generalSettings))
      
      // Save to API
      await api.put('/settings', { general: generalSettings })
      
      toast.success(txt.saved)
    } catch (error) {
      console.error('Save error:', error)
      // localStorage already saved, so show partial success
      toast.success(txt.saved + ' (lokal)')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await api.put('/users/profile', profileSettings)
      toast.success(txt.saved)
    } catch (error) {
      console.error('Profile save error:', error)
      toast.error(error.response?.data?.error || 'Xatolik yuz berdi')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    setSaving(true)
    try {
      // Save to localStorage
      localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(notificationSettings))
      
      // Save to API
      await api.put('/settings', { notifications: notificationSettings })
      
      toast.success(txt.saved)
    } catch (error) {
      console.error('Notifications save error:', error)
      toast.success(txt.saved + ' (lokal)')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      toast.error('Parollar mos kelmadi')
      return
    }
    setSaving(true)
    try {
      await api.put('/users/password', {
        currentPassword: securitySettings.currentPassword,
        newPassword: securitySettings.newPassword
      })
      setSecuritySettings(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
      toast.success(txt.saved)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Xatolik')
    } finally {
      setSaving(false)
    }
  }

  const handleFixData = async () => {
    setFixingData(true)
    try {
      await api.post('/seed/fix')
      toast.success(txt.fixSuccess)
      // Refresh db status
      const response = await api.get('/seed/status')
      setDbStatus(response.data)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Xatolik')
    } finally {
      setFixingData(false)
    }
  }

  const handleReseedData = async () => {
    if (!window.confirm('Barcha ma\'lumotlar qayta yuklanadi. Davom etasizmi?')) return
    setReseedingData(true)
    try {
      await api.post('/seed/reseed')
      toast.success(txt.reseedSuccess)
      // Refresh db status
      const response = await api.get('/seed/status')
      setDbStatus(response.data)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Xatolik')
    } finally {
      setReseedingData(false)
    }
  }

  if (loading) {
    return (
      <div className="st-page">
        <div className="st-header">
          <div className="st-header-content">
            <button className="st-back-btn" onClick={() => navigate('/admin/dashboard')}>
              ← Orqaga
            </button>
            <div className="st-header-title">
              <h1>{txt.title}</h1>
              <p>{txt.subtitle}</p>
            </div>
          </div>
        </div>
        <div className="st-container">
          <div className="st-loading">
            <div className="st-loading-spinner"></div>
            <p>Yuklanmoqda...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="st-page">
      {/* Header */}
      <div className="st-header">
        <div className="st-header-content">
          <button className="st-back-btn" onClick={() => navigate('/admin/dashboard')}>
            ← Orqaga
          </button>
          <div className="st-header-title">
            <h1>{txt.title}</h1>
            <p>{txt.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="st-container">
        {/* Sidebar */}
        <div className="st-sidebar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`st-sidebar-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="st-sidebar-icon">{tab.icon}</span>
              <span className="st-sidebar-label">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="st-content">
          {activeTab === 'general' && (
            <div className="st-section">
              <h2>⚙️ {txt.general}</h2>
              
              <div className="st-form-card">
                <div className="st-form-row">
                  <label>{txt.kindergartenName}</label>
                  <input
                    type="text"
                    value={generalSettings.kindergartenName}
                    onChange={e => setGeneralSettings(prev => ({ ...prev, kindergartenName: e.target.value }))}
                  />
                </div>

                <div className="st-form-row">
                  <label>{txt.address}</label>
                  <input
                    type="text"
                    value={generalSettings.address}
                    onChange={e => setGeneralSettings(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>

                <div className="st-form-grid">
                  <div className="st-form-row">
                    <label>{txt.phone}</label>
                    <input
                      type="tel"
                      value={generalSettings.phone}
                      onChange={e => setGeneralSettings(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="st-form-row">
                    <label>{txt.email}</label>
                    <input
                      type="email"
                      value={generalSettings.email}
                      onChange={e => setGeneralSettings(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="st-form-grid">
                  <div className="st-form-row">
                    <label>{txt.workingHours}</label>
                    <input
                      type="text"
                      value={generalSettings.workingHours}
                      onChange={e => setGeneralSettings(prev => ({ ...prev, workingHours: e.target.value }))}
                    />
                  </div>
                  <div className="st-form-row">
                    <label>{txt.monthlyFee}</label>
                    <input
                      type="number"
                      value={generalSettings.monthlyFee}
                      onChange={e => setGeneralSettings(prev => ({ ...prev, monthlyFee: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="st-form-row">
                  <label>{txt.language}</label>
                  <select value={language} onChange={e => setLanguage(e.target.value)}>
                    <option value="uz">O'zbekcha</option>
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <button className="st-save-btn" onClick={handleSaveGeneral} disabled={saving}>
                  {saving ? '...' : txt.save}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="st-section">
              <h2>🗄️ {txt.database}</h2>
              
              {/* Database Status */}
              <div className="st-form-card">
                <h3>📊 {txt.dbStatus}</h3>
                {dbStatus ? (
                  <div className="st-db-status">
                    <div className="st-db-status-item">
                      <span className="st-db-label">Database:</span>
                      <span className="st-db-value st-db-success">{dbStatus.database}</span>
                    </div>
                    <div className="st-db-counts">
                      <div className="st-db-count-item">
                        <span className="st-db-count-icon">👶</span>
                        <span className="st-db-count-value">{dbStatus.counts?.children || 0}</span>
                        <span className="st-db-count-label">Bolalar</span>
                      </div>
                      <div className="st-db-count-item">
                        <span className="st-db-count-icon">👩‍🏫</span>
                        <span className="st-db-count-value">{dbStatus.counts?.teachers || 0}</span>
                        <span className="st-db-count-label">Xodimlar</span>
                      </div>
                      <div className="st-db-count-item">
                        <span className="st-db-count-icon">👥</span>
                        <span className="st-db-count-value">{dbStatus.counts?.groups || 0}</span>
                        <span className="st-db-count-label">Guruhlar</span>
                      </div>
                      <div className="st-db-count-item">
                        <span className="st-db-count-icon">🖼️</span>
                        <span className="st-db-count-value">{dbStatus.counts?.gallery || 0}</span>
                        <span className="st-db-count-label">Galereya</span>
                      </div>
                      <div className="st-db-count-item">
                        <span className="st-db-count-icon">👤</span>
                        <span className="st-db-count-value">{dbStatus.counts?.users || 0}</span>
                        <span className="st-db-count-label">Foydalanuvchilar</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>Yuklanmoqda...</p>
                )}
              </div>

              {/* Fix Data */}
              <div className="st-form-card">
                <h3>🔧 {txt.fixData}</h3>
                <p className="st-form-desc">{txt.fixDataDesc}</p>
                <button 
                  className="st-save-btn" 
                  onClick={handleFixData} 
                  disabled={fixingData}
                  style={{ background: '#10b981' }}
                >
                  {fixingData ? txt.fixing : txt.fixData}
                </button>
              </div>

              {/* Reseed Data */}
              <div className="st-form-card">
                <h3>🔄 {txt.reseedData}</h3>
                <p className="st-form-desc">{txt.reseedDataDesc}</p>
                <button 
                  className="st-danger-btn" 
                  onClick={handleReseedData} 
                  disabled={reseedingData}
                >
                  {reseedingData ? txt.reseeding : txt.reseedData}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="st-section">
              <h2>👤 {txt.profile}</h2>
              
              <div className="st-form-card">
                <div className="st-profile-header">
                  <div className="st-profile-avatar">
                    {user?.name?.[0] || user?.email?.[0] || '?'}
                  </div>
                  <div className="st-profile-info">
                    <h3>{user?.name || user?.email}</h3>
                    <span>{user?.role}</span>
                  </div>
                </div>

                <div className="st-form-row">
                  <label>{txt.name}</label>
                  <input
                    type="text"
                    value={profileSettings.name}
                    onChange={e => setProfileSettings(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="st-form-row">
                  <label>{txt.email}</label>
                  <input
                    type="email"
                    value={profileSettings.email}
                    onChange={e => setProfileSettings(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="st-form-row">
                  <label>{txt.phone}</label>
                  <input
                    type="tel"
                    value={profileSettings.phone}
                    onChange={e => setProfileSettings(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                <button className="st-save-btn" onClick={handleSaveProfile} disabled={saving}>
                  {saving ? '...' : txt.save}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="st-section">
              <h2>🔔 {txt.notifications}</h2>
              
              <div className="st-form-card">
                <ToggleSwitch
                  label={txt.emailNotifications}
                  checked={notificationSettings.email}
                  onChange={val => setNotificationSettings(prev => ({ ...prev, email: val }))}
                />
                <ToggleSwitch
                  label={txt.telegramNotifications}
                  checked={notificationSettings.telegram}
                  onChange={val => setNotificationSettings(prev => ({ ...prev, telegram: val }))}
                />
                <ToggleSwitch
                  label={txt.smsNotifications}
                  checked={notificationSettings.sms}
                  onChange={val => setNotificationSettings(prev => ({ ...prev, sms: val }))}
                />

                <button className="st-save-btn" onClick={handleSaveNotifications} disabled={saving}>
                  {saving ? '...' : txt.save}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="st-section">
              <h2>🔒 {txt.security}</h2>
              
              <div className="st-form-card">
                <h3>{txt.changePassword}</h3>
                
                <div className="st-form-row">
                  <label>{txt.currentPassword}</label>
                  <input
                    type="password"
                    value={securitySettings.currentPassword}
                    onChange={e => setSecuritySettings(prev => ({ ...prev, currentPassword: e.target.value }))}
                  />
                </div>

                <div className="st-form-row">
                  <label>{txt.newPassword}</label>
                  <input
                    type="password"
                    value={securitySettings.newPassword}
                    onChange={e => setSecuritySettings(prev => ({ ...prev, newPassword: e.target.value }))}
                  />
                </div>

                <div className="st-form-row">
                  <label>{txt.confirmPassword}</label>
                  <input
                    type="password"
                    value={securitySettings.confirmPassword}
                    onChange={e => setSecuritySettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                </div>

                <button className="st-save-btn" onClick={handleChangePassword} disabled={saving}>
                  {saving ? '...' : txt.changePassword}
                </button>
              </div>

              <div className="st-form-card">
                <h3>🚪 {txt.logout}</h3>
                <button className="st-danger-btn" onClick={logout}>
                  {txt.logout}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
