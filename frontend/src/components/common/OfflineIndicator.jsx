import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './OfflineIndicator.css'

const TEXTS = {
  uz: {
    offline: 'Internet aloqasi yo\'q',
    reconnecting: 'Qayta ulanmoqda...',
    reconnected: 'Internet qayta ulandi!'
  },
  ru: {
    offline: 'Нет подключения к интернету',
    reconnecting: 'Переподключение...',
    reconnected: 'Интернет восстановлен!'
  },
  en: {
    offline: 'No internet connection',
    reconnecting: 'Reconnecting...',
    reconnected: 'Back online!'
  }
}

function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [wasOffline, setWasOffline] = useState(false)
  const [showReconnected, setShowReconnected] = useState(false)
  const [language, setLanguage] = useState('uz')

  // Get language from localStorage
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('pk_language')
      if (savedLang) setLanguage(savedLang)
    } catch {
      // Ignore
    }
  }, [])

  const handleOnline = useCallback(() => {
    setIsOnline(true)
    if (wasOffline) {
      setShowReconnected(true)
      setTimeout(() => setShowReconnected(false), 3000)
    }
  }, [wasOffline])

  const handleOffline = useCallback(() => {
    setIsOnline(false)
    setWasOffline(true)
  }, [])

  useEffect(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [handleOnline, handleOffline])

  const txt = TEXTS[language] || TEXTS.uz

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          className="offline-indicator offline"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          role="alert"
          aria-live="assertive"
        >
          <span className="offline-icon">📡</span>
          <span className="offline-text">{txt.offline}</span>
        </motion.div>
      )}
      
      {showReconnected && (
        <motion.div
          className="offline-indicator reconnected"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          role="status"
          aria-live="polite"
        >
          <span className="offline-icon">✅</span>
          <span className="offline-text">{txt.reconnected}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default OfflineIndicator
