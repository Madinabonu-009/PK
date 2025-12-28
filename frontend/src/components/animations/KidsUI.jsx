/**
 * 🎮 KIDS UI COMPONENTS
 * 
 * Bolalar uchun maxsus UI komponentlar (3-7 yosh)
 * Cartoon-style, jonli, o'yin kabi
 * 
 * ✅ XUSUSIYATLAR:
 * - Yumaloq, katta tugmalar
 * - Idle wiggle animatsiya
 * - Hover float effect
 * - Click sparkle/bounce
 * - Success celebration
 * - Error gentle shake
 * - Loading character
 * - Tooltip bubble
 * 
 * ❌ TAQIQLANADI:
 * - Flash, blink
 * - Juda tez animatsiya
 * - Mayda elementlar
 */

import { useState, useCallback, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PropTypes from 'prop-types'
import './KidsUI.css'

// ═══════════════════════════════════════════════════════════════
// 🔘 KIDS BUTTON - Cartoon-style tugma
// ═══════════════════════════════════════════════════════════════
export const KidsButton = memo(function KidsButton({
  children,
  onClick,
  color = 'blue',
  size = 'medium',
  icon,
  disabled = false,
  wiggle = true,
  className = '',
  ...props
}) {
  const [sparkles, setSparkles] = useState([])

  const handleClick = useCallback((e) => {
    if (disabled) return
    
    // Sparkle effect
    const newSparkles = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 60 - 30,
      y: Math.random() * 60 - 30
    }))
    setSparkles(newSparkles)
    setTimeout(() => setSparkles([]), 600)
    
    onClick?.(e)
  }, [onClick, disabled])

  return (
    <motion.button
      className={`kids-button kids-button--${color} kids-button--${size} ${wiggle ? 'kids-button--wiggle' : ''} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      whileHover={{ scale: 1.08, y: -4 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {icon && <span className="kids-button__icon">{icon}</span>}
      <span className="kids-button__text">{children}</span>
      
      {/* Sparkle effects */}
      <AnimatePresence>
        {sparkles.map(sparkle => (
          <motion.span
            key={sparkle.id}
            className="kids-button__sparkle"
            initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
            animate={{ 
              opacity: 0, 
              scale: 1.5, 
              x: sparkle.x, 
              y: sparkle.y 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            ✨
          </motion.span>
        ))}
      </AnimatePresence>
      
      {/* Shine effect */}
      <span className="kids-button__shine" />
    </motion.button>
  )
})

KidsButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  color: PropTypes.oneOf(['blue', 'green', 'yellow', 'pink', 'purple']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  icon: PropTypes.node,
  disabled: PropTypes.bool,
  wiggle: PropTypes.bool,
  className: PropTypes.string
}

// ═══════════════════════════════════════════════════════════════
// 🎴 KIDS CARD - Cartoon-style karta
// ═══════════════════════════════════════════════════════════════
export const KidsCard = memo(function KidsCard({
  children,
  color = 'white',
  onClick,
  hoverable = true,
  className = '',
  ...props
}) {
  return (
    <motion.div
      className={`kids-card kids-card--${color} ${hoverable ? 'kids-card--hoverable' : ''} ${className}`}
      onClick={onClick}
      whileHover={hoverable ? { scale: 1.03, y: -6, rotate: 1 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      {...props}
    >
      {children}
      <div className="kids-card__border" />
    </motion.div>
  )
})

KidsCard.propTypes = {
  children: PropTypes.node.isRequired,
  color: PropTypes.oneOf(['white', 'blue', 'green', 'yellow', 'pink']),
  onClick: PropTypes.func,
  hoverable: PropTypes.bool,
  className: PropTypes.string
}

// ═══════════════════════════════════════════════════════════════
// 🎉 SUCCESS CELEBRATION - Muvaffaqiyat animatsiyasi
// ═══════════════════════════════════════════════════════════════
export const SuccessCelebration = memo(function SuccessCelebration({
  show,
  onComplete,
  message = "Ajoyib! 🎉"
}) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => onComplete?.(), 2500)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="kids-success"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <motion.div 
            className="kids-success__star"
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 0.6, 
              repeat: 3,
              ease: 'easeInOut'
            }}
          >
            ⭐
          </motion.div>
          <motion.p 
            className="kids-success__message"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {message}
          </motion.p>
          
          {/* Confetti particles */}
          <div className="kids-success__confetti">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.span
                key={i}
                className="kids-success__particle"
                style={{
                  '--particle-color': ['#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1', '#ff9ff3'][i % 5]
                }}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  scale: 0,
                  rotate: 0
                }}
                animate={{ 
                  x: (Math.random() - 0.5) * 200,
                  y: (Math.random() - 0.5) * 200,
                  scale: [0, 1, 0],
                  rotate: Math.random() * 360
                }}
                transition={{ 
                  duration: 1.5,
                  delay: i * 0.05,
                  ease: 'easeOut'
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

SuccessCelebration.propTypes = {
  show: PropTypes.bool.isRequired,
  onComplete: PropTypes.func,
  message: PropTypes.string
}

// ═══════════════════════════════════════════════════════════════
// ❌ ERROR SHAKE - Xato animatsiyasi (yumshoq)
// ═══════════════════════════════════════════════════════════════
export const ErrorShake = memo(function ErrorShake({
  children,
  trigger,
  message = "Qayta urinib ko'ring"
}) {
  const [showMessage, setShowMessage] = useState(false)

  useEffect(() => {
    if (trigger) {
      setShowMessage(true)
      const timer = setTimeout(() => setShowMessage(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [trigger])

  return (
    <div className="kids-error-wrapper">
      <motion.div
        animate={trigger ? {
          x: [0, -8, 8, -6, 6, -4, 4, 0],
          transition: { duration: 0.5 }
        } : {}}
      >
        {children}
      </motion.div>
      
      <AnimatePresence>
        {showMessage && (
          <motion.div
            className="kids-error-message"
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <span className="kids-error-message__icon">😊</span>
            <span>{message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

ErrorShake.propTypes = {
  children: PropTypes.node.isRequired,
  trigger: PropTypes.bool,
  message: PropTypes.string
}
