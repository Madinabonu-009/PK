/**
 * 🎮 KIDS INTERACTIVE COMPONENTS
 * 
 * Bolalar uchun interaktiv, jonli komponentlar
 * Har bosishda vizual javob, katta tugmalar, o'yin hissi
 * 
 * ❌ TAQIQLANADI: Panda emoji, random emoji, flash, mayda elementlar
 * ✅ KERAK: Cartoon-style, idle wiggle, click sparkle, hover float
 */

import { useState, useCallback, useEffect, useRef, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './KidsInteractive.css'

// ═══════════════════════════════════════════════════════════════
// 🎯 GAME BUTTON - O'yin tugmasi (katta, jonli)
// ═══════════════════════════════════════════════════════════════
export const GameButton = memo(function GameButton({
  children,
  onClick,
  color = 'green',
  size = 'large',
  icon,
  disabled = false,
  className = ''
}) {
  const [ripples, setRipples] = useState([])
  const [isPressed, setIsPressed] = useState(false)

  const handleClick = useCallback((e) => {
    if (disabled) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Ripple effect
    const id = Date.now()
    setRipples(prev => [...prev, { id, x, y }])
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600)
    
    onClick?.(e)
  }, [onClick, disabled])

  return (
    <motion.button
      className={`game-button game-button--${color} game-button--${size} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      animate={{
        scale: isPressed ? 0.95 : 1,
        y: isPressed ? 4 : 0
      }}
      whileHover={{ scale: 1.05, y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <span className="game-button__shadow" />
      <span className="game-button__edge" />
      <span className="game-button__front">
        {icon && <span className="game-button__icon">{icon}</span>}
        <span className="game-button__text">{children}</span>
      </span>
      
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="game-button__ripple"
          style={{ left: ripple.x, top: ripple.y }}
        />
      ))}
      
      <span className="game-button__shine" />
    </motion.button>
  )
})

// ═══════════════════════════════════════════════════════════════
// 🌈 COLOR PICKER BALLS - Rang tanlash sharlari
// ═══════════════════════════════════════════════════════════════
export const ColorBalls = memo(function ColorBalls({
  colors = ['#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1', '#ff9ff3'],
  selected,
  onSelect,
  size = 56,
  className = ''
}) {
  return (
    <div className={`color-balls ${className}`}>
      {colors.map((color, index) => (
        <motion.button
          key={color}
          className={`color-ball ${selected === color ? 'color-ball--selected' : ''}`}
          style={{ 
            backgroundColor: color,
            width: size,
            height: size
          }}
          onClick={() => onSelect?.(color)}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            delay: index * 0.1,
            type: 'spring',
            stiffness: 300
          }}
          whileHover={{ scale: 1.2, y: -8 }}
          whileTap={{ scale: 0.9 }}
        >
          {selected === color && (
            <motion.span
              className="color-ball__check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              ✓
            </motion.span>
          )}
          <span className="color-ball__shine" />
        </motion.button>
      ))}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════
// ⭐ STAR RATING - Yulduz reytingi (bolalar uchun)
// ═══════════════════════════════════════════════════════════════
export const StarRating = memo(function StarRating({
  value = 0,
  max = 5,
  onChange,
  size = 48,
  readonly = false,
  className = ''
}) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className={`star-rating ${className}`}>
      {Array.from({ length: max }).map((_, index) => {
        const starValue = index + 1
        const isFilled = starValue <= (hovered || value)
        
        return (
          <motion.button
            key={index}
            className={`star-rating__star ${isFilled ? 'star-rating__star--filled' : ''}`}
            style={{ width: size, height: size }}
            onClick={() => !readonly && onChange?.(starValue)}
            onMouseEnter={() => !readonly && setHovered(starValue)}
            onMouseLeave={() => setHovered(0)}
            disabled={readonly}
            whileHover={!readonly ? { scale: 1.3, rotate: 15 } : {}}
            whileTap={!readonly ? { scale: 0.9 } : {}}
            animate={isFilled ? {
              scale: [1, 1.2, 1],
              rotate: [0, 10, 0]
            } : {}}
            transition={{ duration: 0.3 }}
          >
            <svg viewBox="0 0 24 24" className="star-rating__svg">
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill={isFilled ? '#ffd54f' : '#e0e0e0'}
                stroke={isFilled ? '#f9a825' : '#bdbdbd'}
                strokeWidth="1"
              />
            </svg>
          </motion.button>
        )
      })}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════
// 🎪 BOUNCY CARD - Sakrovchi karta
// ═══════════════════════════════════════════════════════════════
export const BouncyCard = memo(function BouncyCard({
  children,
  color = 'blue',
  onClick,
  delay = 0,
  className = ''
}) {
  return (
    <motion.div
      className={`bouncy-card bouncy-card--${color} ${className}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay,
        type: 'spring',
        stiffness: 300,
        damping: 20
      }}
      whileHover={{ 
        scale: 1.05, 
        y: -8,
        rotate: Math.random() > 0.5 ? 2 : -2
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="bouncy-card__content">
        {children}
      </div>
      <div className="bouncy-card__shadow" />
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════
// 🎈 FLOATING ICON BUTTON - Suzuvchi ikonka tugma
// ═══════════════════════════════════════════════════════════════
export const FloatingIconButton = memo(function FloatingIconButton({
  icon,
  onClick,
  color = '#4fc3f7',
  size = 64,
  label,
  className = ''
}) {
  const [sparkles, setSparkles] = useState([])

  const handleClick = useCallback((e) => {
    // Sparkle burst
    const newSparkles = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      angle: (i / 6) * 360
    }))
    setSparkles(newSparkles)
    setTimeout(() => setSparkles([]), 600)
    
    onClick?.(e)
  }, [onClick])

  return (
    <div className={`floating-icon-button ${className}`}>
      <motion.button
        className="floating-icon-button__btn"
        style={{ 
          width: size, 
          height: size,
          backgroundColor: color
        }}
        onClick={handleClick}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={{ scale: 1.15, rotate: 10 }}
        whileTap={{ scale: 0.9 }}
      >
        <span className="floating-icon-button__icon">{icon}</span>
        <span className="floating-icon-button__shine" />
        
        {/* Sparkles */}
        <AnimatePresence>
          {sparkles.map(sparkle => (
            <motion.span
              key={sparkle.id}
              className="floating-icon-button__sparkle"
              initial={{ scale: 0, opacity: 1 }}
              animate={{
                scale: 1.5,
                opacity: 0,
                x: Math.cos(sparkle.angle * Math.PI / 180) * 40,
                y: Math.sin(sparkle.angle * Math.PI / 180) * 40
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              ✦
            </motion.span>
          ))}
        </AnimatePresence>
      </motion.button>
      
      {label && (
        <motion.span 
          className="floating-icon-button__label"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {label}
        </motion.span>
      )}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════
// 🎯 PROGRESS STEPS - Qadam ko'rsatkichi
// ═══════════════════════════════════════════════════════════════
export const ProgressSteps = memo(function ProgressSteps({
  steps = 5,
  current = 1,
  onStepClick,
  className = ''
}) {
  return (
    <div className={`progress-steps ${className}`}>
      <div className="progress-steps__track">
        <motion.div
          className="progress-steps__fill"
          initial={{ width: 0 }}
          animate={{ width: `${((current - 1) / (steps - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      
      <div className="progress-steps__dots">
        {Array.from({ length: steps }).map((_, index) => {
          const stepNum = index + 1
          const isCompleted = stepNum < current
          const isCurrent = stepNum === current
          
          return (
            <motion.button
              key={index}
              className={`progress-steps__dot ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
              onClick={() => onStepClick?.(stepNum)}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              {isCompleted ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  ✓
                </motion.span>
              ) : (
                stepNum
              )}
              
              {isCurrent && (
                <motion.span
                  className="progress-steps__pulse"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════
// 🎨 WIGGLE TEXT - Tebranuvchi matn
// ═══════════════════════════════════════════════════════════════
export const WiggleText = memo(function WiggleText({
  children,
  color = '#333',
  className = ''
}) {
  const text = typeof children === 'string' ? children : ''
  
  return (
    <span className={`wiggle-text ${className}`} style={{ color }}>
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          className="wiggle-text__char"
          animate={{
            y: [0, -4, 0],
            rotate: [0, 3, -3, 0]
          }}
          transition={{
            duration: 0.6,
            delay: index * 0.05,
            repeat: Infinity,
            repeatDelay: 2
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  )
})

// ═══════════════════════════════════════════════════════════════
// 🎪 JELLY BUTTON - Jele tugma
// ═══════════════════════════════════════════════════════════════
export const JellyButton = memo(function JellyButton({
  children,
  onClick,
  color = 'blue',
  className = ''
}) {
  return (
    <motion.button
      className={`jelly-button jelly-button--${color} ${className}`}
      onClick={onClick}
      whileHover={{
        scale: [1, 1.1, 0.95, 1.05, 1],
        transition: { duration: 0.4 }
      }}
      whileTap={{
        scale: 0.9,
        transition: { type: 'spring', stiffness: 400 }
      }}
    >
      <span className="jelly-button__content">{children}</span>
      <span className="jelly-button__blob" />
    </motion.button>
  )
})

// ═══════════════════════════════════════════════════════════════
// 🌟 ACHIEVEMENT BADGE - Yutuq nishoni
// ═══════════════════════════════════════════════════════════════
export const AchievementBadge = memo(function AchievementBadge({
  icon,
  title,
  unlocked = false,
  onClick,
  className = ''
}) {
  return (
    <motion.div
      className={`achievement-badge ${unlocked ? 'achievement-badge--unlocked' : ''} ${className}`}
      onClick={onClick}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200 }}
      whileHover={unlocked ? { scale: 1.1, rotate: 5 } : {}}
    >
      <div className="achievement-badge__icon">
        {icon}
        {unlocked && (
          <motion.div
            className="achievement-badge__glow"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>
      {title && <span className="achievement-badge__title">{title}</span>}
      
      {!unlocked && <div className="achievement-badge__lock">🔒</div>}
    </motion.div>
  )
})
