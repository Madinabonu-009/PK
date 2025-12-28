/**
 * Lazy Loading Wrapper Component
 * Provides loading state and error handling for lazy-loaded components
 */

import React, { Suspense } from 'react'
import PropTypes from 'prop-types'
import { LoadingSpinner, LoadingOverlay } from './Loading'
import ErrorBoundary from './ErrorBoundary'

/**
 * Lazy load wrapper with loading and error states
 */
export const LazyLoad = ({ 
  children, 
  fallback = <LoadingOverlay message="Yuklanmoqda..." />,
  errorFallback = null 
}) => {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

LazyLoad.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  errorFallback: PropTypes.func
}

/**
 * Create lazy loaded route component
 */
export const createLazyRoute = (importFunc, options = {}) => {
  const LazyComponent = React.lazy(importFunc)
  
  return (props) => (
    <LazyLoad 
      fallback={options.fallback}
      errorFallback={options.errorFallback}
    >
      <LazyComponent {...props} />
    </LazyLoad>
  )
}

/**
 * Preload component for faster navigation
 */
export const preloadComponent = (importFunc) => {
  const LazyComponent = React.lazy(importFunc)
  // Trigger the import
  importFunc()
  return LazyComponent
}

export default LazyLoad
