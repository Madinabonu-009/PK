import { useState, useCallback, useRef, useEffect } from 'react'

const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes
const DEFAULT_STALE_TIME = 30 * 1000 // 30 seconds

class CacheStore {
  constructor() {
    this.cache = new Map()
    this.subscribers = new Map()
  }

  get(key) {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }
    
    return entry
  }

  set(key, data, ttl = DEFAULT_TTL) {
    const entry = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    }
    this.cache.set(key, entry)
    this.notify(key, data)
  }

  invalidate(key) {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }

  invalidatePattern(pattern) {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set())
    }
    this.subscribers.get(key).add(callback)
    
    return () => {
      this.subscribers.get(key)?.delete(callback)
    }
  }

  notify(key, data) {
    this.subscribers.get(key)?.forEach(callback => callback(data))
  }
}

const globalCache = new CacheStore()

export function useCache(key, fetchFn, options = {}) {
  const {
    ttl = DEFAULT_TTL,
    staleTime = DEFAULT_STALE_TIME,
    enabled = true,
    onSuccess,
    onError,
    initialData
  } = options

  const [data, setData] = useState(() => {
    const cached = globalCache.get(key)
    return cached?.data ?? initialData ?? null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isStale, setIsStale] = useState(false)
  
  const fetchRef = useRef(fetchFn)
  fetchRef.current = fetchFn

  const fetch = useCallback(async (force = false) => {
    if (!enabled) return

    const cached = globalCache.get(key)
    
    // Return cached data if fresh
    if (cached && !force) {
      const age = Date.now() - cached.timestamp
      if (age < staleTime) {
        setData(cached.data)
        setIsStale(false)
        return cached.data
      }
      // Data is stale but usable
      setData(cached.data)
      setIsStale(true)
    }

    setLoading(true)
    setError(null)

    try {
      const result = await fetchRef.current()
      globalCache.set(key, result, ttl)
      setData(result)
      setIsStale(false)
      onSuccess?.(result)
      return result
    } catch (err) {
      setError(err)
      onError?.(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [key, enabled, ttl, staleTime, onSuccess, onError])

  const invalidate = useCallback(() => {
    globalCache.invalidate(key)
    setIsStale(true)
  }, [key])

  const update = useCallback((updater) => {
    setData(prev => {
      const newData = typeof updater === 'function' ? updater(prev) : updater
      globalCache.set(key, newData, ttl)
      return newData
    })
  }, [key, ttl])

  // Subscribe to cache updates
  useEffect(() => {
    return globalCache.subscribe(key, setData)
  }, [key])

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetch()
    }
  }, [key, enabled])

  return {
    data,
    loading,
    error,
    isStale,
    fetch,
    refetch: () => fetch(true),
    invalidate,
    update
  }
}

// Mutation hook with optimistic updates
export function useMutation(mutationFn, options = {}) {
  const {
    onSuccess,
    onError,
    onSettled,
    invalidateKeys = []
  } = options

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const mutate = useCallback(async (variables, mutationOptions = {}) => {
    setLoading(true)
    setError(null)

    // Optimistic update
    if (mutationOptions.optimisticUpdate) {
      mutationOptions.optimisticUpdate()
    }

    try {
      const result = await mutationFn(variables)
      
      // Invalidate related cache keys
      invalidateKeys.forEach(key => {
        if (typeof key === 'string') {
          globalCache.invalidate(key)
        } else if (key instanceof RegExp) {
          globalCache.invalidatePattern(key.source)
        }
      })

      onSuccess?.(result, variables)
      mutationOptions.onSuccess?.(result)
      
      return result
    } catch (err) {
      setError(err)
      
      // Rollback optimistic update
      if (mutationOptions.rollback) {
        mutationOptions.rollback()
      }
      
      onError?.(err, variables)
      mutationOptions.onError?.(err)
      
      throw err
    } finally {
      setLoading(false)
      onSettled?.()
      mutationOptions.onSettled?.()
    }
  }, [mutationFn, invalidateKeys, onSuccess, onError, onSettled])

  return {
    mutate,
    loading,
    error,
    reset: () => setError(null)
  }
}

// Prefetch utility
export function prefetch(key, fetchFn, ttl = DEFAULT_TTL) {
  return fetchFn().then(data => {
    globalCache.set(key, data, ttl)
    return data
  })
}

// Cache utilities
export const cache = {
  get: (key) => globalCache.get(key)?.data,
  set: (key, data, ttl) => globalCache.set(key, data, ttl),
  invalidate: (key) => globalCache.invalidate(key),
  invalidatePattern: (pattern) => globalCache.invalidatePattern(pattern),
  clear: () => globalCache.invalidate()
}

export default useCache
