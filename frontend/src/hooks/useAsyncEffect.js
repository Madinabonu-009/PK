/**
 * Custom hook for async operations with automatic cleanup
 * Prevents memory leaks from setState on unmounted components
 */

import { useEffect, useRef, useCallback } from 'react'

/**
 * useAsyncEffect - Safe async operations in useEffect
 * Automatically cancels pending operations on unmount
 */
export const useAsyncEffect = (asyncFunction, dependencies = []) => {
  const isMountedRef = useRef(true)
  
  useEffect(() => {
    isMountedRef.current = true
    
    const execute = async () => {
      try {
        await asyncFunction(isMountedRef)
      } catch (error) {
        if (isMountedRef.current) {
          console.error('Async effect error:', error)
        }
      }
    }
    
    execute()
    
    return () => {
      isMountedRef.current = false
    }
  }, dependencies)
}

/**
 * useSafeState - State that only updates if component is mounted
 */
export const useSafeState = (initialState) => {
  const isMountedRef = useRef(true)
  const [state, setState] = React.useState(initialState)
  
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])
  
  const setSafeState = useCallback((value) => {
    if (isMountedRef.current) {
      setState(value)
    }
  }, [])
  
  return [state, setSafeState]
}

/**
 * useAbortController - Fetch with automatic abort on unmount
 */
export const useAbortController = () => {
  const abortControllerRef = useRef(null)
  
  useEffect(() => {
    abortControllerRef.current = new AbortController()
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])
  
  return abortControllerRef.current
}

/**
 * useInterval - setInterval with automatic cleanup
 */
export const useInterval = (callback, delay) => {
  const savedCallback = useRef()
  
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])
  
  useEffect(() => {
    if (delay === null) return
    
    const tick = () => {
      savedCallback.current()
    }
    
    const id = setInterval(tick, delay)
    return () => clearInterval(id)
  }, [delay])
}

/**
 * useTimeout - setTimeout with automatic cleanup
 */
export const useTimeout = (callback, delay) => {
  const savedCallback = useRef()
  
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])
  
  useEffect(() => {
    if (delay === null) return
    
    const id = setTimeout(() => {
      savedCallback.current()
    }, delay)
    
    return () => clearTimeout(id)
  }, [delay])
}

/**
 * useEventListener - addEventListener with automatic cleanup
 */
export const useEventListener = (eventName, handler, element = window) => {
  const savedHandler = useRef()
  
  useEffect(() => {
    savedHandler.current = handler
  }, [handler])
  
  useEffect(() => {
    const isSupported = element && element.addEventListener
    if (!isSupported) return
    
    const eventListener = (event) => savedHandler.current(event)
    element.addEventListener(eventName, eventListener)
    
    return () => {
      element.removeEventListener(eventName, eventListener)
    }
  }, [eventName, element])
}

export default {
  useAsyncEffect,
  useSafeState,
  useAbortController,
  useInterval,
  useTimeout,
  useEventListener
}
