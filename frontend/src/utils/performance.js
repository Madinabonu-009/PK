/**
 * Performance Monitoring & Optimization Utilities
 * M10: API response caching (already in api.js)
 * Performance metrics tracking
 */

/**
 * Measure component render time
 */
export const measureRender = (componentName, callback) => {
  const start = performance.now()
  const result = callback()
  const end = performance.now()
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`⚡ ${componentName} rendered in ${(end - start).toFixed(2)}ms`)
  }
  
  return result
}

/**
 * Track page load performance
 */
export const trackPageLoad = () => {
  if (typeof window === 'undefined') return

  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0]
    
    if (perfData) {
      const metrics = {
        dns: perfData.domainLookupEnd - perfData.domainLookupStart,
        tcp: perfData.connectEnd - perfData.connectStart,
        request: perfData.responseStart - perfData.requestStart,
        response: perfData.responseEnd - perfData.responseStart,
        dom: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        load: perfData.loadEventEnd - perfData.loadEventStart,
        total: perfData.loadEventEnd - perfData.fetchStart
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.table(metrics)
      }
      
      // Send to analytics
      if (window.gtag) {
        window.gtag('event', 'page_load', {
          event_category: 'performance',
          event_label: window.location.pathname,
          value: Math.round(metrics.total)
        })
      }
      
      return metrics
    }
  })
}

/**
 * Track Web Vitals
 */
export const trackWebVitals = () => {
  if (typeof window === 'undefined') return

  // Largest Contentful Paint (LCP)
  new PerformanceObserver((list) => {
    const entries = list.getEntries()
    const lastEntry = entries[entries.length - 1]
    console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime)
  }).observe({ entryTypes: ['largest-contentful-paint'] })

  // First Input Delay (FID)
  new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      console.log('FID:', entry.processingStart - entry.startTime)
    })
  }).observe({ entryTypes: ['first-input'] })

  // Cumulative Layout Shift (CLS)
  let clsScore = 0
  new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (!entry.hadRecentInput) {
        clsScore += entry.value
        console.log('CLS:', clsScore)
      }
    })
  }).observe({ entryTypes: ['layout-shift'] })
}

/**
 * Debounce function
 */
export const debounce = (func, wait = 300) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Memoize expensive calculations
 */
export const memoize = (fn) => {
  const cache = new Map()
  
  return (...args) => {
    const key = JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = fn(...args)
    cache.set(key, result)
    
    // Limit cache size
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }
    
    return result
  }
}

/**
 * Batch DOM updates
 */
export const batchDOMUpdates = (updates) => {
  requestAnimationFrame(() => {
    updates.forEach(update => update())
  })
}

/**
 * Optimize list rendering
 */
export const optimizeList = (items, visibleCount = 20) => {
  return items.slice(0, visibleCount)
}

/**
 * Virtual scroll helper
 */
export const calculateVisibleRange = (scrollTop, itemHeight, containerHeight, totalItems) => {
  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    totalItems
  )
  
  return { startIndex, endIndex }
}

/**
 * Image preloader
 */
export const preloadImages = (urls) => {
  return Promise.all(
    urls.map(url => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(url)
        img.onerror = reject
        img.src = url
      })
    })
  )
}

/**
 * Check if element is in viewport
 */
export const isInViewport = (element) => {
  if (!element) return false
  
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

/**
 * Lazy load script
 */
export const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

/**
 * Performance budget checker
 */
export const checkPerformanceBudget = (budgets = {
  fcp: 1800, // First Contentful Paint
  lcp: 2500, // Largest Contentful Paint
  fid: 100,  // First Input Delay
  cls: 0.1,  // Cumulative Layout Shift
  ttfb: 600  // Time to First Byte
}) => {
  const perfData = performance.getEntriesByType('navigation')[0]
  const paint = performance.getEntriesByType('paint')
  
  const metrics = {
    fcp: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime,
    ttfb: perfData?.responseStart - perfData?.requestStart
  }
  
  const violations = []
  
  if (metrics.fcp > budgets.fcp) {
    violations.push(`FCP: ${metrics.fcp}ms exceeds budget of ${budgets.fcp}ms`)
  }
  
  if (metrics.ttfb > budgets.ttfb) {
    violations.push(`TTFB: ${metrics.ttfb}ms exceeds budget of ${budgets.ttfb}ms`)
  }
  
  if (violations.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn('⚠️ Performance Budget Violations:', violations)
  }
  
  return { passed: violations.length === 0, violations, metrics }
}

export default {
  measureRender,
  trackPageLoad,
  trackWebVitals,
  debounce,
  throttle,
  memoize,
  batchDOMUpdates,
  optimizeList,
  calculateVisibleRange,
  preloadImages,
  isInViewport,
  loadScript,
  checkPerformanceBudget
}
