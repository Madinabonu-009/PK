/**
 * 🎮 KIDS UI COMPONENTS - Part 2
 * Loading, Tooltip, Character va boshqa komponentlar
 */

import { useState, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PropTypes from 'prop-types'
import './KidsUI.css'

// ═══════════════════════════════════════════════════════════════
// ⏳ KIDS LOADING - Cartoon loading animatsiya
// ═══════════════════════════════════════════════════════════════
export const KidsLoading = memo(function KidsLoading({
  message = "Yuklanmoqda...",
  character = 'star'
}) {
  const characters = {
    star: '⭐',
    rocket: '🚀',
    rainbow: '🌈',
    sun: '☀️',
    cloud: '☁️'
  }

  return (
    <div className="kids-loading">
      <motion.div 
        className="kids-loading__character"
        animate={{
          y: [0, -15, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        {characters[character] || characters.star}
      </motion.div>
      
      <div className="kids-loading__dots">
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            className="kids-loading__dot"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
      
      <motion.p 
        className="kids-loading__message"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {message}
      </motion.p>
    </div>
  )
})

KidsLoading.propTypes = {
  message: PropTypes.string,
  character: PropTypes.oneOf(['star', 'rocket', 'rainbow', 'sun', 'cloud'])
}

// ═══════════════════════════════════════════════════════════════
// 💬 KIDS TOOLTIP - Bubble-style tooltip
// ═══════════════════════════════════════════════════════════════
export const KidsTooltip = memo(function KidsTooltip({
  children,
  content,
  position = 'top',
  color = 'blue'
}) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div 
      className="kids-tooltip-wrapper"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`kids-tooltip kids-tooltip--${position} kids-tooltip--${color}`}
            initial={{ opacity: 0, scale: 0.8, y: position === 'top' ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <span className="kids-tooltip__content">{content}</span>
            <span className="kids-tooltip__arrow" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

KidsTooltip.propTypes = {
  children: PropTypes.node.isRequired,
  content: PropTypes.node.isRequired,
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  color: PropTypes.oneOf(['blue', 'green', 'yellow', 'pink'])
}

// ═══════════════════════════════════════════════════════════════
// 🎪 KIDS BADGE - Cartoon badge/tag
// ═══════════════════════════════════════════════════════════════
export const KidsBadge = memo(function KidsBadge({
  children,
  color = 'blue',
  bounce = true,
  className = ''
}) {
  return (
    <motion.span
      className={`kids-badge kids-badge--${color} ${className}`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={bounce ? { scale: 1.1, rotate: 5 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
    >
      {children}
    </motion.span>
  )
})

KidsBadge.propTypes = {
  children: PropTypes.node.isRequired,
  color: PropTypes.oneOf(['blue', 'green', 'yellow', 'pink', 'purple', 'red']),
  bounce: PropTypes.bool,
  className: PropTypes.string
}

// ═══════════════════════════════════════════════════════════════
// 📊 KIDS PROGRESS - Cartoon progress bar
// ═══════════════════════════════════════════════════════════════
export const KidsProgress = memo(function KidsProgress({
  value = 0,
  max = 100,
  color = 'blue',
  showLabel = true,
  character = '⭐'
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className="kids-progress">
      <div className="kids-progress__track">
        <motion.div
          className={`kids-progress__fill kids-progress__fill--${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        
        {/* Character at the end */}
        <motion.span
          className="kids-progress__character"
          animate={{ 
            x: `${percentage}%`,
            y: [0, -5, 0]
          }}
          transition={{ 
            x: { duration: 0.8, ease: 'easeOut' },
            y: { duration: 0.5, repeat: Infinity }
          }}
        >
          {character}
        </motion.span>
      </div>
      
      {showLabel && (
        <span className="kids-progress__label">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  )
})

KidsProgress.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  color: PropTypes.oneOf(['blue', 'green', 'yellow', 'pink', 'rainbow']),
  showLabel: PropTypes.bool,
  character: PropTypes.string
}

// ═══════════════════════════════════════════════════════════════
// 🎯 KIDS INPUT - Cartoon-style input
// ═══════════════════════════════════════════════════════════════
export const KidsInput = memo(function KidsInput({
  value,
  onChange,
  placeholder = "Yozing...",
  icon,
  color = 'blue',
  className = '',
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <motion.div
      className={`kids-input kids-input--${color} ${isFocused ? 'kids-input--focused' : ''} ${className}`}
      animate={isFocused ? { scale: 1.02 } : { scale: 1 }}
    >
      {icon && <span className="kids-input__icon">{icon}</span>}
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="kids-input__field"
        {...props}
      />
      <motion.span 
        className="kids-input__border"
        animate={isFocused ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
})

KidsInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  icon: PropTypes.node,
  color: PropTypes.oneOf(['blue', 'green', 'yellow', 'pink']),
  className: PropTypes.string
}

// ═══════════════════════════════════════════════════════════════
// 🌟 FLOATING STARS - Decorative floating elements
// ═══════════════════════════════════════════════════════════════
export const FloatingStars = memo(function FloatingStars({
  count = 5,
  colors = ['#feca57', '#ff9ff3', '#48dbfb', '#1dd1a1']
}) {
  return (
    <div className="kids-floating-stars" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <motion.span
          key={i}
          className="kids-floating-star"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            color: colors[i % colors.length],
            fontSize: `${12 + Math.random() * 16}px`
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.5,
            ease: 'easeInOut'
          }}
        >
          ✦
        </motion.span>
      ))}
    </div>
  )
})

FloatingStars.propTypes = {
  count: PropTypes.number,
  colors: PropTypes.arrayOf(PropTypes.string)
}

// Export all from this file only
// KidsButton, KidsCard, SuccessCelebration, ErrorShake are in KidsUI.jsx
