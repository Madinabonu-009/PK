// 🪄 6. Button Micro-Interactions
import { useState } from 'react'
import { motion } from 'framer-motion'
import './AnimatedButton.css'

const AnimatedButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  loading = false,
  className = '',
  type = 'button',
  disabled = false
}) => {
  const [ripples, setRipples] = useState([])

  const handleClick = (e) => {
    if (loading || disabled) return

    // Ripple effect
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const rippleId = Date.now()
    
    setRipples(prev => [...prev, { x, y, id: rippleId }])
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== rippleId))
    }, 600)

    if (onClick) onClick(e)
  }

  return (
    <motion.button
      type={type}
      className={`animated-btn animated-btn-${variant} ${className} ${loading ? 'loading' : ''}`}
      onClick={handleClick}
      disabled={disabled || loading}
      whileHover={{ 
        scale: 1.02,
        y: -2,
        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <span className="btn-content">
        {loading ? (
          <motion.span 
            className="btn-loader"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            ⏳
          </motion.span>
        ) : children}
      </span>
      
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="ripple"
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            left: ripple.x,
            top: ripple.y
          }}
        />
      ))}
    </motion.button>
  )
}

export default AnimatedButton
