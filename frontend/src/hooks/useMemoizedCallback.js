/**
 * Memoization Hooks
 * Issue #30: Expensive calculations memoize qilinmagan
 */

import { useCallback, useMemo, useRef, useEffect } from 'react'

/**
 * Memoize expensive calculations with cache
 */
export function useMemoizedValue(factory, deps, cacheKey = null) {
  const cache = useRef(new Map())
  const key = cacheKey || JSON.stringify(deps)

  return useMemo(() => {
    if (cache.current.has(key)) {
      return cache.current.get(key)
    }
    const value = factory()
    cache.current.set(key, value)
    
    // Limit cache size
    if (cache.current.size > 100) {
      const firstKey = cache.current.keys().next().value
      cache.current.delete(firstKey)
    }
    
    return value
  }, deps)
}

/**
 * Stable callback that doesn't change reference
 */
export function useStableCallback(callback) {
  const callbackRef = useRef(callback)
  
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return useCallback((...args) => {
    return callbackRef.current?.(...args)
  }, [])
}

/**
 * Previous value hook
 */
export function usePrevious(value) {
  const ref = useRef()
  
  useEffect(() => {
    ref.current = value
  }, [value])
  
  return ref.current
}

/**
 * Deep compare memo
 */
export function useDeepMemo(factory, deps) {
  const ref = useRef({ deps: null, value: null })
  
  const depsChanged = !ref.current.deps || 
    JSON.stringify(deps) !== JSON.stringify(ref.current.deps)
  
  if (depsChanged) {
    ref.current.deps = deps
    ref.current.value = factory()
  }
  
  return ref.current.value
}

/**
 * Lazy initialization
 */
export function useLazy(factory) {
  const ref = useRef(null)
  const initialized = useRef(false)

  if (!initialized.current) {
    ref.current = factory()
    initialized.current = true
  }

  return ref.current
}

export default {
  useMemoizedValue,
  useStableCallback,
  usePrevious,
  useDeepMemo,
  useLazy
}
