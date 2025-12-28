/**
 * Simple In-Memory Cache Middleware
 * For production, use Redis
 */

class SimpleCache {
  constructor() {
    this.cache = new Map()
    this.ttls = new Map()
  }

  set(key, value, ttl = 300000) { // 5 minutes default
    this.cache.set(key, value)
    
    if (ttl > 0) {
      const expiresAt = Date.now() + ttl
      this.ttls.set(key, expiresAt)
      
      // Auto cleanup
      setTimeout(() => {
        this.delete(key)
      }, ttl)
    }
  }

  get(key) {
    // Check if expired
    const expiresAt = this.ttls.get(key)
    if (expiresAt && Date.now() > expiresAt) {
      this.delete(key)
      return null
    }
    
    return this.cache.get(key)
  }

  has(key) {
    return this.cache.has(key) && this.get(key) !== null
  }

  delete(key) {
    this.cache.delete(key)
    this.ttls.delete(key)
  }

  clear() {
    this.cache.clear()
    this.ttls.clear()
  }

  size() {
    return this.cache.size
  }

  keys() {
    return Array.from(this.cache.keys())
  }
}

const cache = new SimpleCache()

/**
 * Cache middleware
 */
export const cacheMiddleware = (duration = 300000) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next()
    }

    const key = `cache:${req.originalUrl || req.url}`
    const cachedResponse = cache.get(key)

    if (cachedResponse) {
      res.setHeader('X-Cache', 'HIT')
      return res.json(cachedResponse)
    }

    // Store original send
    const originalSend = res.send
    res.send = function(data) {
      // Cache successful responses
      if (res.statusCode === 200) {
        try {
          const parsed = JSON.parse(data)
          cache.set(key, parsed, duration)
          res.setHeader('X-Cache', 'MISS')
        } catch (e) {
          // Not JSON, don't cache
        }
      }
      
      return originalSend.call(this, data)
    }

    next()
  }
}

/**
 * Cache specific routes
 */
export const cacheRoute = (duration) => cacheMiddleware(duration)

/**
 * Invalidate cache by pattern
 */
export const invalidateCache = (pattern) => {
  const keys = cache.keys()
  let count = 0
  
  keys.forEach(key => {
    if (key.includes(pattern)) {
      cache.delete(key)
      count++
    }
  })
  
  return count
}

/**
 * Clear all cache
 */
export const clearCache = () => {
  cache.clear()
}

/**
 * Get cache stats
 */
export const getCacheStats = () => {
  return {
    size: cache.size(),
    keys: cache.keys().length
  }
}

export default {
  cacheMiddleware,
  cacheRoute,
  invalidateCache,
  clearCache,
  getCacheStats,
  cache
}
