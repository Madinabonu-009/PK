// 🪞 5. MIRROR CURSOR EFFECT - Ko'zga ishonmaysan
import { useEffect, useState, createContext, useContext } from 'react'
import { motion, useSpring } from 'framer-motion'
import './MirrorCursor.css'

const CursorContext = createContext({ x: 0, y: 0 })

export const CursorProvider = ({ children }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <CursorContext.Provider value={mousePosition}>
      {children}
    </CursorContext.Provider>
  )
}

export const useCursor = () => useContext(CursorContext)

// Element that follows cursor with delay
export const MirrorElement = ({ 
  children, 
  delay = 0.2, 
  intensity = 0.1,
  className = '' 
}) => {
  const cursor = useCursor()
  
  const springConfig = { damping: 25, stiffness: 150 }
  const x = useSpring(0, springConfig)
  const y = useSpring(0, springConfig)

  useEffect(() => {
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    
    const offsetX = (cursor.x - centerX) * intensity
    const offsetY = (cursor.y - centerY) * intensity
    
    const timeout = setTimeout(() => {
      x.set(offsetX)
      y.set(offsetY)
    }, delay * 1000)

    return () => clearTimeout(timeout)
  }, [cursor.x, cursor.y, delay, intensity, x, y])

  return (
    <motion.div className={`mirror-element ${className}`} style={{ x, y }}>
      {children}
    </motion.div>
  )
}

// Text shadow that follows cursor
export const MirrorShadow = ({ children, className = '' }) => {
  const cursor = useCursor()
  const [shadow, setShadow] = useState('0 0 0 transparent')

  useEffect(() => {
    const timeout = setTimeout(() => {
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      
      const offsetX = ((cursor.x - centerX) / centerX) * 10
      const offsetY = ((cursor.y - centerY) / centerY) * 10
      
      setShadow(`${offsetX}px ${offsetY}px 20px rgba(102, 126, 234, 0.2)`)
    }, 200)

    return () => clearTimeout(timeout)
  }, [cursor.x, cursor.y])

  return (
    <span 
      className={`mirror-shadow ${className}`}
      style={{ textShadow: shadow, transition: 'text-shadow 0.3s ease' }}
    >
      {children}
    </span>
  )
}

// Floating icons that react to cursor
export const FloatingIcon = ({ icon, baseX, baseY, delay = 0 }) => {
  const cursor = useCursor()
  
  const springConfig = { damping: 30, stiffness: 100 }
  const x = useSpring(baseX, springConfig)
  const y = useSpring(baseY, springConfig)
  const rotate = useSpring(0, springConfig)

  useEffect(() => {
    const timeout = setTimeout(() => {
      const dx = (cursor.x - baseX) * 0.02
      const dy = (cursor.y - baseY) * 0.02
      
      x.set(baseX + dx)
      y.set(baseY + dy)
      rotate.set(dx * 2)
    }, delay * 1000)

    return () => clearTimeout(timeout)
  }, [cursor.x, cursor.y, baseX, baseY, delay, x, y, rotate])

  return (
    <motion.div
      className="floating-icon"
      style={{ 
        position: 'absolute',
        x, 
        y,
        rotate
      }}
    >
      {icon}
    </motion.div>
  )
}
