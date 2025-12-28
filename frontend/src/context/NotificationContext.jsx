/**
 * Notification Context
 * Provides toast notifications throughout the app
 */

import React, { createContext, useContext, useState, useCallback } from 'react'
import PropTypes from 'prop-types'

// Create context
const NotificationContext = createContext(null)

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

// Default duration in ms
const DEFAULT_DURATION = 5000

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])

  // Add notification
  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random()
    const newNotification = {
      id,
      type: NOTIFICATION_TYPES.INFO,
      duration: DEFAULT_DURATION,
      ...notification
    }

    setNotifications((prev) => [...prev, newNotification])

    // Auto remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    return id
  }, [])

  // Remove notification
  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Convenience methods
  const success = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.SUCCESS,
      message,
      ...options
    })
  }, [addNotification])

  const error = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.ERROR,
      message,
      duration: 8000, // Longer duration for errors
      ...options
    })
  }, [addNotification])

  const warning = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.WARNING,
      message,
      ...options
    })
  }, [addNotification])

  const info = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.INFO,
      message,
      ...options
    })
  }, [addNotification])

  // Context value
  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    success,
    error,
    warning,
    info
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer 
        notifications={notifications} 
        onRemove={removeNotification} 
      />
    </NotificationContext.Provider>
  )
}

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired
}

// Notification container component
const NotificationContainer = ({ notifications, onRemove }) => {
  if (notifications.length === 0) return null

  return (
    <div className="notification-container" style={containerStyles}>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}

NotificationContainer.propTypes = {
  notifications: PropTypes.array.isRequired,
  onRemove: PropTypes.func.isRequired
}

// Single notification item
const NotificationItem = ({ notification, onRemove }) => {
  const { id, type, message, title } = notification

  const typeStyles = {
    success: { backgroundColor: '#10b981', borderColor: '#059669' },
    error: { backgroundColor: '#ef4444', borderColor: '#dc2626' },
    warning: { backgroundColor: '#f59e0b', borderColor: '#d97706' },
    info: { backgroundColor: '#3b82f6', borderColor: '#2563eb' }
  }

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }

  return (
    <div 
      className={`notification notification-${type}`}
      style={{ ...itemStyles, ...typeStyles[type] }}
      role="alert"
    >
      <span className="notification-icon" style={iconStyles}>
        {icons[type]}
      </span>
      <div className="notification-content" style={contentStyles}>
        {title && <strong style={titleStyles}>{title}</strong>}
        <span>{message}</span>
      </div>
      <button
        className="notification-close"
        onClick={() => onRemove(id)}
        style={closeStyles}
        aria-label="Yopish"
      >
        ×
      </button>
    </div>
  )
}

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    type: PropTypes.oneOf(Object.values(NOTIFICATION_TYPES)).isRequired,
    message: PropTypes.string.isRequired,
    title: PropTypes.string
  }).isRequired,
  onRemove: PropTypes.func.isRequired
}

// Styles
const containerStyles = {
  position: 'fixed',
  top: '20px',
  right: '20px',
  zIndex: 9999,
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  maxWidth: '400px'
}

const itemStyles = {
  display: 'flex',
  alignItems: 'flex-start',
  padding: '12px 16px',
  borderRadius: '8px',
  borderLeft: '4px solid',
  color: 'white',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  animation: 'slideIn 0.3s ease-out'
}

const iconStyles = {
  marginRight: '12px',
  fontSize: '18px',
  fontWeight: 'bold'
}

const contentStyles = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
}

const titleStyles = {
  fontWeight: '600',
  marginBottom: '2px'
}

const closeStyles = {
  background: 'none',
  border: 'none',
  color: 'white',
  fontSize: '20px',
  cursor: 'pointer',
  padding: '0 0 0 12px',
  opacity: 0.8,
  transition: 'opacity 0.2s'
}

// Custom hook to use notification context
export const useNotification = () => {
  const context = useContext(NotificationContext)
  
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  
  return context
}

export default NotificationContext
