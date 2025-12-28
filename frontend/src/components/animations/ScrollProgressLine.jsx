/**
 * Rainbow Scroll Progress Line
 * 
 * Bolalar sahifasi uchun kamalakrang progress chiziq
 * 
 * ✅ XUSUSIYATLAR:
 * - 3px ingichka chiziq
 * - Kamalak ranglar (qizil → sariq → yashil → ko'k → binafsha)
 * - Sekin oqib turuvchi gradient (6s loop)
 * - Har 25% da micro feedback
 * - 100% da WOW effect
 * - Click = scroll to top
 * - prefers-reduced-motion support
 * 
 * ❌ TAQIQLANADI:
 * - Qalin bar
 * - Keskin rang almashinuvi
 * - Flash, blink
 * - Emoji, spinner
 */
import { memo, useCallback, useEffect, useState, useRef } from 'react'
import { motion, useSpring } from 'framer-motion'
import PropTypes from 'prop-types'
import './ScrollProgressLine.css'

export const ScrollProgressLine = memo(function ScrollProgressLine({
  height = 3,
  enableClick = true,
  className = ''
}) {
  const [progress, setProgress] = useState(0)
  const [milestone, setMilestone] = useState(0)
  const [isPulsing, setIsPulsing] = useState(false)
  const [hasCompletedOnce, setHasCompletedOnce] = useState(false)
  
  const rafRef = useRef(null)
  const lastMilestoneRef = useRef(0)

  // Scroll progress hisoblash - requestAnimationFrame bilan
  const updateProgress = useCallback(() => {
    const scrollY = window.scrollY || window.pageYOffset
    const documentHeight = document.documentElement.scrollHeight
    const viewportHeight = window.innerHeight
    const scrollableHeight = documentHeight - viewportHeight

    if (scrollableHeight <= 0) {
      setProgress(0)
      return
    }

    const newProgress = Math.min(Math.max(scrollY / scrollableHeight, 0), 1)
    setProgress(newProgress)

    // Milestone detection - har 25% da
    const currentMilestone = Math.floor(newProgress * 4) * 25
    if (currentMilestone > lastMilestoneRef.current && currentMilestone > 0) {
      lastMilestoneRef.current = currentMilestone
      setMilestone(currentMilestone)
      
      // Qisqa pulse trigger
      setIsPulsing(true)
      setTimeout(() => setIsPulsing(false), 400)
    }
    
    // Reset milestone when scrolling back
    if (currentMilestone < lastMilestoneRef.current) {
      lastMilestoneRef.current = currentMilestone
    }
  }, [])

  // Throttled scroll handler
  const handleScroll = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
    rafRef.current = requestAnimationFrame(updateProgress)
  }, [updateProgress])

  useEffect(() => {
    updateProgress()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [handleScroll, updateProgress])

  // Spring animatsiya - yumshoq harakat (cubic-bezier 0.4, 0, 0.2, 1)
  const springProgress = useSpring(progress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001
  })

  // Click handler - smooth scroll to top
  const handleClick = useCallback(() => {
    if (!enableClick) return
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [enableClick])

  // State calculations
  const percentage = Math.round(progress * 100)
  const isNearEnd = progress > 0.9
  const isComplete = progress >= 0.99

  // Track first completion for WOW effect
  useEffect(() => {
    if (isComplete && !hasCompletedOnce) {
      setHasCompletedOnce(true)
    }
    // Reset when scrolling away
    if (progress < 0.9 && hasCompletedOnce) {
      setHasCompletedOnce(false)
      lastMilestoneRef.current = 0
    }
  }, [isComplete, progress, hasCompletedOnce])

  // CSS class names
  const classNames = [
    'rainbow-progress',
    isNearEnd && 'rainbow-progress--near-end',
    isComplete && 'rainbow-progress--complete',
    isPulsing && 'rainbow-progress--pulse',
    milestone === 25 && 'rainbow-progress--milestone-25',
    milestone === 50 && 'rainbow-progress--milestone-50',
    milestone === 75 && 'rainbow-progress--milestone-75',
    className
  ].filter(Boolean).join(' ')

  return (
    <div
      className={classNames}
      style={{ '--rp-height': `${Math.min(Math.max(height, 3), 4)}px` }}
      onClick={handleClick}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Sahifa ${percentage}% o'qildi`}
    >
      {/* Fon track - juda och (opacity 0.1) */}
      <div className="rainbow-progress__track" />

      {/* Kamalakrang progress chiziq */}
      <motion.div
        className="rainbow-progress__bar"
        style={{
          scaleX: springProgress,
          transformOrigin: 'left'
        }}
      />

      {/* Progress oxiridagi glow */}
      <motion.div
        className={`rainbow-progress__glow ${progress > 0.01 ? 'rainbow-progress__glow--visible' : ''}`}
        style={{
          left: `calc(${progress * 100}% - 6px)`
        }}
      />
    </div>
  )
})

ScrollProgressLine.propTypes = {
  height: PropTypes.number,
  enableClick: PropTypes.bool,
  className: PropTypes.string
}

export default ScrollProgressLine
