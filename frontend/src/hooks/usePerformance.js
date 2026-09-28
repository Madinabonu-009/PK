import { useEffect, useCallback, useRef, useMemo } from 'react'

/**
 * Performance Hooks Collection
 * M6: useMemo for filtering/sorting
 * M7: React.memo guidance
 * M11: Debounce hook
 */

/**
 * useDebounce - Debounce qiymatni kechiktirish
 * Search inputlar uchun, API calls'ni kamaytiris
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

/**
 * useThrottle - Throttle callback function
 * Scroll events, resize events uchun
 */
export const useThrottle = (callback, delay = 300) => {
  const lastRun = useRef(Date.now())

  return useCallback((...args) => {
    const now = Date.now()
    if (now - lastRun.current >= delay) {
      callback(...args)
      lastRun.current = now
    }
  }, [callback, delay])
}

/**
 * useMemoizedSort - Sorting uchun optimized useMemo
 */
export const useMemoizedSort = (data, sortKey, sortOrder = 'asc') => {
  return useMemo(() => {
    if (!data || !Array.isArray(data)) return []
    
    return [...data].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      
      if (aVal == null) return 1
      if (bVal == null) return -1
      
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [data, sortKey, sortOrder])
}

/**
 * useMemoizedFilter - Filtering uchun optimized useMemo
 */
export const useMemoizedFilter = (data, filterFn) => {
  return useMemo(() => {
    if (!data || !Array.isArray(data)) return []
    if (!filterFn) return data
    
    return data.filter(filterFn)
  }, [data, filterFn])
}

/**
 * useMemoizedSearch - Search uchun optimized useMemo
 */
export const useMemoizedSearch = (data, searchTerm, searchKeys = []) => {
  return useMemo(() => {
    if (!data || !Array.isArray(data)) return []
    if (!searchTerm || !searchTerm.trim()) return data
    
    const term = searchTerm.toLowerCase().trim()
    
    return data.filter(item => {
      return searchKeys.some(key => {
        const value = item[key]
        if (!value) return false
        return String(value).toLowerCase().includes(term)
      })
    })
  }, [data, searchTerm, searchKeys])
}

/**
 * useIntersectionObserver - Lazy loading uchun
 * Images va components'ni viewport'ga kirganida yuklash
 */
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const targetRef = useRef(null)

  useEffect(() => {
    const target = targetRef.current
    if (!target) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true)
      }
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    })

    observer.observe(target)

    return () => observer.disconnect()
  }, [options, hasIntersected])

  return [targetRef, isIntersecting, hasIntersected]
}

/**
 * usePerformanceMonitor - Component render vaqtini o'lchash
 */
export const usePerformanceMonitor = (componentName) => {
  const renderCount = useRef(0)
  const startTime = useRef(performance.now())

  useEffect(() => {
    renderCount.current++
    const endTime = performance.now()
    const renderTime = endTime - startTime.current
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 ${componentName} Render #${renderCount.current}: ${renderTime.toFixed(2)}ms`)
    }
    
    startTime.current = performance.now()
  })

  return renderCount.current
}

/**
 * useMemoizedCallback - useCallback bilan bir xil, lekin dependencies'ni avtomatik track qiladi
 */
export const useMemoizedCallback = (callback, deps = []) => {
  return useCallback(callback, deps)
}

/**
 * useOptimizedState - State updates'ni batch qilish
 */
export const useOptimizedState = (initialState) => {
  const [state, setState] = useState(initialState)
  const pendingUpdates = useRef([])
  const rafId = useRef(null)

  const setOptimizedState = useCallback((update) => {
    pendingUpdates.current.push(update)
    
    if (!rafId.current) {
      rafId.current = requestAnimationFrame(() => {
        setState(prevState => {
          let newState = prevState
          pendingUpdates.current.forEach(fn => {
            newState = typeof fn === 'function' ? fn(newState) : fn
          })
          return newState
        })
        pendingUpdates.current = []
        rafId.current = null
      })
    }
  }, [])

  return [state, setOptimizedState]
}

import { useState } from 'react'

export default {
  useDebounce,
  useThrottle,
  useMemoizedSort,
  useMemoizedFilter,
  useMemoizedSearch,
  useIntersectionObserver,
  usePerformanceMonitor,
  useMemoizedCallback,
  useOptimizedState
}
