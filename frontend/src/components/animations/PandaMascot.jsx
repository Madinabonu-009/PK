/**
 * 🐼 PANDA MASCOT - RIVOJLANTIRILGAN VERSIYA
 * Play Kids loyihasining asosiy maskoti
 * 
 * Funksiyalar:
 * - 15+ mood animatsiyalar
 * - Interaktiv reaktsiyalar
 * - Speech bubble
 * - Progress tracking
 * - Achievement badges
 * - Floating effects
 */

import { memo, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './PandaMascot.css'

const PANDA_IMAGE = '/images/panda.png'

// ═══════════════════════════════════════════════════════════════
// 🎭 MOOD ANIMATIONS
// ═══════════════════════════════════════════════════════════════
const MOOD_ANIMATIONS = {
  // Asosiy
  happy: { y: [0, -8, 0], rotate: [0, 3, -3, 0], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } },
  wave: { rotate: [0, 15, -5, 15, 0], transition: { duration: 1.5, repeat: Infinity, repeatDelay: 1 } },
  jump: { y: [0, -25, 0], scale: [1, 1.15, 1], transition: { duration: 0.5, repeat: Infinity, repeatDelay: 1.2 } },
  dance: { rotate: [0, 12, -12, 12, -12, 0], y: [0, -8, 0, -8, 0], transition: { duration: 0.8, repeat: Infinity } },
  
  // Emotsional
  excited: { y: [0, -15, 0, -10, 0], scale: [1, 1.1, 1, 1.08, 1], rotate: [0, 5, -5, 3, 0], transition: { duration: 0.6, repeat: Infinity } },
  shy: { rotate: [0, -8, -5, -8, 0], x: [0, -3, 0], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } },
  curious: { rotate: [0, 10, 0, -10, 0], scale: [1, 1.05, 1], transition: { duration: 1.5, repeat: Infinity } },
  love: { scale: [1, 1.1, 1, 1.1, 1], transition: { duration: 1, repeat: Infinity } },
  sad: { y: [0, 2, 0], rotate: [0, -3, 0], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } },
  angry: { x: [-2, 2, -2, 2, 0], transition: { duration: 0.3, repeat: Infinity, repeatDelay: 1 } },
  surprised: { scale: [1, 1.2, 1], y: [0, -10, 0], transition: { duration: 0.4, repeat: Infinity, repeatDelay: 2 } },
  
  // Holatlar
  sleep: { rotate: [0, 2, 0, -2, 0], scale: [1, 1.02, 1], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } },
  think: { rotate: [0, -5, 0], y: [0, -3, 0], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } },
  eat: { scale: [1, 1.05, 1], rotate: [0, 2, -2, 0], transition: { duration: 0.8, repeat: Infinity } },
  play: { rotate: [0, 15, -15, 15, 0], y: [0, -5, 0], transition: { duration: 0.6, repeat: Infinity } },
  
  // Harakatlar
  bounce: { y: [0, -20, 0], transition: { duration: 0.4, repeat: Infinity, repeatDelay: 0.8 } },
  wiggle: { rotate: [0, 5, -5, 5, -5, 0], transition: { duration: 0.5, repeat: Infinity, repeatDelay: 1 } },
  float: { y: [0, -10, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } },
  spin: { rotate: [0, 360], transition: { duration: 2, repeat: Infinity, ease: 'linear' } },
  pulse: { scale: [1, 1.1, 1], transition: { duration: 1, repeat: Infinity } },
  shake: { x: [-5, 5, -5, 5, 0], transition: { duration: 0.4, repeat: Infinity, repeatDelay: 1.5 } },
  nod: { y: [0, 5, 0], transition: { duration: 0.5, repeat: Infinity, repeatDelay: 1 } },
  peek: { x: [0, 15, 0], rotate: [0, 5, 0], transition: { duration: 2, repeat: Infinity, repeatDelay: 2 } },
  idle: { y: [0, -3, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }
}


// ═══════════════════════════════════════════════════════════════
// 🐼 PANDA MASCOT - Asosiy komponent
// ═══════════════════════════════════════════════════════════════
export const PandaMascot = memo(function PandaMascot({
  size = 120,
  animate = true,
  mood = 'happy',
  onClick,
  className = '',
  showShadow = true,
  showEffects = true,
  glowColor = null,
  message = null
}) {
  const [currentMood, setCurrentMood] = useState(mood)
  const [showMessage, setShowMessage] = useState(!!message)

  useEffect(() => {
    setCurrentMood(mood)
  }, [mood])

  const handleClick = useCallback(() => {
    // Click qilganda qisqa reaktsiya
    setCurrentMood('excited')
    setTimeout(() => setCurrentMood(mood), 600)
    onClick?.()
  }, [mood, onClick])

  const glowStyle = glowColor ? { filter: `drop-shadow(0 0 20px ${glowColor})` } : {}

  return (
    <div className={`panda-mascot-wrapper ${className}`}>
      <motion.div
        className={`panda-mascot panda-mascot--${currentMood}`}
        style={{ width: size, height: size, ...glowStyle }}
        onClick={handleClick}
        animate={animate ? MOOD_ANIMATIONS[currentMood] || MOOD_ANIMATIONS.idle : {}}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
      >
        <img src={PANDA_IMAGE} alt="Panda" className="panda-mascot__image" draggable={false} />
        {showShadow && <div className="panda-mascot__shadow" />}
        
        {/* Mood Effects */}
        {showEffects && animate && (
          <>
            {currentMood === 'love' && <LoveHearts />}
            {currentMood === 'sleep' && <SleepZzz />}
            {currentMood === 'think' && <ThinkBubble />}
            {currentMood === 'excited' && <ExcitedStars />}
            {currentMood === 'sad' && <SadTears />}
          </>
        )}
      </motion.div>
      
      {/* Speech Bubble */}
      {message && showMessage && (
        <motion.div
          className="panda-speech-bubble"
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <p>{message}</p>
          <button onClick={() => setShowMessage(false)}>✕</button>
        </motion.div>
      )}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════
// ✨ MOOD EFFECTS
// ═══════════════════════════════════════════════════════════════
const LoveHearts = () => (
  <div className="panda-effect panda-effect--hearts">
    {[0, 1, 2].map(i => (
      <motion.span key={i} initial={{ opacity: 0, y: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0], y: -30, scale: [0, 1, 0.5], x: (i - 1) * 15 }}
        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}>❤️</motion.span>
    ))}
  </div>
)

const SleepZzz = () => (
  <div className="panda-effect panda-effect--sleep">
    {['Z', 'z', 'z'].map((z, i) => (
      <motion.span key={i} className="zzz" initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: [0, 1, 0], y: -20 - i * 10, x: 10 + i * 5 }}
        transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}>{z}</motion.span>
    ))}
  </div>
)

const ThinkBubble = () => (
  <motion.div className="panda-effect panda-effect--think"
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: [0, 1, 1, 0], scale: [0, 1, 1, 0] }}
    transition={{ duration: 3, repeat: Infinity }}>💭</motion.div>
)

const ExcitedStars = () => (
  <div className="panda-effect panda-effect--stars">
    {[0, 1, 2, 3].map(i => (
      <motion.span key={i} initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
        style={{ position: 'absolute', top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}>⭐</motion.span>
    ))}
  </div>
)

const SadTears = () => (
  <div className="panda-effect panda-effect--tears">
    {[0, 1].map(i => (
      <motion.span key={i} initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: [0, 1, 0], y: 20 }}
        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
        style={{ left: i === 0 ? '30%' : '70%' }}>💧</motion.span>
    ))}
  </div>
)


// ═══════════════════════════════════════════════════════════════
// 🐼 PANDA AVATAR - Profil rasmi
// ═══════════════════════════════════════════════════════════════
export const PandaAvatar = memo(function PandaAvatar({
  size = 48, border = true, online = false, badge = null, className = ''
}) {
  return (
    <div className={`panda-avatar ${border ? 'panda-avatar--border' : ''} ${className}`} style={{ width: size, height: size }}>
      <img src={PANDA_IMAGE} alt="Panda" className="panda-avatar__image" draggable={false} />
      {online && <span className="panda-avatar__status panda-avatar__status--online" />}
      {badge && <span className="panda-avatar__badge">{badge}</span>}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════
// 🐼 PANDA LOADING - Yuklanish
// ═══════════════════════════════════════════════════════════════
export const PandaLoading = memo(function PandaLoading({
  size = 80, message = "Yuklanmoqda...", variant = 'bounce', className = ''
}) {
  const variants = {
    bounce: { y: [0, -15, 0], transition: { duration: 0.6, repeat: Infinity } },
    spin: { rotate: 360, transition: { duration: 1.5, repeat: Infinity, ease: 'linear' } },
    pulse: { scale: [1, 1.1, 1], transition: { duration: 0.8, repeat: Infinity } },
    wiggle: { rotate: [0, 10, -10, 0], transition: { duration: 0.5, repeat: Infinity } }
  }

  return (
    <div className={`panda-loading panda-loading--${variant} ${className}`}>
      <motion.div className="panda-loading__mascot" style={{ width: size, height: size }} animate={variants[variant]}>
        <img src={PANDA_IMAGE} alt="Loading" className="panda-loading__image" draggable={false} />
      </motion.div>
      <div className="panda-loading__dots">
        {[0, 1, 2].map(i => (
          <motion.span key={i} className="panda-loading__dot"
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }} />
        ))}
      </div>
      {message && <p className="panda-loading__message">{message}</p>}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════
// 🐼 PANDA WELCOME - Salomlashish
// ═══════════════════════════════════════════════════════════════
export const PandaWelcome = memo(function PandaWelcome({
  name, message = "Xush kelibsiz!", size = 100, onClose, className = ''
}) {
  return (
    <motion.div className={`panda-welcome ${className}`}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', stiffness: 300 }}>
      <motion.div className="panda-welcome__mascot" style={{ width: size, height: size }}
        animate={{ rotate: [0, 10, -10, 10, 0] }} transition={{ duration: 1, delay: 0.3 }}>
        <img src={PANDA_IMAGE} alt="Welcome" className="panda-welcome__image" draggable={false} />
      </motion.div>
      <div className="panda-welcome__content">
        <motion.h3 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>{message}</motion.h3>
        {name && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>{name}</motion.p>}
      </div>
      {onClose && <button className="panda-welcome__close" onClick={onClose}>✕</button>}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════
// 🐼 PANDA SUCCESS - Muvaffaqiyat
// ═══════════════════════════════════════════════════════════════
export const PandaSuccess = memo(function PandaSuccess({
  show, message = "Ajoyib!", subMessage, onComplete, autoHide = true, className = ''
}) {
  useEffect(() => {
    if (show && autoHide) {
      const timer = setTimeout(() => onComplete?.(), 2500)
      return () => clearTimeout(timer)
    }
  }, [show, autoHide, onComplete])

  if (!show) return null

  return (
    <motion.div className={`panda-success ${className}`}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ type: 'spring', stiffness: 300 }}>
      <motion.div className="panda-success__mascot"
        animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }} transition={{ duration: 0.6 }}>
        <img src={PANDA_IMAGE} alt="Success" className="panda-success__image" draggable={false} />
      </motion.div>
      <motion.h3 className="panda-success__message" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>{message}</motion.h3>
      {subMessage && <p className="panda-success__sub">{subMessage}</p>}
      <Confetti count={15} />
    </motion.div>
  )
})

// Confetti component
const Confetti = ({ count = 12 }) => (
  <div className="panda-confetti">
    {Array.from({ length: count }).map((_, i) => (
      <motion.span key={i} className="panda-confetti__particle"
        style={{ backgroundColor: ['#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1', '#ff9ff3', '#a29bfe'][i % 6] }}
        initial={{ x: 0, y: 0, scale: 0, rotate: 0 }}
        animate={{ x: (Math.random() - 0.5) * 200, y: (Math.random() - 0.5) * 200, scale: [0, 1, 0], rotate: Math.random() * 720 }}
        transition={{ duration: 1.2, delay: i * 0.05 }} />
    ))}
  </div>
)


// ═══════════════════════════════════════════════════════════════
// 🐼 PANDA HELPER - Yordam ko'rsatuvchi
// ═══════════════════════════════════════════════════════════════
export const PandaHelper = memo(function PandaHelper({
  message, position = 'bottom-right', show = true, mood = 'happy', onClose, className = ''
}) {
  if (!show) return null

  return (
    <motion.div className={`panda-helper panda-helper--${position} ${className}`}
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.8 }}>
      <motion.div className="panda-helper__mascot" animate={MOOD_ANIMATIONS[mood]} >
        <img src={PANDA_IMAGE} alt="Helper" className="panda-helper__image" draggable={false} />
      </motion.div>
      <div className="panda-helper__bubble">
        <p>{message}</p>
        {onClose && <button className="panda-helper__close" onClick={onClose}>✕</button>}
      </div>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════
// 🐼 PANDA FLOATING - Suzuvchi panda
// ═══════════════════════════════════════════════════════════════
export const PandaFloating = memo(function PandaFloating({
  size = 70, mood = 'float', position = 'bottom-right', onClick, className = ''
}) {
  const positions = {
    'bottom-right': { bottom: 100, right: 24 },
    'bottom-left': { bottom: 100, left: 24 },
    'top-right': { top: 100, right: 24 },
    'top-left': { top: 100, left: 24 }
  }

  return (
    <motion.div className={`panda-floating ${className}`} style={{ position: 'fixed', zIndex: 999, ...positions[position] }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      onClick={onClick}>
      <PandaMascot size={size} mood={mood} showShadow={true} />
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════
// 🐼 PANDA REACTION - Reaktsiya
// ═══════════════════════════════════════════════════════════════
export const PandaReaction = memo(function PandaReaction({
  type = 'happy', show = false, size = 60, duration = 1500, onComplete, className = ''
}) {
  const reactions = {
    happy: { mood: 'happy', emoji: '😊', color: '#ffd54f' },
    sad: { mood: 'sad', emoji: '😢', color: '#90caf9' },
    love: { mood: 'love', emoji: '💕', color: '#ff6b6b' },
    wow: { mood: 'surprised', emoji: '🤩', color: '#a29bfe' },
    think: { mood: 'think', emoji: '🤔', color: '#74b9ff' },
    celebrate: { mood: 'dance', emoji: '🎉', color: '#ffeaa7' },
    angry: { mood: 'angry', emoji: '😤', color: '#ff7675' },
    cool: { mood: 'happy', emoji: '😎', color: '#81ecec' }
  }

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => onComplete?.(), duration)
      return () => clearTimeout(timer)
    }
  }, [show, duration, onComplete])

  if (!show) return null
  const r = reactions[type] || reactions.happy

  return (
    <motion.div className={`panda-reaction ${className}`}
      initial={{ opacity: 0, scale: 0, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0, y: -20 }}
      style={{ backgroundColor: r.color }}>
      <PandaMascot size={size} mood={r.mood} showShadow={false} />
      <motion.span className="panda-reaction__emoji"
        animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>{r.emoji}</motion.span>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════
// 🐼 PANDA PROGRESS - Progress bar
// ═══════════════════════════════════════════════════════════════
export const PandaProgress = memo(function PandaProgress({
  value = 0, max = 100, label, showPercent = true, color = '#4fc3f7', className = ''
}) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100))
  const getMood = () => {
    if (percent >= 100) return 'excited'
    if (percent >= 75) return 'happy'
    if (percent >= 50) return 'curious'
    if (percent >= 25) return 'think'
    return 'idle'
  }

  return (
    <div className={`panda-progress ${className}`}>
      {label && <span className="panda-progress__label">{label}</span>}
      <div className="panda-progress__track">
        <motion.div className="panda-progress__fill" style={{ backgroundColor: color }}
          initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 0.5 }} />
        <motion.div className="panda-progress__panda"
          initial={{ left: 0 }} animate={{ left: `${Math.min(percent, 95)}%` }} transition={{ duration: 0.5 }}>
          <PandaMascot size={28} mood={getMood()} showShadow={false} />
        </motion.div>
      </div>
      {showPercent && <span className="panda-progress__value">{Math.round(percent)}%</span>}
    </div>
  )
})


// ═══════════════════════════════════════════════════════════════
// 🐼 PANDA BADGE - Yutuq nishoni
// ═══════════════════════════════════════════════════════════════
export const PandaBadge = memo(function PandaBadge({
  title, icon = '⭐', unlocked = false, size = 'medium', onClick, className = ''
}) {
  const sizes = { small: { panda: 35, badge: 70 }, medium: { panda: 50, badge: 100 }, large: { panda: 70, badge: 140 } }
  const s = sizes[size] || sizes.medium

  return (
    <motion.div className={`panda-badge ${unlocked ? 'panda-badge--unlocked' : ''} ${className}`}
      style={{ width: s.badge, height: s.badge }}
      onClick={onClick}
      whileHover={unlocked ? { scale: 1.1, rotate: 5 } : {}}
      whileTap={unlocked ? { scale: 0.95 } : {}}>
      {unlocked ? (
        <PandaMascot size={s.panda} mood="excited" showShadow={false} />
      ) : (
        <div className="panda-badge__locked">🔒</div>
      )}
      <motion.span className="panda-badge__icon"
        animate={unlocked ? { rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}>{icon}</motion.span>
      {title && <p className="panda-badge__title">{title}</p>}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════
// 🐼 PANDA TOOLTIP - Tooltip
// ═══════════════════════════════════════════════════════════════
export const PandaTooltip = memo(function PandaTooltip({
  children, message, position = 'top', className = ''
}) {
  const [show, setShow] = useState(false)

  return (
    <div className={`panda-tooltip-wrapper ${className}`}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div className={`panda-tooltip panda-tooltip--${position}`}
            initial={{ opacity: 0, scale: 0.8, y: position === 'top' ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}>
            <PandaMascot size={24} mood="happy" animate={false} showShadow={false} showEffects={false} />
            <span>{message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════
// 🐼 PANDA BUTTON - Tugma
// ═══════════════════════════════════════════════════════════════
export const PandaButton = memo(function PandaButton({
  children, onClick, variant = 'primary', size = 'medium', disabled = false, loading = false, className = ''
}) {
  const [clicked, setClicked] = useState(false)

  const handleClick = () => {
    if (disabled || loading) return
    setClicked(true)
    setTimeout(() => setClicked(false), 300)
    onClick?.()
  }

  return (
    <motion.button
      className={`panda-button panda-button--${variant} panda-button--${size} ${className}`}
      onClick={handleClick}
      disabled={disabled || loading}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={clicked ? { rotate: [0, -5, 5, 0] } : {}}>
      {loading ? (
        <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>🐼</motion.span>
      ) : (
        <>
          <span className="panda-button__icon">🐼</span>
          <span className="panda-button__text">{children}</span>
        </>
      )}
    </motion.button>
  )
})

// ═══════════════════════════════════════════════════════════════
// 🐼 PANDA CARD - Karta
// ═══════════════════════════════════════════════════════════════
export const PandaCard = memo(function PandaCard({
  children, title, icon, mood = 'happy', onClick, hoverable = true, className = ''
}) {
  return (
    <motion.div className={`panda-card ${className}`}
      onClick={onClick}
      whileHover={hoverable ? { y: -8, boxShadow: '0 12px 40px rgba(0,0,0,0.15)' } : {}}
      whileTap={hoverable ? { scale: 0.98 } : {}}>
      <div className="panda-card__header">
        <PandaMascot size={50} mood={mood} showShadow={false} />
        {icon && <span className="panda-card__icon">{icon}</span>}
      </div>
      {title && <h3 className="panda-card__title">{title}</h3>}
      <div className="panda-card__content">{children}</div>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════
// 🐼 PANDA NOTIFICATION - Bildirishnoma
// ═══════════════════════════════════════════════════════════════
export const PandaNotification = memo(function PandaNotification({
  message, type = 'info', show = true, onClose, autoHide = 5000, className = ''
}) {
  const types = {
    info: { mood: 'curious', icon: 'ℹ️', color: '#4fc3f7' },
    success: { mood: 'excited', icon: '✅', color: '#66bb6a' },
    warning: { mood: 'think', icon: '⚠️', color: '#ffa726' },
    error: { mood: 'sad', icon: '❌', color: '#ef5350' }
  }

  useEffect(() => {
    if (show && autoHide) {
      const timer = setTimeout(() => onClose?.(), autoHide)
      return () => clearTimeout(timer)
    }
  }, [show, autoHide, onClose])

  if (!show) return null
  const t = types[type] || types.info

  return (
    <motion.div className={`panda-notification panda-notification--${type} ${className}`}
      style={{ borderColor: t.color }}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}>
      <PandaMascot size={40} mood={t.mood} showShadow={false} />
      <div className="panda-notification__content">
        <span className="panda-notification__icon">{t.icon}</span>
        <p>{message}</p>
      </div>
      {onClose && <button className="panda-notification__close" onClick={onClose}>✕</button>}
    </motion.div>
  )
})

// Default export
export default PandaMascot
