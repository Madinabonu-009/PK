// Living Elements - Tirik elementlar (cursorga reaktsiya)
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import './LivingElements.css'

// Cursordan qochuvchi element
export const ShyElement = ({ children, className = '', intensity = 30 }) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const elementRef = useRef(null)

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!elementRef.current) return
      
      const rect = elementRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      const distX = e.clientX - centerX
      const distY = e.clientY - centerY
      const distance = Math.sqrt(distX * distX + distY * distY)
      
      if (distance < 150) {
        const force = (150 - distance) / 150
        setOffset({
          x: -distX * force * (intensity / 100),
          y: -distY * force * (intensity / 100)
        })
      } else {
        setOffset({ x: 0, y: 0 })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [intensity])

  return (
    <motion.div
      ref={elementRef}
      className={`shy-element ${className}`}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  )
}

// Cursorga tortiluvchi element
export const MagneticElement = ({ children, className = '', intensity = 20 }) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const elementRef = useRef(null)

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!elementRef.current) return
      
      const rect = elementRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      const distX = e.clientX - centerX
      const distY = e.clientY - centerY
      const distance = Math.sqrt(distX * distX + distY * distY)
      
      if (distance < 100) {
        const force = (100 - distance) / 100
        setOffset({
          x: distX * force * (intensity / 100),
          y: distY * force * (intensity / 100)
        })
      } else {
        setOffset({ x: 0, y: 0 })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [intensity])

  return (
    <motion.div
      ref={elementRef}
      className={`magnetic-element ${className}`}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.div>
  )
}

// Nafas oluvchi element
export const BreathingElement = ({ children, className = '', speed = 3 }) => {
  return (
    <motion.div
      className={`breathing-element ${className}`}
      animate={{
        scale: [1, 1.02, 1],
        opacity: [1, 0.9, 1]
      }}
      transition={{
        duration: speed,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  )
}

// Suzuvchi element
export const FloatingElement = ({ children, className = '', range = 10, delay = 0, direction = 'vertical' }) => {
  const animateProps = direction === 'horizontal' 
    ? { x: [-range, range, -range], rotate: [-1, 1, -1] }
    : { y: [-range, range, -range], rotate: [-2, 2, -2] }

  return (
    <motion.div
      className={`floating-element ${className}`}
      animate={animateProps}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: delay
      }}
    >
      {children}
    </motion.div>
  )
}

// Pulsatsiya qiluvchi element
export const PulsingElement = ({ children, className = '', color = 'var(--primary-color)' }) => {
  return (
    <motion.div
      className={`pulsing-element ${className}`}
      style={{ '--pulse-color': color }}
      animate={{
        boxShadow: [
          `0 0 0 0 ${color}40`,
          `0 0 0 20px ${color}00`,
          `0 0 0 0 ${color}40`
        ]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeOut'
      }}
    >
      {children}
    </motion.div>
  )
}

// Tebranuvchi element (hover da)
export const WobblyElement = ({ children, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className={`wobbly-element ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={isHovered ? {
        rotate: [0, -5, 5, -5, 5, 0],
        scale: [1, 1.1, 1]
      } : {}}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  )
}

export default {
  ShyElement,
  MagneticElement,
  BreathingElement,
  FloatingElement,
  PulsingElement,
  WobblyElement
}
