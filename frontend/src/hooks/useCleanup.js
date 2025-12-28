/**
 * Cleanup Hooks
 * Issue #6: Memory Leak - useEffect cleanup funksiyalari
 */

import { useEffect, useRef, useCallback } from 'react'

/**
 * Safe async effect with cleanup
 */
export function useAsyncEffect(asyncFn, deps = []) {
  useEffect(() => {
    let isMounted = true
    const abortController = new AbortController()

    const execute = async () => {
      try {
        await asyncFn({ 
          isMounted: () => isMounted, 
          signal: abortController.signal 
        })
      } catch (error) {
        if (error.name !== 'AbortError' && isMounted) {
          console.error('Async effect error:', error)
        }
      }
    }

    execute()

    return () => {
      isMounted = false
      abortController.abort()
    }
  }, deps)
}

/**
 * Interval with cleanup
 */
export function useInterval(callback, delay) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return

    const tick = () => savedCallback.current()
    const id = setInterval(tick, delay)

    return () => clearInterval(id)
  }, [delay])
}

/**
 * Timeout with cleanup
 */
export function useTimeout(callback, delay) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return

    const id = setTimeout(() => savedCallback.current(), delay)

    return () => clearTimeout(id)
  }, [delay])
}

/**
 * Event listener with cleanup
 */
export function useEventListener(eventName, handler, element = window, options = {}) {
  const savedHandler = useRef(handler)

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    const targetElement = element?.current || element
    if (!targetElement?.addEventListener) return

    const eventListener = (event) => savedHandler.current(event)
    targetElement.addEventListener(eventName, eventListener, options)

    return () => {
      targetElement.removeEventListener(eventName, eventListener, options)
    }
  }, [eventName, element, options])
}

/**
 * Mounted state check
 */
export function useMounted() {
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  return useCallback(() => mounted.current, [])
}

/**
 * Safe setState that checks if component is mounted
 */
export function useSafeState(initialState) {
  const [state, setState] = useState(initialState)
  const isMounted = useMounted()

  const setSafeState = useCallback((value) => {
    if (isMounted()) {
      setState(value)
    }
  }, [isMounted])

  return [state, setSafeState]
}

import { useState } from 'react'

export default {
  useAsyncEffect,
  useInterval,
  useTimeout,
  useEventListener,
  useMounted,
  useSafeState
}
