import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import './AdminHeader.css'

function AdminHeader({ onMenuClick, onSearchClick, user, notifications = [], unreadCount = 0 }) {
  const { language, setLanguage } = useLanguage()
  const { logout } = useAuth()
  const { theme, cycleTheme, themeInfo } = useTheme()
  const navigate = useNavigate()
  
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const notifRef = useRef(null)
  const userMenuRef = useRef(null)

  const texts = {
    uz: {
      search: 'Qidirish (Ctrl+K)',
      notifications: 'Bildirishnomalar',
      noNotifications: 'Yangi bildirishnomalar yo\'q',
      viewAll: 'Barchasini ko\'rish',
      profile: 'Profil',
      settings: 'Sozlamalar',
      logout: 'Chiqish',
      today: 'Bugun',
    },
    ru: {
      search: 'Поиск (Ctrl+K)',
      notifications: 'Уведомления',
      noNotifications: 'Нет новых уведомлений',
      viewAll: 'Показать все',
      profile: 'Профиль',
      settings: 'Настройки',
      logout: 'Выход',
      today: 'Сегодня',
    },
    en: {
      search: 'Search (Ctrl+K)',
      notifications: 'Notifications',
      noNotifications: 'No new notifications',
      viewAll: 'View all',
      profile: 'Profile',
      settings: 'Settings',
      logout: 'Logout',
      today: 'Today',
    }
  }

  const txt = texts[language] || texts.uz

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  const formatDate = () => {
    return new Date().toLocaleDateString(
      language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en-US',
      { weekday: 'long', day: 'numeric', month: 'long' }
    )
  }

  const languageOptions = [
    { code: 'uz', label: "O'zbek", flag: '🇺🇿' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ]

  return (
    <header className="admin-header-pro">
      {/* Left Section */}
      <div className="header-left">
        <button className="header-menu-btn mobile-only" onClick={onMenuClick}>
          <span className="menu-icon">☰</span>
        </button>
        <div className="header-date">
          <span className="date-label">{txt.today}</span>
          <span className="date-value">{formatDate()}</span>
        </div>
      </div>

      {/* Center - Search */}
      <button className="header-search" onClick={onSearchClick}>
        <span className="search-icon">🔍</span>
        <span className="search-text">{txt.search}</span>
        <span className="search-shortcut">⌘K</span>
      </button>

      {/* Right Section */}
      <div className="header-right">
        {/* Theme Toggle */}
        <button 
          className="header-theme-btn"
          onClick={cycleTheme}
          title={themeInfo[theme]?.name[language] || theme}
        >
          <span className="theme-icon">{themeInfo[theme]?.icon || '☀️'}</span>
        </button>

        {/* Language Selector */}
        <div className="header-lang">
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="lang-select"
          >
            {languageOptions.map(opt => (
              <option key={opt.code} value={opt.code}>
                {opt.flag} {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Notifications */}
        <div className="header-notifications" ref={notifRef}>
          <button 
            className="notif-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <span className="notif-icon">🔔</span>
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                className="notif-dropdown"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                <div className="notif-header">
                  <span>{txt.notifications}</span>
                  {unreadCount > 0 && <span className="notif-count">{unreadCount}</span>}
                </div>
                <div className="notif-list">
                  {notifications.length === 0 ? (
                    <div className="notif-empty">
                      <span className="notif-empty-icon">📭</span>
                      <span>{txt.noNotifications}</span>
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notif, idx) => (
                      <div key={idx} className={`notif-item ${notif.read ? '' : 'unread'}`}>
                        <span className="notif-item-icon">{notif.icon || '📌'}</span>
                        <div className="notif-item-content">
                          <span className="notif-item-title">{notif.title}</span>
                          <span className="notif-item-time">{notif.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <button className="notif-view-all" onClick={() => navigate('/admin/notifications')}>
                    {txt.viewAll}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Menu */}
        <div className="header-user" ref={userMenuRef}>
          <button 
            className="user-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar-small">
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <span className="user-name-header">{user?.username || 'Admin'}</span>
            <span className="user-chevron">▼</span>
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                className="user-dropdown"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                <button className="user-menu-item" onClick={() => navigate('/admin/settings')}>
                  <span>👤</span>
                  <span>{txt.profile}</span>
                </button>
                <button className="user-menu-item" onClick={() => navigate('/admin/settings')}>
                  <span>⚙️</span>
                  <span>{txt.settings}</span>
                </button>
                <div className="user-menu-divider" />
                <button className="user-menu-item logout" onClick={handleLogout}>
                  <span>🚪</span>
                  <span>{txt.logout}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
