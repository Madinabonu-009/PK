/**
 * WOW EFFECTS - 10 ta noyob animatsiya
 * 1. Liquid Morphing Cards
 * 2. 3D Flip Gallery
 * 3. Particle Explosion (Confetti)
 * 4. Aurora Background
 * 5. Glassmorphism Reveal
 * 6. Elastic Bounce Menu
 * 7. Magnetic Cursor
 * 8. Animated Data Visualization
 * 9. Color Wave Transition
 * 10. Staggered List Animation
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import './WowEffects.css'

// 1. LIQUID MORPHING CARD
export const LiquidCard = ({ children, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <motion.div
      className={`liquid-card ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={{
        borderRadius: isHovered ? '30% 70% 70% 30% / 30% 30% 70% 70%' : '50% 50% 50% 50% / 50% 50% 50% 50%'
      }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <motion.div
        className="liquid-card-inner"
        animate={{ scale: isHovered ? 1.02 : 1 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

// 2. 3D FLIP CARD
export const FlipCard = ({ front, back, className = '' }) => {
  const [isFlipped, setIsFlipped] = useState(false)
  
  return (
    <div className={`flip-card-container ${className}`} onClick={() => setIsFlipped(!isFlipped)}>
      <motion.div
        className="flip-card"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="flip-card-front">{front}</div>
        <div className="flip-card-back">{back}</div>
      </motion.div>
    </div>
  )
}


// 3. PARTICLE EXPLOSION (CONFETTI)
export const ParticleExplosion = ({ trigger, colors = ['#667eea', '#764ba2', '#f093fb', '#22c55e', '#f59e0b'] }) => {
  const [particles, setParticles] = useState([])
  
  useEffect(() => {
    if (trigger) {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 200 - 100,
        y: Math.random() * -200 - 50,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        delay: Math.random() * 0.3
      }))
      setParticles(newParticles)
      setTimeout(() => setParticles([]), 2000)
    }
  }, [trigger])
  
  return (
    <div className="particle-container">
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            className="particle"
            initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
            animate={{ 
              x: p.x, 
              y: p.y, 
              opacity: 0, 
              scale: 0,
              rotate: p.rotation 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, delay: p.delay, ease: 'easeOut' }}
            style={{ 
              background: p.color,
              width: p.size,
              height: p.size
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// 4. AURORA BACKGROUND
export const AuroraBackground = ({ children, className = '' }) => {
  return (
    <div className={`aurora-container ${className}`}>
      <div className="aurora-bg">
        <div className="aurora-gradient aurora-1" />
        <div className="aurora-gradient aurora-2" />
        <div className="aurora-gradient aurora-3" />
      </div>
      <div className="aurora-content">{children}</div>
    </div>
  )
}

// 5. GLASSMORPHISM REVEAL
export const GlassReveal = ({ children, delay = 0, className = '' }) => {
  return (
    <motion.div
      className={`glass-reveal ${className}`}
      initial={{ opacity: 0, backdropFilter: 'blur(20px)', y: 30 }}
      whileInView={{ opacity: 1, backdropFilter: 'blur(0px)', y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

// 6. ELASTIC BOUNCE MENU
export const ElasticMenu = ({ items, onSelect, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)
  
  const menuVariants = {
    closed: { scale: 0, opacity: 0 },
    open: { scale: 1, opacity: 1 }
  }
  
  const itemVariants = {
    closed: { y: 20, opacity: 0 },
    open: i => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        type: 'spring',
        stiffness: 300,
        damping: 15
      }
    })
  }
  
  return (
    <div className={`elastic-menu ${className}`}>
      <motion.button
        className="elastic-menu-trigger"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.span animate={{ rotate: isOpen ? 45 : 0 }}>+</motion.span>
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="elastic-menu-items"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            {items.map((item, i) => (
              <motion.button
                key={i}
                className="elastic-menu-item"
                custom={i}
                variants={itemVariants}
                initial="closed"
                animate="open"
                exit="closed"
                onClick={() => { onSelect(item); setIsOpen(false) }}
                whileHover={{ scale: 1.1, x: 10 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.icon && <span className="item-icon">{item.icon}</span>}
                <span>{item.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


// 7. MAGNETIC CURSOR EFFECT
export const MagneticElement = ({ children, strength = 0.3, className = '' }) => {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const springConfig = { stiffness: 150, damping: 15 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)
  
  const handleMouseMove = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) * strength)
    y.set((e.clientY - centerY) * strength)
  }
  
  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }
  
  return (
    <motion.div
      ref={ref}
      className={`magnetic-element ${className}`}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  )
}

// 8. ANIMATED DATA VISUALIZATION
export const AnimatedNumber = ({ value, duration = 2, prefix = '', suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0)
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  
  useEffect(() => {
    if (!isVisible) return
    let start = 0
    const end = parseInt(value)
    const increment = end / (duration * 60)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setDisplayValue(end)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(start))
      }
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [value, duration, isVisible])
  
  return (
    <span ref={ref} className="animated-number">
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  )
}

export const AnimatedProgressBar = ({ value, max = 100, color = '#667eea', label = '' }) => {
  const percentage = (value / max) * 100
  
  return (
    <div className="animated-progress">
      {label && <span className="progress-label">{label}</span>}
      <div className="progress-track">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          whileInView={{ width: `${percentage}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{ background: color }}
        />
      </div>
      <span className="progress-value">{value}/{max}</span>
    </div>
  )
}

// 9. COLOR WAVE TRANSITION
export const ColorWaveTransition = ({ isActive, color = '#667eea', onComplete }) => {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="color-wave"
          initial={{ clipPath: 'circle(0% at 50% 50%)' }}
          animate={{ clipPath: 'circle(150% at 50% 50%)' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          style={{ background: color }}
          onAnimationComplete={onComplete}
        />
      )}
    </AnimatePresence>
  )
}

// 10. STAGGERED LIST ANIMATION
export const StaggeredList = ({ children, staggerDelay = 0.1, className = '' }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: staggerDelay }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 100, damping: 12 }
    }
  }
  
  return (
    <motion.div
      className={`staggered-list ${className}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
    >
      {Array.isArray(children) ? children.map((child, i) => (
        <motion.div key={i} variants={itemVariants}>
          {child}
        </motion.div>
      )) : children}
    </motion.div>
  )
}

// BONUS: Ripple Effect Button
export const RippleButton = ({ children, onClick, className = '', ...props }) => {
  const [ripples, setRipples] = useState([])
  
  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now()
    
    setRipples(prev => [...prev, { id, x, y }])
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600)
    onClick?.(e)
  }
  
  return (
    <button className={`ripple-button ${className}`} onClick={handleClick} {...props}>
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="ripple"
          style={{ left: ripple.x, top: ripple.y }}
        />
      ))}
    </button>
  )
}

// BONUS: Floating Elements
export const FloatingElement = ({ children, amplitude = 10, duration = 3 }) => {
  return (
    <motion.div
      animate={{ y: [-amplitude, amplitude, -amplitude] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}

export default {
  LiquidCard,
  FlipCard,
  ParticleExplosion,
  AuroraBackground,
  GlassReveal,
  ElasticMenu,
  MagneticElement,
  AnimatedNumber,
  AnimatedProgressBar,
  ColorWaveTransition,
  StaggeredList,
  RippleButton,
  FloatingElement
}
