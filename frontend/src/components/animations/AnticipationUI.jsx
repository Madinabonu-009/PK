/**
 * 🧠 ANTICIPATION UI COMPONENT
 * 
 * UI foydalanuvchini oldindan sezsin
 * 
 * ✅ XUSUSIYATLAR:
 * - Scroll yo'nalishini aniqlash
 * - Mouse tezligini kuzatish
 * - Keyingi element yengil siljish
 * - Opacity 0.95 → 1 transition
 * 
 * ❌ TAQIQLANADI:
 * - Keskin signal
 * - Bezovta qiluvchi harakat
 */

import { useState, useEffect, useRef, useCallback, createContext, useContext, memo } from 'react'
import { motion, useSpring } from 'framer-motion'
import './AnticipationUI.css'

// Context for sharing anticipation state
const AnticipationContext = createContext({
  scrollDirection: 'none',
  scrollSpeed: 0,
  mouseVelocity: { x: 0, y: 0 },
  isApproaching: false
})

// ═══════════════════════════════════════════════════════════════
// 🧠 ANTICIPATION PROVIDER - Global state
// ═══════════════════════════════════════════════════════════════
export const AnticipationProvider = memo(function AnticipationProvider({ children }) {
  const [scrollDirection, setScrollDirection] = useState('none')
  const [scrollSpeed, setScrollSpeed] = useState(0)
  const [mouseVelocity, setMouseVelocity] = useState({ x: 0, y: 0 })
  
  const lastScrollY = useRef(0)
  const lastMousePos = useRef({ x: 0, y: 0 })
  const lastTime = useRef(Date.now())
  const rafRef = useRef(null)

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) return
      
      rafRef.current = requestAnimationFrame(() => {
        const currentY = window.scrollY
        const currentTime = Date.now()
        const timeDelta = currentTime - lastTime.current
        
        if (timeDelta > 0) {
          const delta = currentY - lastScrollY.current
          const speed = Math.abs(delta) / timeDelta * 100
          
          setScrollDirection(delta > 0 ? 'down' : delta < 0 ? 'up' : 'none')
          setScrollSpeed(Math.min(speed, 100))
        }
        
        lastScrollY.current = currentY
        lastTime.current = currentTime
        rafRef.current = null
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Mouse velocity tracking
  useEffect(() => {
    let mouseRaf = null
    
    const handleMouseMove = (e) => {
      if (mouseRaf) return
      
      mouseRaf = requestAnimationFrame(() => {
        const currentTime = Date.now()
        const timeDelta = currentTime - lastTime.current
        
        if (timeDelta > 0) {
          const vx = (e.clientX - lastMousePos.current.x) / timeDelta * 10
          const vy = (e.clientY - lastMousePos.current.y) / timeDelta * 10
          
          setMouseVelocity({
            x: Math.max(-10, Math.min(10, vx)),
            y: Math.max(-10, Math.min(10, vy))
          })
        }
        
        lastMousePos.current = { x: e.clientX, y: e.clientY }
        lastTime.current = currentTime
        mouseRaf = null
      })
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (mouseRaf) cancelAnimationFrame(mouseRaf)
    }
  }, [])

  return (
    <AnticipationContext.Provider value={{ scrollDirection, scrollSpeed, mouseVelocity }}>
      {children}
    </AnticipationContext.Provider>
  )
})

// Hook to use anticipation context
export const useAnticipation = () => useContext(AnticipationContext)

// ═══════════════════════════════════════════════════════════════
// 🧠 ANTICIPATION ELEMENT - Oldindan sezuvchi element
// ═══════════════════════════════════════════════════════════════
export const AnticipationElement = memo(function AnticipationElement({
  children,
  direction = 'vertical',
  strength = 4,
  className = ''
}) {
  const { scrollDirection, scrollSpeed, mouseVelocity } = useAnticipation()
  const elementRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  
  const y = useSpring(0, { stiffness: 100, damping: 30 })
  const x = useSpring(0, { stiffness: 100, damping: 30 })
  const opacity = useSpring(1, { stiffness: 200, damping: 30 })

  // Intersection observer for visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1, rootMargin: '50px' }
    )
    
    if (elementRef.current) {
      observer.observe(elementRef.current)
    }
    
    return () => observer.disconnect()
  }, [])

  // Apply anticipation based on scroll/mouse
  useEffect(() => {
    if (!isVisible) return

    if (direction === 'vertical' || direction === 'both') {
      const scrollOffset = scrollDirection === 'down' ? -strength : 
                          scrollDirection === 'up' ? strength : 0
      y.set(scrollOffset * (scrollSpeed / 50))
    }

    if (direction === 'horizontal' || direction === 'both') {
      x.set(mouseVelocity.x * (strength / 5))
    }

    // Subtle opacity change
    const opacityValue = 0.95 + (scrollSpeed / 500)
    opacity.set(Math.min(opacityValue, 1))
  }, [scrollDirection, scrollSpeed, mouseVelocity, direction, strength, isVisible, x, y, opacity])

  return (
    <motion.div
      ref={elementRef}
      className={`anticipation-element ${className}`}
      style={{ x, y, opacity }}
    >
      {children}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════
// 🧠 ANTICIPATION LIST - Ro'yxat elementlari uchun
// ═══════════════════════════════════════════════════════════════
export const AnticipationList = memo(function AnticipationList({
  children,
  staggerDelay = 0.05,
  className = ''
}) {
  const { scrollDirection, scrollSpeed } = useAnticipation()
  const listRef = useRef(null)
  const [visibleItems, setVisibleItems] = useState(new Set())

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const index = parseInt(entry.target.dataset.index)
          setVisibleItems(prev => {
            const next = new Set(prev)
            if (entry.isIntersecting) {
              next.add(index)
            }
            return next
          })
        })
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    const items = listRef.current?.querySelectorAll('[data-index]')
    items?.forEach(item => observer.observe(item))

    return () => observer.disconnect()
  }, [children])

  return (
    <div ref={listRef} className={`anticipation-list ${className}`}>
      {Array.isArray(children) ? children.map((child, index) => (
        <motion.div
          key={index}
          data-index={index}
          initial={{ opacity: 0.9, y: 10 }}
          animate={visibleItems.has(index) ? {
            opacity: 1,
            y: scrollDirection === 'down' ? -2 : scrollDirection === 'up' ? 2 : 0
          } : {}}
          transition={{
            duration: 0.4,
            delay: index * staggerDelay,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          {child}
        </motion.div>
      )) : children}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════
// 🧠 ANTICIPATION BUTTON - Oldindan sezuvchi tugma
// ═══════════════════════════════════════════════════════════════
export const AnticipationButton = memo(function AnticipationButton({
  children,
  onClick,
  className = '',
  ...props
}) {
  const { mouseVelocity } = useAnticipation()
  const buttonRef = useRef(null)
  const [isApproaching, setIsApproaching] = useState(false)
  
  const scale = useSpring(1, { stiffness: 300, damping: 20 })
  const glow = useSpring(0, { stiffness: 200, damping: 30 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!buttonRef.current) return
      
      const rect = buttonRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      const distance = Math.sqrt(
        Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
      )
      
      // Check if mouse is approaching (within 150px and moving towards)
      const isMovingTowards = 
        (e.clientX < centerX && mouseVelocity.x > 0) ||
        (e.clientX > centerX && mouseVelocity.x < 0) ||
        (e.clientY < centerY && mouseVelocity.y > 0) ||
        (e.clientY > centerY && mouseVelocity.y < 0)
      
      const approaching = distance < 150 && isMovingTowards
      setIsApproaching(approaching)
      
      if (approaching) {
        const intensity = 1 - (distance / 150)
        scale.set(1 + intensity * 0.03)
        glow.set(intensity * 0.5)
      } else {
        scale.set(1)
        glow.set(0)
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseVelocity, scale, glow])

  return (
    <motion.button
      ref={buttonRef}
      className={`anticipation-button ${isApproaching ? 'anticipation-button--approaching' : ''} ${className}`}
      style={{ scale }}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
      <motion.span 
        className="anticipation-button__glow"
        style={{ opacity: glow }}
      />
    </motion.button>
  )
})

export default AnticipationProvider
