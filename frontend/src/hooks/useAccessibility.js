import { useState, useEffect, useRef, useCallback } from 'react'
import { generateAriaId, trapFocus, FocusManager, announceToScreenReader } from '../utils/accessibility'

/**
 * Accessibility Hooks
 * M12-M19: Focus management, keyboard navigation, screen reader support
 */

/**
 * useAriaLabel - Generate and manage aria labels
 */
export const useAriaLabel = (baseLabel, dynamicPart = '') => {
  const id = useRef(generateAriaId('label')).current
  const label = dynamicPart ? `${baseLabel} ${dynamicPart}` : baseLabel
  
  return {
    'aria-labelledby': id,
    labelId: id,
    label
  }
}

/**
 * useFocusTrap - Trap focus within element (for modals)
 */
export const useFocusTrap = (isActive = false) => {
  const elementRef = useRef(null)
  
  useEffect(() => {
    if (!isActive || !elementRef.current) return
    
    const cleanup = trapFocus(elementRef.current)
    return cleanup
  }, [isActive])
  
  return elementRef
}

/**
 * useFocusReturn - Save and restore focus
 */
export const useFocusReturn = () => {
  const focusManager = useRef(new FocusManager()).current
  
  const saveFocus = useCallback(() => {
    focusManager.saveFocus()
  }, [focusManager])
  
  const restoreFocus = useCallback(() => {
    focusManager.restoreFocus()
  }, [focusManager])
  
  return { saveFocus, restoreFocus }
}

/**
 * useKeyboardNavigation - Arrow key navigation for lists/menus
 */
export const useKeyboardNavigation = (items = [], options = {}) => {
  const {
    loop = true,
    onSelect,
    orientation = 'vertical' // 'vertical' | 'horizontal'
  } = options
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isNavigating, setIsNavigating] = useState(false)
  
  const handleKeyDown = useCallback((e) => {
    const { key } = e
    
    const upKeys = orientation === 'vertical' ? ['ArrowUp'] : ['ArrowLeft']
    const downKeys = orientation === 'vertical' ? ['ArrowDown'] : ['ArrowRight']
    
    if ([...upKeys, ...downKeys, 'Home', 'End', 'Enter', ' '].includes(key)) {
      e.preventDefault()
      setIsNavigating(true)
      
      if (upKeys.includes(key)) {
        setCurrentIndex(prev => {
          if (prev === 0) return loop ? items.length - 1 : 0
          return prev - 1
        })
      } else if (downKeys.includes(key)) {
        setCurrentIndex(prev => {
          if (prev === items.length - 1) return loop ? 0 : prev
          return prev + 1
        })
      } else if (key === 'Home') {
        setCurrentIndex(0)
      } else if (key === 'End') {
        setCurrentIndex(items.length - 1)
      } else if (key === 'Enter' || key === ' ') {
        if (onSelect && items[currentIndex]) {
          onSelect(items[currentIndex], currentIndex)
        }
      }
    }
  }, [items, currentIndex, loop, onSelect, orientation])
  
  return {
    currentIndex,
    setCurrentIndex,
    handleKeyDown,
    isNavigating,
    getItemProps: (index) => ({
      role: 'option',
      'aria-selected': index === currentIndex,
      tabIndex: index === currentIndex ? 0 : -1
    })
  }
}

/**
 * useAnnouncer - Announce messages to screen readers
 */
export const useAnnouncer = () => {
  const announce = useCallback((message, priority = 'polite') => {
    announceToScreenReader(message, priority)
  }, [])
  
  return announce
}

/**
 * useAriaExpanded - Manage aria-expanded state
 */
export const useAriaExpanded = (initialState = false) => {
  const [isExpanded, setIsExpanded] = useState(initialState)
  const id = useRef(generateAriaId('expandable')).current
  const contentId = useRef(generateAriaId('content')).current
  
  const toggle = useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [])
  
  return {
    triggerProps: {
      'aria-expanded': isExpanded,
      'aria-controls': contentId,
      id
    },
    contentProps: {
      id: contentId,
      'aria-labelledby': id,
      hidden: !isExpanded
    },
    isExpanded,
    setIsExpanded,
    toggle
  }
}

/**
 * useAriaLive - Live region for dynamic content
 */
export const useAriaLive = (polite = true) => {
  const [message, setMessage] = useState('')
  
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 1000)
      return () => clearTimeout(timer)
    }
  }, [message])
  
  const announce = useCallback((msg) => {
    setMessage(msg)
  }, [])
  
  const liveRegionProps = {
    role: 'status',
    'aria-live': polite ? 'polite' : 'assertive',
    'aria-atomic': 'true',
    className: 'sr-only'
  }
  
  return { announce, liveRegionProps, message }
}

/**
 * useDescribedBy - Manage aria-describedby
 */
export const useDescribedBy = (description, error) => {
  const descId = useRef(generateAriaId('desc')).current
  const errorId = useRef(generateAriaId('error')).current
  
  const describedBy = []
  if (description) describedBy.push(descId)
  if (error) describedBy.push(errorId)
  
  return {
    'aria-describedby': describedBy.length > 0 ? describedBy.join(' ') : undefined,
    descId,
    errorId,
    descriptionProps: description ? { id: descId } : {},
    errorProps: error ? { id: errorId, role: 'alert', 'aria-live': 'polite' } : {}
  }
}

/**
 * useSkipLink - Add skip to main content link
 */
export const useSkipLink = () => {
  useEffect(() => {
    const skipLink = document.createElement('a')
    skipLink.href = '#main-content'
    skipLink.textContent = 'Asosiy kontentga o\'tish'
    skipLink.className = 'skip-link'
    skipLink.style.cssText = `
      position: absolute;
      left: -9999px;
      z-index: 9999;
      padding: 1em;
      background-color: #000;
      color: #fff;
      text-decoration: none;
      font-weight: bold;
    `
    
    const handleFocus = () => {
      skipLink.style.left = '10px'
      skipLink.style.top = '10px'
    }
    
    const handleBlur = () => {
      skipLink.style.left = '-9999px'
    }
    
    skipLink.addEventListener('focus', handleFocus)
    skipLink.addEventListener('blur', handleBlur)
    
    document.body.insertBefore(skipLink, document.body.firstChild)
    
    return () => {
      skipLink.removeEventListener('focus', handleFocus)
      skipLink.removeEventListener('blur', handleBlur)
      document.body.removeChild(skipLink)
    }
  }, [])
}

/**
 * useReducedMotion - Detect prefers-reduced-motion
 */
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
  
  return prefersReducedMotion
}

export default {
  useAriaLabel,
  useFocusTrap,
  useFocusReturn,
  useKeyboardNavigation,
  useAnnouncer,
  useAriaExpanded,
  useAriaLive,
  useDescribedBy,
  useSkipLink,
  useReducedMotion
}
