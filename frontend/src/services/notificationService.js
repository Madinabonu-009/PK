// Smart Notification Service
// Handles in-app notifications, browser notifications, and notification preferences

import secureStorage from '../utils/secureStorage'

class NotificationService {
  constructor() {
    this.notifications = []
    this.listeners = []
    this.permission = 'default'
    this.init()
  }

  async init() {
    // Request browser notification permission
    if ('Notification' in window) {
      this.permission = Notification.permission
      if (this.permission === 'default') {
        const result = await Notification.requestPermission()
        this.permission = result
      }
    }
    
    // Load saved notifications from secure storage
    try {
      const saved = secureStorage.getItem('notifications')
      if (saved) {
        this.notifications = JSON.parse(saved)
      }
    } catch (error) {
      console.error('Error loading notifications from storage:', error)
      this.notifications = []
    }
  }

  // Subscribe to notification updates
  subscribe(callback) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
    }
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.notifications))
    try {
      secureStorage.setItem('notifications', JSON.stringify(this.notifications.slice(0, 50)))
    } catch (error) {
      console.error('Error saving notifications to storage:', error)
    }
  }

  // Add a new notification
  add(notification) {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    }
    
    this.notifications.unshift(newNotification)
    this.notifyListeners()
    
    // Show browser notification if permitted
    if (this.permission === 'granted' && notification.showBrowser !== false) {
      this.showBrowserNotification(notification)
    }
    
    return newNotification
  }

  // Show browser notification
  showBrowserNotification(notification) {
    if ('Notification' in window && this.permission === 'granted') {
      const browserNotif = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.type || 'default'
      })
      
      browserNotif.onclick = () => {
        window.focus()
        if (notification.link) {
          window.location.href = notification.link
        }
        browserNotif.close()
      }
      
      // Auto close after 5 seconds
      setTimeout(() => browserNotif.close(), 5000)
    }
  }

  // Mark notification as read
  markAsRead(id) {
    const notification = this.notifications.find(n => n.id === id)
    if (notification) {
      notification.read = true
      this.notifyListeners()
    }
  }

  // Mark all as read
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true)
    this.notifyListeners()
  }

  // Delete notification
  delete(id) {
    this.notifications = this.notifications.filter(n => n.id !== id)
    this.notifyListeners()
  }

  // Clear all notifications
  clearAll() {
    this.notifications = []
    this.notifyListeners()
  }

  // Get unread count
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length
  }

  // Get all notifications
  getAll() {
    return this.notifications
  }

  // Predefined notification types
  static Types = {
    CHILD_ABSENT: 'child_absent',
    PAYMENT_DUE: 'payment_due',
    PAYMENT_RECEIVED: 'payment_received',
    REPORT_MISSING: 'report_missing',
    ENROLLMENT_NEW: 'enrollment_new',
    ENROLLMENT_STATUS: 'enrollment_status',
    EVENT_REMINDER: 'event_reminder',
    SYSTEM: 'system'
  }

  // Create typed notifications
  childAbsent(childName, days) {
    return this.add({
      type: NotificationService.Types.CHILD_ABSENT,
      title: '⚠️ Bola kelmadi',
      message: `${childName} ${days} kundan beri kelmayapti`,
      priority: 'high',
      link: '/admin/attendance'
    })
  }

  paymentDue(childName, amount) {
    return this.add({
      type: NotificationService.Types.PAYMENT_DUE,
      title: '💰 To\'lov eslatmasi',
      message: `${childName} uchun ${amount} so'm to'lov kutilmoqda`,
      priority: 'medium',
      link: '/admin/debts'
    })
  }

  paymentReceived(childName, amount) {
    return this.add({
      type: NotificationService.Types.PAYMENT_RECEIVED,
      title: '✅ To\'lov qabul qilindi',
      message: `${childName} uchun ${amount} so'm to'lov qabul qilindi`,
      priority: 'low',
      link: '/admin/payments'
    })
  }

  newEnrollment(childName) {
    return this.add({
      type: NotificationService.Types.ENROLLMENT_NEW,
      title: '📋 Yangi ariza',
      message: `${childName} uchun yangi ro'yxatdan o'tish arizasi`,
      priority: 'medium',
      link: '/admin/enrollments'
    })
  }

  eventReminder(eventName, date) {
    return this.add({
      type: NotificationService.Types.EVENT_REMINDER,
      title: '📅 Tadbir eslatmasi',
      message: `${eventName} - ${date}`,
      priority: 'medium',
      link: '/calendar'
    })
  }
}

// Singleton instance
const notificationService = new NotificationService()

export default notificationService
export { NotificationService }
