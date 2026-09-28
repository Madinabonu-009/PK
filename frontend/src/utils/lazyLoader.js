import { lazy, Suspense } from 'react'
import { PageLoader } from '../components/common'

/**
 * Lazy Loading Utility with retry logic
 * M9: Code splitting optimization
 */

/**
 * Retry logic for lazy loading
 * Network xatoliklarida qaytadan yuklash
 */
const retry = (fn, retriesLeft = 3, interval = 1000) => {
  return new Promise((resolve, reject) => {
    fn()
      .then(resolve)
      .catch((error) => {
        setTimeout(() => {
          if (retriesLeft === 1) {
            reject(error)
            return
          }
          
          retry(fn, retriesLeft - 1, interval).then(resolve, reject)
        }, interval)
      })
  })
}

/**
 * Lazy load component with retry
 */
export const lazyLoad = (importFunc, fallback = <PageLoader />) => {
  const LazyComponent = lazy(() => retry(() => importFunc()))
  
  return (props) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  )
}

/**
 * Preload component (for hover or interaction)
 */
export const preloadComponent = (importFunc) => {
  importFunc()
}

/**
 * Lazy load with custom loading component
 */
export const lazyLoadWithCustomLoader = (importFunc, LoadingComponent) => {
  const LazyComponent = lazy(() => retry(() => importFunc()))
  
  return (props) => (
    <Suspense fallback={<LoadingComponent />}>
      <LazyComponent {...props} />
    </Suspense>
  )
}

/**
 * Lazy load multiple components
 */
export const lazyLoadMultiple = (importFuncs) => {
  return importFuncs.map(fn => lazy(() => retry(() => fn())))
}

/**
 * Prefetch component on idle
 */
export const prefetchOnIdle = (importFunc) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => importFunc())
  } else {
    setTimeout(() => importFunc(), 1)
  }
}

/**
 * Route-based code splitting helper
 */
export const createLazyRoute = (importFunc) => {
  return {
    Component: lazyLoad(importFunc),
    loader: () => importFunc().then(module => ({ Component: module.default }))
  }
}

export default {
  lazyLoad,
  preloadComponent,
  lazyLoadWithCustomLoader,
  lazyLoadMultiple,
  prefetchOnIdle,
  createLazyRoute,
  retry
}
