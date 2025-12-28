import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWebSocket } from '../../../context/WebSocketContext'
import './ConnectionStatus.css'

export default function ConnectionStatus() {
  const { connectionStatus, error, reconnectAttempts, connect } = useWebSocket()
  const [showDetails, setShowDetails] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // Auto-dismiss when connected
  useEffect(() => {
    if (connectionStatus === 'connected') {
      setDismissed(false)
    }
  }, [connectionStatus])

  // Don't show if connected or dismissed
  if (connectionStatus === 'connected' || dismissed) {
    return null
  }

  const statusConfig = {
    connecting: {
      icon: '🔄',
      text: 'Ulanmoqda...',
      color: 'warning',
      showRetry: false
    },
    disconnected: {
      icon: '📡',
      text: 'Aloqa uzildi',
      color: 'error',
      showRetry: true
    },
    error: {
      icon: '⚠️',
      text: 'Ulanish xatosi',
      color: 'error',
      showRetry: true
    }
  }

  const config = statusConfig[connectionStatus] || statusConfig.disconnected

  return (
    <AnimatePresence>
      <motion.div
        className={`connection-status connection-status--${config.color}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <div className="connection-status__main">
          <span className="connection-status__icon">{config.icon}</span>
          <span className="connection-status__text">{config.text}</span>
          
          {reconnectAttempts > 0 && (
            <span className="connection-status__attempts">
              (urinish: {reconnectAttempts})
            </span>
          )}

          <div className="connection-status__actions">
            {config.showRetry && (
              <button
                className="connection-status__btn connection-status__btn--retry"
                onClick={connect}
              >
                Qayta ulanish
              </button>
            )}
            
            <button
              className="connection-status__btn connection-status__btn--details"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Yopish' : 'Batafsil'}
            </button>

            <button
              className="connection-status__btn connection-status__btn--dismiss"
              onClick={() => setDismissed(true)}
              title="Yopish"
            >
              ✕
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              className="connection-status__details"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="connection-status__detail-row">
                <span>Holat:</span>
                <span>{connectionStatus}</span>
              </div>
              {error && (
                <div className="connection-status__detail-row">
                  <span>Xato:</span>
                  <span>{error}</span>
                </div>
              )}
              <div className="connection-status__detail-row">
                <span>Urinishlar:</span>
                <span>{reconnectAttempts}</span>
              </div>
              <p className="connection-status__help">
                Agar muammo davom etsa, sahifani yangilang yoki administrator bilan bog'laning.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}
