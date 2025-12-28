import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './SettingsPage.css'

// Settings Categories
const SETTINGS_CATEGORIES = [
  { id: 'general', name: 'Umumiy', icon: '⚙️' },
  { id: 'appearance', name: "Ko'rinish", icon: '🎨' },
  { id: 'notifications', name: 'Bildirishnomalar', icon: '🔔' },
  { id: 'business', name: 'Biznes qoidalari', icon: '📋' },
  { id: 'integrations', name: 'Integratsiyalar', icon: '🔗' },
  { id: 'backup', name: 'Zaxira nusxa', icon: '💾' },
  { id: 'system', name: 'Tizim', icon: '🖥️' }
]

// Languages
const LANGUAGES = [
  { code: 'uz', name: "O'zbek", flag: '🇺🇿' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
]

// Toggle Switch Component
function ToggleSwitch({ checked, onChange, disabled }) {
  return (
    <button
      className={`toggle-switch ${checked ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={() => !disabled && onChange?.(!checked)}
      disabled={disabled}
    >
      <span className="toggle-thumb" />
    </button>
  )
}

// Setting Item Component
function SettingItem({ label, description, children }) {
  return (
    <div className="setting-item">
      <div className="setting-info">
        <span className="setting-label">{label}</span>
        {description && <span className="setting-description">{description}</span>}
      </div>
      <div className="setting-control">
        {children}
      </div>
    </div>
  )
}

// General Settings
function GeneralSettings({ settings, onChange }) {
  return (
    <div className="settings-section">
      <h3 className="section-title">Umumiy sozlamalar</h3>
      
      <SettingItem label="Bog'cha nomi" description="Tizimda ko'rsatiladigan nom">
        <input
          type="text"
          className="setting-input"
          value={settings.kindergartenName || ''}
          onChange={e => onChange({ ...settings, kindergartenName: e.target.value })}
        />
      </SettingItem>

      <SettingItem label="Telefon raqam" description="Aloqa uchun asosiy raqam">
        <input
          type="tel"
          className="setting-input"
          value={settings.phone || ''}
          onChange={e => onChange({ ...settings, phone: e.target.value })}
        />
      </SettingItem>

      <SettingItem label="Email" description="Rasmiy email manzil">
        <input
          type="email"
          className="setting-input"
          value={settings.email || ''}
          onChange={e => onChange({ ...settings, email: e.target.value })}
        />
      </SettingItem>

      <SettingItem label="Manzil" description="Bog'cha manzili">
        <textarea
          className="setting-textarea"
          value={settings.address || ''}
          onChange={e => onChange({ ...settings, address: e.target.value })}
          rows={2}
        />
      </SettingItem>

      <SettingItem label="Til" description="Tizim tili">
        <select
          className="setting-select"
          value={settings.language || 'uz'}
          onChange={e => onChange({ ...settings, language: e.target.value })}
        >
          {LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </SettingItem>

      <SettingItem label="Vaqt zonasi" description="Mahalliy vaqt zonasi">
        <select
          className="setting-select"
          value={settings.timezone || 'Asia/Tashkent'}
          onChange={e => onChange({ ...settings, timezone: e.target.value })}
        >
          <option value="Asia/Tashkent">Toshkent (UTC+5)</option>
          <option value="Asia/Samarkand">Samarqand (UTC+5)</option>
        </select>
      </SettingItem>
    </div>
  )
}

// Appearance Settings
function AppearanceSettings({ settings, onChange }) {
  return (
    <div className="settings-section">
      <h3 className="section-title">Ko'rinish sozlamalari</h3>

      <SettingItem label="Mavzu" description="Yorug' yoki qorong'i rejim">
        <div className="theme-selector">
          {['light', 'dark', 'auto'].map(theme => (
            <button
              key={theme}
              className={`theme-btn ${settings.theme === theme ? 'active' : ''}`}
              onClick={() => onChange({ ...settings, theme })}
            >
              {theme === 'light' ? '☀️ Yorug\'' : theme === 'dark' ? '🌙 Qorong\'i' : '🔄 Avtomatik'}
            </button>
          ))}
        </div>
      </SettingItem>

      <SettingItem label="Asosiy rang" description="Interfeys rangi">
        <div className="color-selector">
          {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(color => (
            <button
              key={color}
              className={`color-btn ${settings.primaryColor === color ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => onChange({ ...settings, primaryColor: color })}
            />
          ))}
        </div>
      </SettingItem>

      <SettingItem label="Ixcham sidebar" description="Sidebar kichikroq ko'rinishda">
        <ToggleSwitch
          checked={settings.compactSidebar}
          onChange={val => onChange({ ...settings, compactSidebar: val })}
        />
      </SettingItem>

      <SettingItem label="Animatsiyalar" description="UI animatsiyalarini yoqish">
        <ToggleSwitch
          checked={settings.animations !== false}
          onChange={val => onChange({ ...settings, animations: val })}
        />
      </SettingItem>
    </div>
  )
}

// Notification Settings
function NotificationSettings({ settings, onChange }) {
  const notificationTypes = [
    { id: 'attendance', name: 'Davomat', description: 'Bola kelganda/ketganda' },
    { id: 'payment', name: "To'lov", description: "To'lov qilinganda yoki muddati o'tganda" },
    { id: 'message', name: 'Xabar', description: 'Yangi xabar kelganda' },
    { id: 'event', name: 'Tadbir', description: 'Yangi tadbir yoki eslatma' },
    { id: 'system', name: 'Tizim', description: 'Tizim xabarlari' }
  ]

  const updateNotification = (type, channel, value) => {
    const notifications = { ...settings.notifications }
    if (!notifications[type]) notifications[type] = {}
    notifications[type][channel] = value
    onChange({ ...settings, notifications })
  }

  return (
    <div className="settings-section">
      <h3 className="section-title">Bildirishnoma sozlamalari</h3>

      <div className="notification-grid">
        <div className="notification-header">
          <span>Tur</span>
          <span>Ilova</span>
          <span>Telegram</span>
          <span>Email</span>
        </div>

        {notificationTypes.map(type => (
          <div key={type.id} className="notification-row">
            <div className="notification-type">
              <span className="type-name">{type.name}</span>
              <span className="type-desc">{type.description}</span>
            </div>
            <ToggleSwitch
              checked={settings.notifications?.[type.id]?.app !== false}
              onChange={val => updateNotification(type.id, 'app', val)}
            />
            <ToggleSwitch
              checked={settings.notifications?.[type.id]?.telegram === true}
              onChange={val => updateNotification(type.id, 'telegram', val)}
            />
            <ToggleSwitch
              checked={settings.notifications?.[type.id]?.email === true}
              onChange={val => updateNotification(type.id, 'email', val)}
            />
          </div>
        ))}
      </div>

      <SettingItem label="Tinch soatlar" description="Bu vaqtda bildirishnoma yuborilmaydi">
        <div className="quiet-hours">
          <input
            type="time"
            className="setting-input time-input"
            value={settings.quietHoursStart || '22:00'}
            onChange={e => onChange({ ...settings, quietHoursStart: e.target.value })}
          />
          <span>dan</span>
          <input
            type="time"
            className="setting-input time-input"
            value={settings.quietHoursEnd || '07:00'}
            onChange={e => onChange({ ...settings, quietHoursEnd: e.target.value })}
          />
          <span>gacha</span>
        </div>
      </SettingItem>
    </div>
  )
}

// Business Rules Settings
function BusinessSettings({ settings, onChange }) {
  return (
    <div className="settings-section">
      <h3 className="section-title">Biznes qoidalari</h3>

      <SettingItem label="Ish kunlari" description="Bog'cha ochiq kunlar">
        <div className="weekday-selector">
          {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map((day, idx) => (
            <button
              key={idx}
              className={`weekday-btn ${settings.workDays?.includes(idx) ? 'active' : ''}`}
              onClick={() => {
                const workDays = settings.workDays || [0, 1, 2, 3, 4]
                const newDays = workDays.includes(idx)
                  ? workDays.filter(d => d !== idx)
                  : [...workDays, idx].sort()
                onChange({ ...settings, workDays: newDays })
              }}
            >
              {day}
            </button>
          ))}
        </div>
      </SettingItem>

      <SettingItem label="Ish vaqti" description="Bog'cha ochiq vaqti">
        <div className="work-hours">
          <input
            type="time"
            className="setting-input time-input"
            value={settings.workStart || '08:00'}
            onChange={e => onChange({ ...settings, workStart: e.target.value })}
          />
          <span>-</span>
          <input
            type="time"
            className="setting-input time-input"
            value={settings.workEnd || '18:00'}
            onChange={e => onChange({ ...settings, workEnd: e.target.value })}
          />
        </div>
      </SettingItem>

      <SettingItem label="Oylik to'lov" description="Standart oylik to'lov summasi">
        <div className="amount-input">
          <input
            type="number"
            className="setting-input"
            value={settings.monthlyFee || ''}
            onChange={e => onChange({ ...settings, monthlyFee: e.target.value })}
          />
          <span className="currency">so'm</span>
        </div>
      </SettingItem>

      <SettingItem label="To'lov muddati" description="Har oyning qaysi kunigacha">
        <div className="amount-input">
          <input
            type="number"
            className="setting-input"
            min="1"
            max="28"
            value={settings.paymentDueDay || 10}
            onChange={e => onChange({ ...settings, paymentDueDay: parseInt(e.target.value) })}
          />
          <span className="currency">-kun</span>
        </div>
      </SettingItem>

      <SettingItem label="Kechikish chegarasi" description="Necha daqiqa kechikish hisoblanadi">
        <div className="amount-input">
          <input
            type="number"
            className="setting-input"
            value={settings.lateThreshold || 15}
            onChange={e => onChange({ ...settings, lateThreshold: parseInt(e.target.value) })}
          />
          <span className="currency">daqiqa</span>
        </div>
      </SettingItem>
    </div>
  )
}

// Integration Settings
function IntegrationSettings({ settings, onChange }) {
  return (
    <div className="settings-section">
      <h3 className="section-title">Integratsiyalar</h3>

      <div className="integration-card">
        <div className="integration-header">
          <span className="integration-icon">📱</span>
          <div className="integration-info">
            <h4>Telegram Bot</h4>
            <p>Ota-onalar bilan aloqa uchun</p>
          </div>
          <span className={`integration-status ${settings.telegramConnected ? 'connected' : ''}`}>
            {settings.telegramConnected ? '✓ Ulangan' : 'Ulanmagan'}
          </span>
        </div>
        <div className="integration-body">
          <SettingItem label="Bot Token" description="@BotFather dan olingan token">
            <input
              type="password"
              className="setting-input"
              value={settings.telegramToken || ''}
              onChange={e => onChange({ ...settings, telegramToken: e.target.value })}
              placeholder="123456:ABC-DEF..."
            />
          </SettingItem>
        </div>
      </div>

      <div className="integration-card">
        <div className="integration-header">
          <span className="integration-icon">💳</span>
          <div className="integration-info">
            <h4>Click/Payme</h4>
            <p>Online to'lov qabul qilish</p>
          </div>
          <span className={`integration-status ${settings.paymentConnected ? 'connected' : ''}`}>
            {settings.paymentConnected ? '✓ Ulangan' : 'Ulanmagan'}
          </span>
        </div>
        <div className="integration-body">
          <SettingItem label="Merchant ID">
            <input
              type="text"
              className="setting-input"
              value={settings.merchantId || ''}
              onChange={e => onChange({ ...settings, merchantId: e.target.value })}
            />
          </SettingItem>
          <SettingItem label="Secret Key">
            <input
              type="password"
              className="setting-input"
              value={settings.merchantSecret || ''}
              onChange={e => onChange({ ...settings, merchantSecret: e.target.value })}
            />
          </SettingItem>
        </div>
      </div>
    </div>
  )
}

// Backup Settings
function BackupSettings({ settings, onBackup, onRestore, lastBackup }) {
  return (
    <div className="settings-section">
      <h3 className="section-title">Zaxira nusxa</h3>

      <div className="backup-status">
        <div className="backup-info">
          <span className="backup-icon">💾</span>
          <div>
            <h4>Oxirgi zaxira</h4>
            <p>{lastBackup ? new Date(lastBackup).toLocaleString('uz-UZ') : 'Hali yaratilmagan'}</p>
          </div>
        </div>
        <div className="backup-actions">
          <button className="backup-btn create" onClick={onBackup}>
            📥 Zaxira yaratish
          </button>
          <button className="backup-btn restore" onClick={onRestore}>
            📤 Tiklash
          </button>
        </div>
      </div>

      <SettingItem label="Avtomatik zaxira" description="Muntazam zaxira nusxa yaratish">
        <ToggleSwitch
          checked={settings.autoBackup}
          onChange={val => settings.onChange?.({ ...settings, autoBackup: val })}
        />
      </SettingItem>

      <SettingItem label="Zaxira davriyligi" description="Qancha vaqtda bir marta">
        <select
          className="setting-select"
          value={settings.backupFrequency || 'daily'}
          disabled={!settings.autoBackup}
        >
          <option value="daily">Har kuni</option>
          <option value="weekly">Har hafta</option>
          <option value="monthly">Har oy</option>
        </select>
      </SettingItem>
    </div>
  )
}

// System Info
function SystemSettings({ systemInfo }) {
  return (
    <div className="settings-section">
      <h3 className="section-title">Tizim ma'lumotlari</h3>

      <div className="system-info-grid">
        <div className="system-info-item">
          <span className="info-label">Versiya</span>
          <span className="info-value">{systemInfo?.version || '1.0.0'}</span>
        </div>
        <div className="system-info-item">
          <span className="info-label">Server holati</span>
          <span className="info-value status-ok">✓ Ishlayapti</span>
        </div>
        <div className="system-info-item">
          <span className="info-label">Ma'lumotlar bazasi</span>
          <span className="info-value">{systemInfo?.dbSize || '0 MB'}</span>
        </div>
        <div className="system-info-item">
          <span className="info-label">Foydalanuvchilar</span>
          <span className="info-value">{systemInfo?.userCount || 0}</span>
        </div>
        <div className="system-info-item">
          <span className="info-label">Bolalar soni</span>
          <span className="info-value">{systemInfo?.childrenCount || 0}</span>
        </div>
        <div className="system-info-item">
          <span className="info-label">Oxirgi yangilanish</span>
          <span className="info-value">{systemInfo?.lastUpdate || '-'}</span>
        </div>
      </div>

      <div className="system-actions">
        <button className="system-btn">🔄 Keshni tozalash</button>
        <button className="system-btn">📋 Loglarni ko'rish</button>
        <button className="system-btn danger">🗑️ Ma'lumotlarni tozalash</button>
      </div>
    </div>
  )
}

// Main Settings Page Component
function SettingsPage({
  settings = {},
  systemInfo = {},
  onSave,
  onBackup,
  onRestore,
  loading = false
}) {
  const [activeCategory, setActiveCategory] = useState('general')
  const [localSettings, setLocalSettings] = useState(settings)
  const [searchQuery, setSearchQuery] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  const handleChange = (newSettings) => {
    setLocalSettings(newSettings)
    setHasChanges(true)
  }

  const handleSave = async () => {
    await onSave?.(localSettings)
    setHasChanges(false)
  }

  const handleReset = () => {
    setLocalSettings(settings)
    setHasChanges(false)
  }

  const renderContent = () => {
    switch (activeCategory) {
      case 'general':
        return <GeneralSettings settings={localSettings} onChange={handleChange} />
      case 'appearance':
        return <AppearanceSettings settings={localSettings} onChange={handleChange} />
      case 'notifications':
        return <NotificationSettings settings={localSettings} onChange={handleChange} />
      case 'business':
        return <BusinessSettings settings={localSettings} onChange={handleChange} />
      case 'integrations':
        return <IntegrationSettings settings={localSettings} onChange={handleChange} />
      case 'backup':
        return <BackupSettings settings={localSettings} onBackup={onBackup} onRestore={onRestore} lastBackup={systemInfo.lastBackup} />
      case 'system':
        return <SystemSettings systemInfo={systemInfo} />
      default:
        return null
    }
  }

  return (
    <div className="settings-page">
      {/* Sidebar */}
      <div className="settings-sidebar">
        <div className="settings-search">
          <input
            type="text"
            placeholder="Sozlamalarni qidirish..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <nav className="settings-nav">
          {SETTINGS_CATEGORIES.map(category => (
            <button
              key={category.id}
              className={`settings-nav-item ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              <span className="nav-icon">{category.icon}</span>
              <span className="nav-label">{category.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="settings-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>

        {/* Save Bar */}
        <AnimatePresence>
          {hasChanges && (
            <motion.div
              className="save-bar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <span>Saqlanmagan o'zgarishlar mavjud</span>
              <div className="save-actions">
                <button className="save-btn secondary" onClick={handleReset}>
                  Bekor qilish
                </button>
                <button className="save-btn primary" onClick={handleSave} disabled={loading}>
                  {loading ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default SettingsPage
export { 
  ToggleSwitch, 
  SettingItem, 
  GeneralSettings, 
  AppearanceSettings, 
  NotificationSettings,
  BusinessSettings,
  IntegrationSettings,
  BackupSettings,
  SystemSettings,
  SETTINGS_CATEGORIES,
  LANGUAGES
}
