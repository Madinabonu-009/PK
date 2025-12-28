// 🫧 3. LIQUID UI - Suyuqlik effektli interfeys
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import './LiquidUI.css'

// Liquid button with blob effect
export const LiquidButton = ({ children, onClick, className = '', variant = 'primary' }) => {
  const [isPressed, setIsPressed] = useState(false)

  return (
    <motion.button
      className={`liquid-button liquid-button-${variant} ${className}`}
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      animate={{
        scale: isPressed ? 0.95 : 1,
        borderRadius: isPressed ? '30px' : '16px'
      }}
      whileHover={{
        scale: 1.02,
        transition: { type: 'spring', stiffness: 300 }
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <span className="liquid-button-content">{children}</span>
      <motion.div 
        className="liquid-button-blob"
        animate={{
          scale: isPressed ? 1.5 : 1,
          opacity: isPressed ? 0.3 : 0
        }}
      />
    </motion.button>
  )
}

// Liquid card with morphing border
export const LiquidCard = ({ children, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className={`liquid-card ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{
        borderRadius: isHovered ? '24px 8px 24px 8px' : '16px'
      }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <motion.div 
        className="liquid-card-glow"
        animate={{
          opacity: isHovered ? 0.15 : 0,
          scale: isHovered ? 1.1 : 1
        }}
      />
      <div className="liquid-card-content">
        {children}
      </div>
    </motion.div>
  )
}

// Liquid modal with droplet animation
export const LiquidModal = ({ isOpen, onClose, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="liquid-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="liquid-modal"
            initial={{ 
              scale: 0,
              borderRadius: '50%',
              opacity: 0
            }}
            animate={{ 
              scale: 1,
              borderRadius: '24px',
              opacity: 1
            }}
            exit={{ 
              scale: 0,
              borderRadius: '50%',
              opacity: 0
            }}
            transition={{ 
              type: 'spring',
              stiffness: 200,
              damping: 20
            }}
            onClick={e => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Liquid transition between colors
export const LiquidTransition = ({ color1, color2, progress }) => {
  return (
    <div className="liquid-transition">
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <filter id="liquid-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
            />
          </filter>
        </defs>
        <motion.rect
          x="0"
          y="0"
          width="100"
          height="100"
          fill={color1}
        />
        <motion.circle
          cx="50"
          cy="50"
          fill={color2}
          filter="url(#liquid-filter)"
          animate={{
            r: progress * 100
          }}
        />
      </svg>
    </div>
  )
}
