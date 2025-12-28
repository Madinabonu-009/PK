// 🎈 3. Floating Elements (Bolalarcha vibe)
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import './FloatingElements.css'

const FloatingElements = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="floating-elements">
      {/* Bulutlar */}
      <motion.div 
        className="cloud cloud-1"
        animate={{ x: [0, 30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        ☁️
      </motion.div>
      <motion.div 
        className="cloud cloud-2"
        animate={{ x: [0, -40, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      >
        ☁️
      </motion.div>
      <motion.div 
        className="cloud cloud-3"
        animate={{ x: [0, 50, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        ☁️
      </motion.div>

      {/* Sharlar */}
      <motion.div 
        className="balloon balloon-1"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ x: mousePosition.x * 0.5, y: mousePosition.y * 0.5 }}
      >
        🎈
      </motion.div>
      <motion.div 
        className="balloon balloon-2"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        style={{ x: mousePosition.x * 0.3, y: mousePosition.y * 0.3 }}
      >
        🎈
      </motion.div>
      <motion.div 
        className="balloon balloon-3"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        style={{ x: mousePosition.x * 0.7, y: mousePosition.y * 0.7 }}
      >
        🎈
      </motion.div>

      {/* Yulduzlar */}
      <motion.div 
        className="star star-1"
        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        style={{ x: mousePosition.x * 0.4 }}
      >
        ⭐
      </motion.div>
      <motion.div 
        className="star star-2"
        animate={{ rotate: -360, scale: [1, 1.3, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        style={{ x: mousePosition.x * 0.6 }}
      >
        ✨
      </motion.div>
    </div>
  )
}

// Single floating element component
export const FloatingElement = ({ 
  children, 
  delay = 0, 
  duration = 3,
  amplitude = 15,
  className = '' 
}) => {
  return (
    <motion.div
      className={`floating-single ${className}`}
      animate={{ y: [0, -amplitude, 0] }}
      transition={{ 
        duration, 
        repeat: Infinity, 
        ease: 'easeInOut',
        delay 
      }}
    >
      {children}
    </motion.div>
  )
}

export default FloatingElements
