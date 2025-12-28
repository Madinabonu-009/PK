/**
 * Debounce Hook
 * Issue #29: Search inputlarda debounce
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { UI } from '../constants'

/**
 * Debounce a value
 */
export function useDebounce(value, delay = UI.DEBOUNCE_DELAY) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

/**
 * Debounce a callback function
 */
export function useDebouncedCallback(callback, delay = UI.DEBOUNCE_DELAY) {
  const timeoutRef = useRef(null)
  const callbackRef = useRef(callback)

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args)
    }, delay)
  }, [delay])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback
}

/**
 * Throttle a callback function
 */
export function useThrottle(callback, delay = UI.DEBOUNCE_DELAY) {
  const lastRan = useRef(Date.now())
  const timeoutRef = useRef(null)

  const throttledCallback = useCallback((...args) => {
    const now = Date.now()
    const timeSinceLastRan = now - lastRan.current

    if (timeSinceLastRan >= delay) {
      callback(...args)
      lastRan.current = now
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args)
        lastRan.current = Date.now()
      }, delay - timeSinceLastRan)
    }
  }, [callback, delay])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return throttledCallback
}

export default useDebounce
