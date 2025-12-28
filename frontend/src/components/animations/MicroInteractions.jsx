/**
 * Micro Interactions
 * Kichik hover va click animatsiyalari
 */
import { memo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './MicroInteractions.css'

// Hover effektli karta
export const HoverCard = memo(function HoverCard({ 
  children, 
  className = '',
  hoverEffect = 'lift', // 'lift', 'glow', 'border', 'scale', 'tilt'
  ...props 
}) {
  const effects = {
    lift: { y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' },
    glow: { boxShadow: '0 0 30px rgba(102, 126, 234, 0.4)' },
    border: { borderColor: 'var(--primary-color)' },
    scale: { scale: 1.03 },
    tilt: { rotateX: 5, rotateY: 5 }
  }

  return (
    <motion.div
      className={`hover-card hover-card--${hoverEffect} ${className}`}
      whileHover={effects[hoverEffect]}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      {...props}
    >
      {children}
    </motion.div>
  )
})

// Ripple effekt
export const RippleButton = memo(function RippleButton({ 
  children, 
  className = '',
  onClick,
  ...props 
}) {
  const [ripples, setRipples] = useState([])

  const handleClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const size = Math.max(rect.width, rect.height) * 2

    const newRipple = { x, y, size, id: Date.now() }
    setRipples(prev => [...prev, newRipple])

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id))
    }, 600)

    onClick?.(e)
  }, [onClick])

  return (
    <motion.button
      className={`ripple-btn ${className}`}
      onClick={handleClick}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
      <span className="ripple-container">
        <AnimatePresence>
          {ripples.map(ripple => (
            <motion.span
              key={ripple.id}
              className="ripple"
              initial={{ 
                width: 0, 
                height: 0, 
                opacity: 0.5,
                x: ripple.x,
                y: ripple.y
              }}
              animate={{ 
                width: ripple.size, 
                height: ripple.size, 
                opacity: 0,
                x: ripple.x - ripple.size / 2,
                y: ripple.y - ripple.size / 2
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          ))}
        </AnimatePresence>
      </span>
    </motion.button>
  )
})

// Like/Heart animatsiyasi
export const LikeButton = memo(function LikeButton({ 
  liked = false, 
  onToggle,
  count = 0,
  className = '' 
}) {
  const [isLiked, setIsLiked] = useState(liked)
  const [particles, setParticles] = useState([])

  const handleClick = () => {
    if (!isLiked) {
      // Particle effekt
      const newParticles = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        angle: (i * 60) * (Math.PI / 180)
      }))
      setParticles(newParticles)
      setTimeout(() => setParticles([]), 700)
    }
    setIsLiked(!isLiked)
    onToggle?.(!isLiked)
  }

  return (
    <motion.button
      className={`like-btn ${isLiked ? 'like-btn--liked' : ''} ${className}`}
      onClick={handleClick}
      whileTap={{ scale: 0.8 }}
    >
      <motion.span
        className="like-btn__icon"
        animate={isLiked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {isLiked ? '❤️' : '🤍'}
      </motion.span>
      {count > 0 && <span className="like-btn__count">{count}</span>}
      
      <AnimatePresence>
        {particles.map(particle => (
          <motion.span
            key={particle.id}
            className="like-particle"
            initial={{ scale: 0, x: 0, y: 0 }}
            animate={{ 
              scale: [0, 1, 0],
              x: Math.cos(particle.angle) * 30,
              y: Math.sin(particle.angle) * 30
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            ❤️
          </motion.span>
        ))}
      </AnimatePresence>
    </motion.button>
  )
})

// Bounce effekt
export const BounceElement = memo(function BounceElement({ 
  children, 
  className = '',
  delay = 0 
}) {
  return (
    <motion.div
      className={className}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 15,
        delay 
      }}
      whileHover={{ y: -5 }}
    >
      {children}
    </motion.div>
  )
})

// Shake effekt (xato uchun)
export const ShakeElement = memo(function ShakeElement({ 
  children, 
  shake = false,
  className = '' 
}) {
  return (
    <motion.div
      className={className}
      animate={shake ? {
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.5 }
      } : {}}
    >
      {children}
    </motion.div>
  )
})

// Success checkmark animatsiyasi
export const SuccessCheck = memo(function SuccessCheck({ 
  show = false,
  size = 60,
  className = '' 
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`success-check ${className}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          style={{ width: size, height: size }}
        >
          <motion.svg
            viewBox="0 0 50 50"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.circle
              cx="25"
              cy="25"
              r="23"
              fill="none"
              stroke="#22c55e"
              strokeWidth="3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3 }}
            />
            <motion.path
              d="M14 25 L22 33 L36 19"
              fill="none"
              stroke="#22c55e"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            />
          </motion.svg>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

// Typing indicator
export const TypingIndicator = memo(function TypingIndicator({ className = '' }) {
  return (
    <div className={`typing-indicator ${className}`}>
      <motion.span
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
      />
      <motion.span
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
      />
      <motion.span
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
      />
    </div>
  )
})

export default {
  HoverCard,
  RippleButton,
  LikeButton,
  BounceElement,
  ShakeElement,
  SuccessCheck,
  TypingIndicator
}
