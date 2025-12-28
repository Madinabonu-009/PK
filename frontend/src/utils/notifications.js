/**
 * Browser Push Notifications utility
 */

// Check if notifications are supported
export function isNotificationSupported() {
  return 'Notification' in window && 'serviceWorker' in navigator
}

// Request notification permission
export async function requestNotificationPermission() {
  if (!isNotificationSupported()) {
    return false
  }

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

// Get current permission status
export function getNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported'
  return Notification.permission
}

// Show a notification
export function showNotification(title, options = {}) {
  if (!isNotificationSupported()) return null
  if (Notification.permission !== 'granted') return null

  const defaultOptions = {
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [200, 100, 200],
    tag: 'play-kids-notification',
    renotify: true,
    ...options
  }

  // Try to use service worker notification first (works in background)
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(title, defaultOptions)
    })
  } else {
    // Fallback to regular notification
    return new Notification(title, defaultOptions)
  }
}

// Notification templates
export const notifications = {
  newEnrollment: (childName) => showNotification(
    '📋 Yangi ariza!',
    {
      body: `${childName} uchun yangi ariza keldi`,
      tag: 'enrollment'
    }
  ),

  enrollmentAccepted: (childName) => showNotification(
    '✅ Ariza qabul qilindi!',
    {
      body: `${childName} uchun ariza qabul qilindi`,
      tag: 'enrollment-accepted'
    }
  ),

  enrollmentRejected: (childName) => showNotification(
    '❌ Ariza rad etildi',
    {
      body: `${childName} uchun ariza rad etildi`,
      tag: 'enrollment-rejected'
    }
  ),

  newMessage: (senderName) => showNotification(
    '💬 Yangi xabar!',
    {
      body: `${senderName} dan yangi xabar`,
      tag: 'message'
    }
  ),

  newEvent: (eventName) => showNotification(
    '📅 Yangi tadbir!',
    {
      body: eventName,
      tag: 'event'
    }
  ),

  achievementEarned: (achievementName) => showNotification(
    '🏆 Yangi yutuq!',
    {
      body: `Tabriklaymiz! "${achievementName}" medali olindi`,
      tag: 'achievement'
    }
  ),

  paymentReceived: (amount) => showNotification(
    '💰 To\'lov qabul qilindi!',
    {
      body: `${amount} so'm to'lov muvaffaqiyatli amalga oshirildi`,
      tag: 'payment'
    }
  )
}

export default {
  isNotificationSupported,
  requestNotificationPermission,
  getNotificationPermission,
  showNotification,
  notifications
}
