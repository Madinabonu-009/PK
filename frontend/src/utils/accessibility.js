/**
 * Accessibility Utilities
 * M12-M19: aria-labels, keyboard navigation, screen reader support, etc.
 */

/**
 * Generate unique ID for aria attributes
 */
export const generateAriaId = (prefix = 'aria') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Screen reader only text
 */
export const srOnly = (text) => ({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  borderWidth: '0',
  'aria-label': text
})

/**
 * Announce to screen readers
 */
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority) // 'polite' or 'assertive'
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Trap focus within modal/dialog
 */
export const trapFocus = (element) => {
  const focusableElements = element.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )
  
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
  
  element.addEventListener('keydown', handleKeyDown)
  
  // Focus first element
  firstElement?.focus()
  
  return () => {
    element.removeEventListener('keydown', handleKeyDown)
  }
}

/**
 * Restore focus after modal close
 */
export class FocusManager {
  constructor() {
    this.previousFocus = null
  }
  
  saveFocus() {
    this.previousFocus = document.activeElement
  }
  
  restoreFocus() {
    if (this.previousFocus && this.previousFocus.focus) {
      this.previousFocus.focus()
    }
  }
}

/**
 * Check color contrast ratio
 */
export const getContrastRatio = (color1, color2) => {
  const getLuminance = (color) => {
    const rgb = color.match(/\d+/g).map(Number)
    const [r, g, b] = rgb.map(val => {
      const v = val / 255
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  
  const l1 = getLuminance(color1)
  const l2 = getLuminance(color2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Validate WCAG color contrast
 */
export const validateContrast = (foreground, background, level = 'AA', size = 'normal') => {
  const ratio = getContrastRatio(foreground, background)
  
  const thresholds = {
    'AA': { normal: 4.5, large: 3 },
    'AAA': { normal: 7, large: 4.5 }
  }
  
  const threshold = thresholds[level][size]
  return {
    ratio: ratio.toFixed(2),
    passes: ratio >= threshold,
    level,
    threshold
  }
}

/**
 * Keyboard navigation helper
 */
export const handleArrowKeyNavigation = (e, items, currentIndex, onSelect) => {
  const { key } = e
  
  if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', 'Space'].includes(key)) {
    return currentIndex
  }
  
  e.preventDefault()
  
  let newIndex = currentIndex
  
  switch (key) {
    case 'ArrowUp':
    case 'ArrowLeft':
      newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
      break
    case 'ArrowDown':
    case 'ArrowRight':
      newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
      break
    case 'Home':
      newIndex = 0
      break
    case 'End':
      newIndex = items.length - 1
      break
    case 'Enter':
    case 'Space':
      if (onSelect) onSelect(items[currentIndex])
      return currentIndex
  }
  
  return newIndex
}

/**
 * Skip to main content link
 */
export const createSkipLink = () => {
  const skipLink = document.createElement('a')
  skipLink.href = '#main-content'
  skipLink.textContent = 'Skip to main content'
  skipLink.className = 'skip-link'
  skipLink.style.cssText = `
    position: absolute;
    left: -9999px;
    z-index: 999;
    padding: 1em;
    background-color: #000;
    color: #fff;
    text-decoration: none;
  `
  
  skipLink.addEventListener('focus', () => {
    skipLink.style.left = '0'
  })
  
  skipLink.addEventListener('blur', () => {
    skipLink.style.left = '-9999px'
  })
  
  return skipLink
}

/**
 * Add live region for dynamic content
 */
export const createLiveRegion = (polite = true) => {
  const region = document.createElement('div')
  region.setAttribute('role', 'status')
  region.setAttribute('aria-live', polite ? 'polite' : 'assertive')
  region.setAttribute('aria-atomic', 'true')
  region.className = 'sr-only'
  document.body.appendChild(region)
  
  return {
    announce: (message) => {
      region.textContent = message
    },
    remove: () => {
      document.body.removeChild(region)
    }
  }
}

/**
 * Form field accessibility helpers
 */
export const getFormFieldProps = (id, label, error, required = false, description = '') => {
  const labelId = `${id}-label`
  const errorId = error ? `${id}-error` : undefined
  const descId = description ? `${id}-desc` : undefined
  
  const ariaDescribedBy = [descId, errorId].filter(Boolean).join(' ')
  
  return {
    input: {
      id,
      'aria-labelledby': labelId,
      'aria-describedby': ariaDescribedBy || undefined,
      'aria-invalid': !!error,
      'aria-required': required,
      required
    },
    label: {
      id: labelId,
      htmlFor: id
    },
    error: error ? {
      id: errorId,
      role: 'alert',
      'aria-live': 'polite'
    } : {},
    description: description ? {
      id: descId
    } : {}
  }
}

/**
 * Check if element is focusable
 */
export const isFocusable = (element) => {
  if (!element || element.disabled) return false
  
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ]
  
  return focusableSelectors.some(selector => element.matches(selector))
}

/**
 * Get all focusable elements
 */
export const getFocusableElements = (container = document) => {
  return Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  )
}

/**
 * Roving tabindex for component groups
 */
export class RovingTabIndex {
  constructor(container, items) {
    this.container = container
    this.items = items
    this.currentIndex = 0
    
    this.updateTabIndices()
  }
  
  updateTabIndices() {
    this.items.forEach((item, index) => {
      item.setAttribute('tabindex', index === this.currentIndex ? '0' : '-1')
    })
  }
  
  setFocus(index) {
    if (index >= 0 && index < this.items.length) {
      this.currentIndex = index
      this.updateTabIndices()
      this.items[index].focus()
    }
  }
  
  next() {
    this.setFocus((this.currentIndex + 1) % this.items.length)
  }
  
  previous() {
    this.setFocus((this.currentIndex - 1 + this.items.length) % this.items.length)
  }
  
  first() {
    this.setFocus(0)
  }
  
  last() {
    this.setFocus(this.items.length - 1)
  }
}

export default {
  generateAriaId,
  srOnly,
  announceToScreenReader,
  trapFocus,
  FocusManager,
  getContrastRatio,
  validateContrast,
  handleArrowKeyNavigation,
  createSkipLink,
  createLiveRegion,
  getFormFieldProps,
  isFocusable,
  getFocusableElements,
  RovingTabIndex
}
