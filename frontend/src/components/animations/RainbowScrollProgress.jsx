/**
 * 🌈 RAINBOW SCROLL PROGRESS LINE
 * 
 * Bolalar uchun kamalak rangli scroll progress
 * 
 * ✅ XUSUSIYATLAR:
 * - Kamalak gradient (qizil → sariq → yashil → ko'k → binafsha)
 * - Sekin oqib turadigan rainbow flow
 * - Har 25% da micro glow pulse
 * - 100% da WOW effect
 * - Hover va click interaksiya
 * - 60fps, requestAnimationFrame
 * - prefers-reduced-motion qo'llab-quvvatlash
 * 
 * ❌ TAQIQLANADI:
 * - Qalin bar (max 4px)
 * - Keskin rang almashinuvi
 * - Flash, blink
 */

import { useState, useEffect, useCallback, useRef, memo } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import './RainbowScrollProgress.css'

export const RainbowScrollProgress = memo(function RainbowScrollProgress({
  height = 3,
  showMilestones = true,
  onComplete,
  className = ''
}) {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [milestone, setMilestone] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const lastMilestoneRef = useRef(0)
  const rafRef = useRef(null)
  const lastScrollRef = useRef(0)

  // Smooth spring animation
  const springProgress = useSpring(0, {
    stiffness: 100,
    damping: 30,
    mass: 0.5
  })

  // Transform for scaleX
  const scaleX = useTransform(springProgress, [0, 100], [0, 1])

  // Throttled scroll handler with RAF
  const handleScroll = useCallback(() => {
    if (rafRef.current) return

    rafRef.current = requestAnimationFrame(() => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      
      // Only update if changed significantly
      if (Math.abs(progress - lastScrollRef.current) > 0.5) {
        lastScrollRef.current = progress
        setScrollProgress(progress)
        springProgress.set(progress)

        // Milestone detection (25%, 50%, 75%, 100%)
        const currentMilestone = Math.floor(progress / 25) * 25
        if (currentMilestone > lastMilestoneRef.current && currentMilestone <= 100) {
          lastMilestoneRef.current = currentMilestone
          setMilestone(currentMilestone)
          
          // Reset milestone after animation
          setTimeout(() => setMilestone(0), 600)
        }

        // Complete detection
        if (progress >= 99 && !isComplete) {
          setIsComplete(true)
          onComplete?.()
        } else if (progress < 95) {
          setIsComplete(false)
        }
      }

      rafRef.current = null
    })
  }, [springProgress, isComplete, onComplete])

  // Scroll to top on click
  const handleClick = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial call
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [handleScroll])

  return (
    <div 
      className={`rainbow-progress ${isComplete ? 'rainbow-progress--complete' : ''} ${className}`}
      style={{ '--progress-height': `${height}px` }}
      onClick={handleClick}
      role="progressbar"
      aria-valuenow={Math.round(scrollProgress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Sahifa scroll progress"
    >
      {/* Background track */}
      <div className="rainbow-progress__track" />
      
      {/* Rainbow fill */}
      <motion.div 
        className="rainbow-progress__fill"
        style={{ scaleX, transformOrigin: 'left' }}
      />
      
      {/* Glow effect */}
      <motion.div 
        className="rainbow-progress__glow"
        style={{ scaleX, transformOrigin: 'left' }}
        animate={isComplete ? {
          opacity: [0.6, 1, 0.6],
          filter: ['blur(4px)', 'blur(8px)', 'blur(4px)']
        } : {}}
        transition={{ duration: 1.5, repeat: isComplete ? Infinity : 0 }}
      />

      {/* Milestone pulse */}
      {showMilestones && milestone > 0 && (
        <motion.div
          className="rainbow-progress__milestone"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 1] }}
          transition={{ duration: 0.6 }}
          style={{ left: `${milestone}%` }}
        />
      )}

      {/* Complete celebration */}
      {isComplete && (
        <motion.div
          className="rainbow-progress__complete"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </div>
  )
})

export default RainbowScrollProgress
