import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import notificationService from '../../services/notificationService'
import './NotificationBell.css'

function NotificationBell() {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef(null)

  const texts = {
    uz: {
      title: 'Bildirishnomalar',
      markAllRead: 'Barchasini o\'qilgan deb belgilash',
      clearAll: 'Tozalash',
      noNotifications: 'Bildirishnomalar yo\'q',
      justNow: 'Hozirgina',
      minutesAgo: 'daqiqa oldin',
      hoursAgo: 'soat oldin',
      daysAgo: 'kun oldin'
    },
    ru: {
      title: 'Уведомления',
      markAllRead: 'Отметить все как прочитанные',
      clearAll: 'Очистить',
      noNotifications: 'Нет уведомлений',
      justNow: 'Только что',
      minutesAgo: 'мин. назад',
      hoursAgo: 'ч. назад',
      daysAgo: 'дн. назад'
    },
    en: {
      title: 'Notifications',
      markAllRead: 'Mark all as read',
      clearAll: 'Clear all',
      noNotifications: 'No notifications',
      justNow: 'Just now',
      minutesAgo: 'min ago',
      hoursAgo: 'hours ago',
      daysAgo: 'days ago'
    }
  }
  const txt = texts[language] || texts.uz

  useEffect(() => {
    // Subscribe to notification updates
    const unsubscribe = notificationService.subscribe((notifs) => {
      setNotifications(notifs)
      setUnreadCount(notificationService.getUnreadCount())
    })

    // Initial load
    setNotifications(notificationService.getAll())
    setUnreadCount(notificationService.getUnreadCount())

    return unsubscribe
  }, [])

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatTime = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diff = Math.floor((now - time) / 1000)

    if (diff < 60) return txt.justNow
    if (diff < 3600) return `${Math.floor(diff / 60)} ${txt.minutesAgo}`
    if (diff < 86400) return `${Math.floor(diff / 3600)} ${txt.hoursAgo}`
    return `${Math.floor(diff / 86400)} ${txt.daysAgo}`
  }

  const handleNotificationClick = (notification) => {
    notificationService.markAsRead(notification.id)
    if (notification.link) {
      navigate(notification.link)
    }
    setIsOpen(false)
  }

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high'
      case 'medium': return 'priority-medium'
      default: return 'priority-low'
    }
  }

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button 
        className={`bell-button ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>{txt.title}</h3>
            {notifications.length > 0 && (
              <div className="header-actions">
                <button onClick={() => notificationService.markAllAsRead()}>
                  {txt.markAllRead}
                </button>
                <button onClick={() => notificationService.clearAll()}>
                  {txt.clearAll}
                </button>
              </div>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <span>🔕</span>
                <p>{txt.noNotifications}</p>
              </div>
            ) : (
              notifications.slice(0, 10).map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''} ${getPriorityClass(notification.priority)}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span className="notification-time">{formatTime(notification.timestamp)}</span>
                  </div>
                  <button 
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      notificationService.delete(notification.id)
                    }}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
