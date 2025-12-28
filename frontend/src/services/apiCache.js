/**
 * Simple API Cache Service
 * API so'rovlarini cache qilish uchun
 */

const cache = new Map()
const DEFAULT_TTL = 5 * 60 * 1000 // 5 daqiqa

/**
 * Cache entry yaratish
 */
function createCacheEntry(data, ttl = DEFAULT_TTL) {
  return {
    data,
    timestamp: Date.now(),
    ttl
  }
}

/**
 * Cache entry hali yaroqli ekanligini tekshirish
 */
function isValid(entry) {
  if (!entry) return false
  return Date.now() - entry.timestamp < entry.ttl
}

/**
 * Cache dan olish
 */
export function getFromCache(key) {
  const entry = cache.get(key)
  if (isValid(entry)) {
    return entry.data
  }
  // Eskirgan entry ni o'chirish
  cache.delete(key)
  return null
}

/**
 * Cache ga saqlash
 */
export function setToCache(key, data, ttl = DEFAULT_TTL) {
  cache.set(key, createCacheEntry(data, ttl))
}

/**
 * Cache dan o'chirish
 */
export function removeFromCache(key) {
  cache.delete(key)
}

/**
 * Pattern bo'yicha cache ni tozalash
 */
export function invalidateCache(pattern) {
  if (!pattern) {
    cache.clear()
    return
  }
  
  const regex = new RegExp(pattern)
  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key)
    }
  }
}

/**
 * Cache bilan API so'rov
 */
export async function cachedFetch(key, fetchFn, options = {}) {
  const { ttl = DEFAULT_TTL, forceRefresh = false } = options
  
  // Force refresh bo'lmasa, cache dan olishga harakat qilish
  if (!forceRefresh) {
    const cached = getFromCache(key)
    if (cached !== null) {
      return cached
    }
  }
  
  // API dan olish
  const data = await fetchFn()
  
  // Cache ga saqlash
  setToCache(key, data, ttl)
  
  return data
}

/**
 * Cache statistikasi
 */
export function getCacheStats() {
  let validCount = 0
  let expiredCount = 0
  
  for (const [key, entry] of cache.entries()) {
    if (isValid(entry)) {
      validCount++
    } else {
      expiredCount++
    }
  }
  
  return {
    total: cache.size,
    valid: validCount,
    expired: expiredCount
  }
}

/**
 * Eskirgan cache larni tozalash
 */
export function cleanupExpiredCache() {
  for (const [key, entry] of cache.entries()) {
    if (!isValid(entry)) {
      cache.delete(key)
    }
  }
}

// Har 5 daqiqada eskirgan cache larni tozalash
setInterval(cleanupExpiredCache, 5 * 60 * 1000)

export default {
  get: getFromCache,
  set: setToCache,
  remove: removeFromCache,
  invalidate: invalidateCache,
  cachedFetch,
  getStats: getCacheStats,
  cleanup: cleanupExpiredCache
}
