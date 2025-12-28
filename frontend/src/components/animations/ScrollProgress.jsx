/**
 * Scroll Progress Indicator
 * Sahifa scroll progressini ko'rsatuvchi komponent
 */
import { memo, useState, useEffect, useCallback } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import './ScrollProgress.css'

export const ScrollProgressBar = memo(function ScrollProgressBar({ 
  position = 'top', // 'top', 'bottom'
  color = 'gradient', // 'gradient', 'primary', 'rainbow'
  height = 4,
  showPercentage = false,
  className = '' 
}) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
  const [percentage, setPercentage] = useState(0)

  useEffect(() => {
    if (showPercentage) {
      return scrollYProgress.on('change', (v) => {
        setPercentage(Math.round(v * 100))
      })
    }
  }, [scrollYProgress, showPercentage])

  return (
    <div 
      className={`scroll-progress scroll-progress--${position} scroll-progress--${color} ${className}`}
      style={{ '--height': `${height}px` }}
    >
      <motion.div 
        className="scroll-progress__bar"
        style={{ scaleX, transformOrigin: 'left' }}
      />
      {showPercentage && (
        <span className="scroll-progress__percentage">{percentage}%</span>
      )}
    </div>
  )
})

export const ScrollProgressCircle = memo(function ScrollProgressCircle({ 
  size = 50,
  strokeWidth = 4,
  showPercentage = true,
  className = '' 
}) {
  const { scrollYProgress } = useScroll()
  const [percentage, setPercentage] = useState(0)
  
  const circumference = (size - strokeWidth) * Math.PI

  useEffect(() => {
    return scrollYProgress.on('change', (v) => {
      setPercentage(Math.round(v * 100))
    })
  }, [scrollYProgress])

  return (
    <div 
      className={`scroll-circle ${className}`}
      style={{ '--size': `${size}px` }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="scroll-circle__bg"
          cx={size / 2}
          cy={size / 2}
          r={(size - strokeWidth) / 2}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          className="scroll-circle__progress"
          cx={size / 2}
          cy={size / 2}
          r={(size - strokeWidth) / 2}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          style={{
            strokeDashoffset: useSpring(
              scrollYProgress.get() * circumference - circumference,
              { stiffness: 100, damping: 30 }
            )
          }}
        />
      </svg>
      {showPercentage && (
        <span className="scroll-circle__text">{percentage}%</span>
      )}
    </div>
  )
})

export const BackToTop = memo(function BackToTop({ 
  showAfter = 300,
  className = '' 
}) {
  const [visible, setVisible] = useState(false)

  const handleScroll = useCallback(() => {
    setVisible(window.scrollY > showAfter)
  }, [showAfter])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <motion.button
      className={`back-to-top ${className}`}
      onClick={scrollToTop}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: visible ? 1 : 0, 
        scale: visible ? 1 : 0,
        y: visible ? 0 : 20
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label="Yuqoriga qaytish"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </motion.button>
  )
})

export const ScrollIndicator = memo(function ScrollIndicator({ className = '' }) {
  return (
    <div className={`scroll-indicator ${className}`}>
      <div className="scroll-indicator__mouse">
        <div className="scroll-indicator__wheel" />
      </div>
      <span className="scroll-indicator__text">Pastga suring</span>
    </div>
  )
})

export default ScrollProgressBar
