/**
 * 🌌 PAGE BREATHING COMPONENT
 * 
 * Sahifa tirikdek "nafas olayotgandek" sezilishi
 * 
 * ✅ XUSUSIYATLAR:
 * - Background va container juda sekin scale: 1 → 1.01 → 1
 * - 12–15 sekund loop
 * - Ease: ease-in-out
 * - Harakat deyarli sezilmaydi
 * - Scroll yoki clickga bog'liq EMAS
 * 
 * ❌ TAQIQLANADI:
 * - Tez animatsiya
 * - Ko'zga tashlanadigan zoom
 * 
 * NATIJA: Foydalanuvchi animatsiyani ko'rmaydi, LEKIN sezadi.
 */

import { useEffect, useState, memo } from 'react'
import './PageBreathing.css'

export const PageBreathing = memo(function PageBreathing({
  children,
  intensity = 'gentle',
  enabled = true,
  className = ''
}) {
  const [isActive, setIsActive] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Delay activation for smooth start
  useEffect(() => {
    if (enabled && !prefersReducedMotion) {
      const timer = setTimeout(() => setIsActive(true), 500)
      return () => clearTimeout(timer)
    } else {
      setIsActive(false)
    }
  }, [enabled, prefersReducedMotion])

  const intensityClass = `breathing-${intensity}`
  const activeClass = isActive ? 'breathing-active' : ''

  return (
    <div className={`page-breathing ${intensityClass} ${activeClass} ${className}`}>
      <div className="breathing-background" aria-hidden="true" />
      <div className="breathing-content">
        {children}
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════
// 🌌 BREATHING WRAPPER - Faqat content uchun
// ═══════════════════════════════════════════════════════════════
export const BreathingWrapper = memo(function BreathingWrapper({
  children,
  intensity = 'subtle',
  className = ''
}) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = (e) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  const animationStyle = {
    animation: intensity === 'subtle' 
      ? 'breathe-content-subtle 15s ease-in-out infinite'
      : intensity === 'gentle'
      ? 'breathe-content-gentle 13s ease-in-out infinite'
      : intensity === 'normal'
      ? 'breathe-content-normal 12s ease-in-out infinite'
      : 'breathe-content-kids 14s ease-in-out infinite'
  }

  return (
    <div className={className} style={animationStyle}>
      {children}
    </div>
  )
})

export default PageBreathing
