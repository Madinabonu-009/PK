/**
 * Pulsing CTA Buttons
 * Jozibador Call-to-Action tugmalari
 */
import { memo, forwardRef } from 'react'
import { motion } from 'framer-motion'
import './PulsingCTA.css'

export const PulsingButton = memo(forwardRef(function PulsingButton({ 
  children, 
  variant = 'primary', // 'primary', 'secondary', 'glow', 'rainbow'
  size = 'medium', // 'small', 'medium', 'large'
  pulse = true,
  glow = true,
  className = '',
  onClick,
  ...props 
}, ref) {
  return (
    <motion.button
      ref={ref}
      className={`pulsing-btn pulsing-btn--${variant} pulsing-btn--${size} ${pulse ? 'pulsing-btn--pulse' : ''} ${glow ? 'pulsing-btn--glow' : ''} ${className}`}
      whileHover={{ scale: 1.05, y: -3 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      {...props}
    >
      <span className="pulsing-btn__bg" />
      <span className="pulsing-btn__glow" />
      <span className="pulsing-btn__content">{children}</span>
      {pulse && <span className="pulsing-btn__ripple" />}
    </motion.button>
  )
}))

export const MagneticButton = memo(function MagneticButton({ 
  children, 
  className = '',
  onClick,
  ...props 
}) {
  const handleMouseMove = (e) => {
    const btn = e.currentTarget
    const rect = btn.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    
    btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`
  }

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = 'translate(0, 0)'
  }

  return (
    <motion.button
      className={`magnetic-btn ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.button>
  )
})

export const ShinyButton = memo(function ShinyButton({ 
  children, 
  className = '',
  onClick,
  ...props 
}) {
  return (
    <motion.button
      className={`shiny-btn ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      {...props}
    >
      <span className="shiny-btn__shine" />
      <span className="shiny-btn__content">{children}</span>
    </motion.button>
  )
})

export const RainbowButton = memo(function RainbowButton({ 
  children, 
  className = '',
  onClick,
  ...props 
}) {
  return (
    <motion.button
      className={`rainbow-btn ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      {...props}
    >
      <span className="rainbow-btn__bg" />
      <span className="rainbow-btn__content">{children}</span>
    </motion.button>
  )
})

export const FloatingActionButton = memo(function FloatingActionButton({ 
  children, 
  position = 'bottom-right', // 'bottom-right', 'bottom-left', 'bottom-center'
  className = '',
  onClick,
  ...props 
}) {
  return (
    <motion.button
      className={`fab fab--${position} ${className}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1, rotate: 10 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      {...props}
    >
      <span className="fab__pulse" />
      <span className="fab__content">{children}</span>
    </motion.button>
  )
})

export default PulsingButton
