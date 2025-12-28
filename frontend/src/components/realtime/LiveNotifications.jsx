/**
 * Live Notifications Component
 * Real-time notifications display
 */

import { useState, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWebSocket } from '../../hooks/useWebSocket'
import { useLanguage } from '../../context/LanguageContext'
import './LiveNotifications.css'

const translations = {
  uz: {
    notifications: "Bildirishnomalar",
    noNotifications: "Yangi bildirishnomalar yo'q",
    markAllRead: "Barchasini o'qilgan deb belgilash",
    justNow: "Hozirgina",
    minutesAgo: "daqiqa oldin",
    hoursAgo: "soat oldin"
  },
  ru: {
    notifications: "Уведомления",
    noNotifications: "Нет новых уведомлений",
    markAllRead: "Отметить все как прочитанные",
    justNow: "Только что",
    minutesAgo: "минут назад",
    hoursAgo: "часов назад"
  },
  en: {
    notifications: "Notifications",
    noNotifications: "No new notifications",
    markAllRead: "Mark all as read",
    justNow: "Just now",
    minutesAgo: "minutes ago",
    hoursAgo: "hours ago"
  }
}

const notificationIcons = {
  message: '💬',
  payment: '💳',
  attendance: '📅',
  health: '🏥',
  event: '🎉',
  game: '🎮',
  achievement: '🏆',
  system: '🔔'
}

function LiveNotifications({ isOpen, onClose }) {
  const { language } = useLanguage()
  const t = translations[language] || translations.uz
  const { subscribe, isConnected } = useWebSocket()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Subscribe to notifications
    const unsubscribe = subscribe('notification', (data) => {
      setNotifications(prev => [
        { ...data, id: Date.now(), read: false, timestamp: new Date() },
        ...prev
      ].slice(0, 50))
      setUnreadCount(prev => prev + 1)
    })

    return () => unsubscribe?.()
  }, [subscribe])

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const getTimeAgo = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)

    if (minutes < 1) return t.justNow
    if (minutes < 60) return `${minutes} ${t.minutesAgo}`
    return `${hours} ${t.hoursAgo}`
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="live-notifications"
    >
      <div className="notifications-header">
        <h3>
          🔔 {t.notifications}
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </h3>
        {unreadCount > 0 && (
          <button className="mark-read-btn" onClick={markAllAsRead}>
            {t.markAllRead}
          </button>
        )}
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="notifications-list">
        <AnimatePresence>
          {notifications.length === 0 ? (
            <div className="empty-notifications">
              <span className="empty-icon">🔕</span>
              <p>{t.noNotifications}</p>
            </div>
          ) : (
            notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                onClick={() => markAsRead(notification.id)}
              >
                <span className="notification-icon">
                  {notificationIcons[notification.type] || '🔔'}
                </span>
                <div className="notification-content">
                  <p className="notification-title">{notification.title}</p>
                  <p className="notification-body">{notification.body}</p>
                  <span className="notification-time">
                    {getTimeAgo(notification.timestamp)}
                  </span>
                </div>
                {!notification.read && <span className="unread-dot" />}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="connection-status">
        <span className={`status-dot ${isConnected ? 'online' : 'offline'}`} />
        {isConnected ? 'Online' : 'Offline'}
      </div>
    </motion.div>
  )
}

export default memo(LiveNotifications)
