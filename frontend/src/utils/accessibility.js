/**
 * Accessibility Utilities
 * WCAG 2.1 compliance helpers
 */

// Focus management
export const focusFirstElement = (container) => {
  const focusable = container?.querySelector(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  focusable?.focus()
}

export const trapFocus = (container) => {
  const focusableElements = container?.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  if (!focusableElements?.length) return

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  const handleKeyDown = (e) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  }

  container?.addEventListener('keydown', handleKeyDown)
  return () => container?.removeEventListener('keydown', handleKeyDown)
}

// Screen reader announcements
export const announce = (message, priority = 'polite') => {
  const announcer = document.createElement('div')
  announcer.setAttribute('role', 'status')
  announcer.setAttribute('aria-live', priority)
  announcer.setAttribute('aria-atomic', 'true')
  announcer.className = 'sr-only'
  announcer.textContent = message
  
  document.body.appendChild(announcer)
  setTimeout(() => announcer.remove(), 1000)
}

// Keyboard navigation helpers
export const handleArrowNavigation = (e, items, currentIndex, onSelect) => {
  let newIndex = currentIndex

  switch (e.key) {
    case 'ArrowDown':
    case 'ArrowRight':
      e.preventDefault()
      newIndex = (currentIndex + 1) % items.length
      break
    case 'ArrowUp':
    case 'ArrowLeft':
      e.preventDefault()
      newIndex = (currentIndex - 1 + items.length) % items.length
      break
    case 'Home':
      e.preventDefault()
      newIndex = 0
      break
    case 'End':
      e.preventDefault()
      newIndex = items.length - 1
      break
    case 'Enter':
    case ' ':
      e.preventDefault()
      onSelect?.(items[currentIndex])
      return currentIndex
    default:
      return currentIndex
  }

  return newIndex
}

// Color contrast checker
export const getContrastRatio = (color1, color2) => {
  const getLuminance = (hex) => {
    const rgb = parseInt(hex.slice(1), 16)
    const r = (rgb >> 16) & 0xff
    const g = (rgb >> 8) & 0xff
    const b = rgb & 0xff
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  const l1 = getLuminance(color1)
  const l2 = getLuminance(color2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

export const meetsWCAGAA = (ratio, isLargeText = false) => {
  return isLargeText ? ratio >= 3 : ratio >= 4.5
}

export const meetsWCAGAAA = (ratio, isLargeText = false) => {
  return isLargeText ? ratio >= 4.5 : ratio >= 7
}

// Skip link helper
export const createSkipLink = (targetId, text = 'Asosiy kontentga o\'tish') => {
  const link = document.createElement('a')
  link.href = `#${targetId}`
  link.className = 'skip-link'
  link.textContent = text
  
  link.addEventListener('click', (e) => {
    e.preventDefault()
    const target = document.getElementById(targetId)
    target?.focus()
    target?.scrollIntoView({ behavior: 'smooth' })
  })
  
  return link
}

// Reduced motion preference
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// High contrast mode detection
export const prefersHighContrast = () => {
  return window.matchMedia('(prefers-contrast: more)').matches
}

export default {
  focusFirstElement,
  trapFocus,
  announce,
  handleArrowNavigation,
  getContrastRatio,
  meetsWCAGAA,
  meetsWCAGAAA,
  createSkipLink,
  prefersReducedMotion,
  prefersHighContrast
}
