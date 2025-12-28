// 🧠 10. SUBCONSCIOUS GUIDANCE - Bilinmasdan yo'naltirish
import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import './SubconsciousGuidance.css'

// Breathing CTA button - attracts attention subtly
export const BreathingCTA = ({ children, onClick, className = '' }) => {
  return (
    <motion.button
      className={`breathing-cta ${className}`}
      onClick={onClick}
      animate={{
        scale: [1, 1.02, 1],
        boxShadow: [
          '0 4px 20px rgba(102, 126, 234, 0.2)',
          '0 8px 30px rgba(102, 126, 234, 0.4)',
          '0 4px 20px rgba(102, 126, 234, 0.2)'
        ]
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      whileHover={{
        scale: 1.05,
        boxShadow: '0 10px 40px rgba(102, 126, 234, 0.5)'
      }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  )
}

// Attention magnet - subtle movement when in view
export const AttentionMagnet = ({ 
  children, 
  className = '',
  intensity = 'medium' // low, medium, high
}) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, margin: '-100px' })

  const intensitySettings = {
    low: { scale: [1, 1.01, 1], duration: 4 },
    medium: { scale: [1, 1.02, 1], duration: 3 },
    high: { scale: [1, 1.03, 1], duration: 2 }
  }

  const settings = intensitySettings[intensity]

  return (
    <motion.div
      ref={ref}
      className={`attention-magnet ${className}`}
      animate={isInView ? {
        scale: settings.scale
      } : {}}
      transition={{
        duration: settings.duration,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  )
}

// Glow pulse for important elements
export const GlowPulse = ({ children, color = 'var(--primary-color)', className = '' }) => {
  return (
    <motion.div
      className={`glow-pulse ${className}`}
      animate={{
        boxShadow: [
          `0 0 0 0 ${color}00`,
          `0 0 20px 5px ${color}40`,
          `0 0 0 0 ${color}00`
        ]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  )
}

// Subtle arrow indicator
export const SubtleArrow = ({ direction = 'down', className = '' }) => {
  const arrows = {
    up: '↑',
    down: '↓',
    left: '←',
    right: '→'
  }

  const animations = {
    up: { y: [0, -5, 0] },
    down: { y: [0, 5, 0] },
    left: { x: [0, -5, 0] },
    right: { x: [0, 5, 0] }
  }

  return (
    <motion.span
      className={`subtle-arrow ${className}`}
      animate={animations[direction]}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {arrows[direction]}
    </motion.span>
  )
}

// Focus guide - highlights important areas
export const FocusGuide = ({ 
  children, 
  isActive = false,
  className = '' 
}) => {
  return (
    <motion.div
      className={`focus-guide ${className}`}
      animate={isActive ? {
        outline: [
          '2px solid transparent',
          '2px solid var(--primary-color)',
          '2px solid transparent'
        ],
        outlineOffset: ['0px', '4px', '0px']
      } : {}}
      transition={{
        duration: 2,
        repeat: isActive ? Infinity : 0,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  )
}

// Scroll hint
export const ScrollHint = ({ show = true }) => {
  if (!show) return null

  return (
    <motion.div
      className="scroll-hint"
      initial={{ opacity: 0, y: -10 }}
      animate={{ 
        opacity: [0.5, 1, 0.5],
        y: [0, 10, 0]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      <span className="scroll-hint-icon">🖱️</span>
      <span className="scroll-hint-text">Scroll</span>
    </motion.div>
  )
}

// Micro-nudge for form fields
export const MicroNudge = ({ children, shouldNudge = false, className = '' }) => {
  return (
    <motion.div
      className={`micro-nudge ${className}`}
      animate={shouldNudge ? {
        x: [0, -2, 2, -2, 2, 0],
        transition: { duration: 0.5 }
      } : {}}
    >
      {children}
    </motion.div>
  )
}
