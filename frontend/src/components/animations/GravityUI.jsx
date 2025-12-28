/**
 * 🧲 GRAVITY UI COMPONENT
 * 
 * UI elementlar sichqonchani sezayotgandek harakat qilsin
 * 
 * ✅ XUSUSIYATLAR:
 * - Mouse yaqinlashganda element 4-8px siljiydi
 * - Masofa oshgani sari ta'sir kamayadi
 * - Harakat juda sekin va yumshoq
 * - Fizika illyuziyasi
 * 
 * ❌ TAQIQLANADI:
 * - Sakrash
 * - Tez reaktsiya
 * - O'yin kabi harakat
 */

import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { motion, useSpring } from 'framer-motion'
import './GravityUI.css'

export const GravityUI = memo(function GravityUI({
  children,
  strength = 6,
  radius = 200,
  disabled = false,
  className = '',
  ...props
}) {
  const elementRef = useRef(null)
  const [isInRange, setIsInRange] = useState(false)

  // Smooth spring animations
  const x = useSpring(0, { stiffness: 50, damping: 20, mass: 1 })
  const y = useSpring(0, { stiffness: 50, damping: 20, mass: 1 })

  const handleMouseMove = useCallback((e) => {
    if (disabled || !elementRef.current) return

    const rect = elementRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const mouseX = e.clientX
    const mouseY = e.clientY

    const distance = Math.sqrt(
      Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2)
    )

    if (distance < radius) {
      setIsInRange(true)
      
      // Calculate attraction (closer = stronger)
      const force = (1 - distance / radius) * strength
      const angle = Math.atan2(mouseY - centerY, mouseX - centerX)
      
      const offsetX = Math.cos(angle) * force
      const offsetY = Math.sin(angle) * force

      x.set(offsetX)
      y.set(offsetY)
    } else {
      if (isInRange) {
        setIsInRange(false)
        x.set(0)
        y.set(0)
      }
    }
  }, [disabled, radius, strength, x, y, isInRange])

  const handleMouseLeave = useCallback(() => {
    x.set(0)
    y.set(0)
    setIsInRange(false)
  }, [x, y])

  useEffect(() => {
    if (disabled) return

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [handleMouseMove, disabled])

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion || disabled) {
    return (
      <div className={`gravity-ui ${className}`} {...props}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      ref={elementRef}
      className={`gravity-ui ${isInRange ? 'gravity-ui--active' : ''} ${className}`}
      style={{ x, y }}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════
// 🧲 GRAVITY CONTAINER - Bir nechta elementlar uchun
// ═══════════════════════════════════════════════════════════════
export const GravityContainer = memo(function GravityContainer({
  children,
  strength = 6,
  radius = 200,
  disabled = false,
  className = ''
}) {
  const containerRef = useRef(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleMouseMove = useCallback((e) => {
    if (disabled) return
    
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }, [disabled])

  return (
    <div
      ref={containerRef}
      className={`gravity-container ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos({ x: -1000, y: -1000 })}
    >
      {typeof children === 'function' 
        ? children({ mousePos, strength, radius })
        : children
      }
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════
// 🧲 GRAVITY ITEM - Container ichidagi element
// ═══════════════════════════════════════════════════════════════
export const GravityItem = memo(function GravityItem({
  children,
  mousePos,
  strength = 6,
  radius = 200,
  className = ''
}) {
  const itemRef = useRef(null)
  
  const x = useSpring(0, { stiffness: 50, damping: 20, mass: 1 })
  const y = useSpring(0, { stiffness: 50, damping: 20, mass: 1 })

  useEffect(() => {
    if (!itemRef.current || mousePos.x < 0) {
      x.set(0)
      y.set(0)
      return
    }

    const rect = itemRef.current.getBoundingClientRect()
    const parent = itemRef.current.parentElement?.getBoundingClientRect()
    
    if (!parent) return

    const centerX = rect.left - parent.left + rect.width / 2
    const centerY = rect.top - parent.top + rect.height / 2

    const distance = Math.sqrt(
      Math.pow(mousePos.x - centerX, 2) + Math.pow(mousePos.y - centerY, 2)
    )

    if (distance < radius) {
      const force = (1 - distance / radius) * strength
      const angle = Math.atan2(mousePos.y - centerY, mousePos.x - centerX)
      
      x.set(Math.cos(angle) * force)
      y.set(Math.sin(angle) * force)
    } else {
      x.set(0)
      y.set(0)
    }
  }, [mousePos, strength, radius, x, y])

  return (
    <motion.div
      ref={itemRef}
      className={`gravity-item ${className}`}
      style={{ x, y }}
    >
      {children}
    </motion.div>
  )
})

export default GravityUI
