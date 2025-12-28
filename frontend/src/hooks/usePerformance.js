/**
 * Performance Monitoring Hook
 * Tracks component render times and performance metrics
 */

import { useEffect, useRef, useCallback } from 'react'

/**
 * Measure component render time
 */
export const useRenderTime = (componentName) => {
  const renderCount = useRef(0)
  const startTime = useRef(performance.now())

  useEffect(() => {
    renderCount.current++
    const endTime = performance.now()
    const renderTime = endTime - startTime.current

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName} render #${renderCount.current}: ${renderTime.toFixed(2)}ms`)
    }

    startTime.current = performance.now()
  })
}

/**
 * Track page load performance
 */
export const usePageLoadTime = (pageName) => {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const measurePageLoad = () => {
      const perfData = performance.getEntriesByType('navigation')[0]
      
      if (perfData) {
        const metrics = {
          page: pageName,
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

        // Send to analytics in production
        if (process.env.NODE_ENV === 'production') {
          sendPerformanceMetrics(metrics)
        }
      }
    }

    // Wait for page to fully load
    if (document.readyState === 'complete') {
      measurePageLoad()
    } else {
      window.addEventListener('load', measurePageLoad)
      return () => window.removeEventListener('load', measurePageLoad)
    }
  }, [pageName])
}

/**
 * Track API call performance
 */
export const useApiPerformance = () => {
  const trackApiCall = useCallback((endpoint, startTime, endTime, success) => {
    const duration = endTime - startTime

    const metric = {
      endpoint,
      duration,
      success,
      timestamp: new Date().toISOString()
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Performance] ${endpoint}: ${duration.toFixed(2)}ms ${success ? '✓' : '✗'}`)
    }

    // Send to analytics
    if (process.env.NODE_ENV === 'production') {
      sendPerformanceMetrics({ type: 'api', ...metric })
    }

    return metric
  }, [])

  return { trackApiCall }
}

/**
 * Monitor memory usage
 */
export const useMemoryMonitor = (interval = 10000) => {
  useEffect(() => {
    if (!performance.memory) return

    const checkMemory = () => {
      const memory = {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576),
        total: Math.round(performance.memory.totalJSHeapSize / 1048576),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Memory] Used: ${memory.used}MB / Total: ${memory.total}MB / Limit: ${memory.limit}MB`)
      }

      // Warn if memory usage is high
      const usagePercent = (memory.used / memory.limit) * 100
      if (usagePercent > 80) {
        console.warn(`[Memory Warning] High memory usage: ${usagePercent.toFixed(1)}%`)
      }
    }

    const intervalId = setInterval(checkMemory, interval)
    return () => clearInterval(intervalId)
  }, [interval])
}

/**
 * Track long tasks (> 50ms)
 */
export const useLongTaskMonitor = () => {
  useEffect(() => {
    if (!('PerformanceObserver' in window)) return

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          console.warn(`[Long Task] ${entry.name}: ${entry.duration.toFixed(2)}ms`)
          
          // Send to analytics
          if (process.env.NODE_ENV === 'production') {
            sendPerformanceMetrics({
              type: 'long-task',
              name: entry.name,
              duration: entry.duration
            })
          }
        }
      }
    })

    try {
      observer.observe({ entryTypes: ['longtask'] })
    } catch (e) {
      // longtask not supported
    }

    return () => observer.disconnect()
  }, [])
}

/**
 * Web Vitals monitoring
 */
export const useWebVitals = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Largest Contentful Paint (LCP)
    const observeLCP = () => {
      if (!('PerformanceObserver' in window)) return

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        
        console.log(`[LCP] ${lastEntry.renderTime || lastEntry.loadTime}ms`)
        
        if (process.env.NODE_ENV === 'production') {
          sendPerformanceMetrics({
            type: 'lcp',
            value: lastEntry.renderTime || lastEntry.loadTime
          })
        }
      })

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] })
      } catch (e) {
        // Not supported
      }

      return observer
    }

    // First Input Delay (FID)
    const observeFID = () => {
      if (!('PerformanceObserver' in window)) return

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          console.log(`[FID] ${entry.processingStart - entry.startTime}ms`)
          
          if (process.env.NODE_ENV === 'production') {
            sendPerformanceMetrics({
              type: 'fid',
              value: entry.processingStart - entry.startTime
            })
          }
        })
      })

      try {
        observer.observe({ entryTypes: ['first-input'] })
      } catch (e) {
        // Not supported
      }

      return observer
    }

    // Cumulative Layout Shift (CLS)
    const observeCLS = () => {
      if (!('PerformanceObserver' in window)) return

      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        }
        
        console.log(`[CLS] ${clsValue}`)
        
        if (process.env.NODE_ENV === 'production') {
          sendPerformanceMetrics({
            type: 'cls',
            value: clsValue
          })
        }
      })

      try {
        observer.observe({ entryTypes: ['layout-shift'] })
      } catch (e) {
        // Not supported
      }

      return observer
    }

    const lcpObserver = observeLCP()
    const fidObserver = observeFID()
    const clsObserver = observeCLS()

    return () => {
      lcpObserver?.disconnect()
      fidObserver?.disconnect()
      clsObserver?.disconnect()
    }
  }, [])
}

/**
 * Send performance metrics to analytics
 */
const sendPerformanceMetrics = (metrics) => {
  // TODO: Integrate with analytics service (Google Analytics, Mixpanel, etc.)
  try {
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...metrics,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now()
      })
    }).catch(() => {
      // Silently fail
    })
  } catch (e) {
    // Silently fail
  }
}

export default {
  useRenderTime,
  usePageLoadTime,
  useApiPerformance,
  useMemoryMonitor,
  useLongTaskMonitor,
  useWebVitals
}
