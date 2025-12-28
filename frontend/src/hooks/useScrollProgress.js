/**
 * useScrollProgress Hook
 * Sahifa scroll progressini tracking qiluvchi custom hook
 * 
 * Features:
 * - Real-time scroll position tracking
 * - requestAnimationFrame for 60fps performance
 * - Throttled scroll events
 * - State transitions (isNearEnd, isComplete)
 * - Cleanup on unmount
 */
import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Calculate scroll progress
 * @param {number} scrollY - Current scroll position
 * @param {number} documentHeight - Total document height
 * @param {number} viewportHeight - Viewport height
 * @returns {number} Progress value between 0 and 1
 */
export const calculateProgress = (scrollY, documentHeight, viewportHeight) => {
  const scrollableHeight = documentHeight - viewportHeight
  if (scrollableHeight <= 0) return 0
  return Math.min(Math.max(scrollY / scrollableHeight, 0), 1)
}

/**
 * Determine state based on progress
 * @param {number} progress - Progress value (0-1)
 * @returns {{ isNearEnd: boolean, isComplete: boolean }}
 */
export const getProgressState = (progress) => ({
  isNearEnd: progress > 0.9,
  isComplete: progress >= 0.99
})

/**
 * useScrollProgress Hook
 * @param {Object} options - Hook options
 * @param {number} options.throttleMs - Throttle interval in ms (default: 16 for ~60fps)
 * @returns {Object} Scroll progress state
 */
export function useScrollProgress({ throttleMs = 16 } = {}) {
  const [state, setState] = useState({
    progress: 0,
    isNearEnd: false,
    isComplete: false,
    hasCompletedOnce: false
  })

  const rafRef = useRef(null)
  const lastUpdateRef = useRef(0)
  const hasCompletedRef = useRef(false)

  const updateProgress = useCallback(() => {
    const now = Date.now()
    
    // Throttle updates
    if (now - lastUpdateRef.current < throttleMs) {
      rafRef.current = requestAnimationFrame(updateProgress)
      return
    }
    lastUpdateRef.current = now

    // Calculate progress
    const scrollY = window.scrollY || window.pageYOffset
    const documentHeight = document.documentElement.scrollHeight
    const viewportHeight = window.innerHeight

    const progress = calculateProgress(scrollY, documentHeight, viewportHeight)
    const { isNearEnd, isComplete } = getProgressState(progress)

    // Track first completion for pulse animation
    let hasCompletedOnce = hasCompletedRef.current
    if (isComplete && !hasCompletedRef.current) {
      hasCompletedRef.current = true
      hasCompletedOnce = true
    }
    
    // Reset completion tracking when scrolling away from end
    if (!isComplete && hasCompletedRef.current && progress < 0.9) {
      hasCompletedRef.current = false
    }

    setState(prev => {
      // Only update if values changed
      if (
        prev.progress === progress &&
        prev.isNearEnd === isNearEnd &&
        prev.isComplete === isComplete &&
        prev.hasCompletedOnce === hasCompletedOnce
      ) {
        return prev
      }
      return { progress, isNearEnd, isComplete, hasCompletedOnce }
    })
  }, [throttleMs])

  const handleScroll = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
    rafRef.current = requestAnimationFrame(updateProgress)
  }, [updateProgress])

  useEffect(() => {
    // Initial calculation
    updateProgress()

    // Add scroll listener with passive option for performance
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })

    return () => {
      // Cleanup
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [handleScroll, updateProgress])

  return state
}

export default useScrollProgress
