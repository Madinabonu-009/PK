// 🔔 10. Notification Animations
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, createContext, useContext } from 'react'
import './Notification.css'

const NotificationContext = createContext()

export const useNotification = () => useContext(NotificationContext)

const notificationVariants = {
  success: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 }
  },
  error: {
    initial: { x: 100, opacity: 0 },
    animate: { 
      x: [0, -10, 10, -10, 10, 0], 
      opacity: 1,
      transition: { x: { duration: 0.5 } }
    },
    exit: { x: 100, opacity: 0 }
  },
  info: {
    initial: { y: -50, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -50, opacity: 0 }
  },
  warning: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 }
  }
}

const icons = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️'
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])

  const addNotification = (message, type = 'info', duration = 4000) => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, message, type }])
    
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }
    
    return id
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const notify = {
    success: (msg, duration) => addNotification(msg, 'success', duration),
    error: (msg, duration) => addNotification(msg, 'error', duration),
    info: (msg, duration) => addNotification(msg, 'info', duration),
    warning: (msg, duration) => addNotification(msg, 'warning', duration)
  }

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      <div className="notification-container">
        <AnimatePresence>
          {notifications.map(notification => (
            <motion.div
              key={notification.id}
              className={`notification notification-${notification.type}`}
              variants={notificationVariants[notification.type]}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: 'spring', damping: 20 }}
              onClick={() => removeNotification(notification.id)}
            >
              <motion.span 
                className="notification-icon"
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {icons[notification.type]}
              </motion.span>
              <span className="notification-message">{notification.message}</span>
              <button className="notification-close">✕</button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  )
}
