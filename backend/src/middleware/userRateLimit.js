/**
 * User-specific Rate Limiting
 * Different limits for different user roles
 */

import { ROLES } from '../constants/index.js'

class UserRateLimiter {
  constructor() {
    this.requests = new Map()
    this.limits = {
      [ROLES.ADMIN]: {
        windowMs: 60000, // 1 minute
        maxRequests: 1000
      },
      [ROLES.TEACHER]: {
        windowMs: 60000,
        maxRequests: 500
      },
      [ROLES.PARENT]: {
        windowMs: 60000,
        maxRequests: 200
      },
      anonymous: {
        windowMs: 60000,
        maxRequests: 50
      }
    }

    // Cleanup old entries every 5 minutes
    setInterval(() => this.cleanup(), 300000)
  }

  /**
   * Check if user is rate limited
   */
  isLimited(userId, role = 'anonymous') {
    const key = userId || 'anonymous'
    const limit = this.limits[role] || this.limits.anonymous
    const now = Date.now()

    if (!this.requests.has(key)) {
      this.requests.set(key, [])
    }

    const userRequests = this.requests.get(key)
    
    // Remove old requests outside window
    const validRequests = userRequests.filter(
      timestamp => now - timestamp < limit.windowMs
    )

    // Check if limit exceeded
    if (validRequests.length >= limit.maxRequests) {
      return {
        limited: true,
        retryAfter: Math.ceil((validRequests[0] + limit.windowMs - now) / 1000),
        limit: limit.maxRequests,
        remaining: 0
      }
    }

    // Add current request
    validRequests.push(now)
    this.requests.set(key, validRequests)

    return {
      limited: false,
      limit: limit.maxRequests,
      remaining: limit.maxRequests - validRequests.length,
      reset: Math.ceil((now + limit.windowMs) / 1000)
    }
  }

  /**
   * Reset user limits
   */
  reset(userId) {
    this.requests.delete(userId)
  }

  /**
   * Cleanup old entries
   */
  cleanup() {
    const now = Date.now()
    let cleaned = 0

    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(
        timestamp => now - timestamp < 300000 // 5 minutes
      )

      if (validRequests.length === 0) {
        this.requests.delete(key)
        cleaned++
      } else {
        this.requests.set(key, validRequests)
      }
    }

    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} rate limit entries`)
    }
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      totalUsers: this.requests.size,
      limits: this.limits
    }
  }
}

const rateLimiter = new UserRateLimiter()

/**
 * Rate limiting middleware
 */
export const userRateLimit = (req, res, next) => {
  const userId = req.user?.id
  const role = req.user?.role || 'anonymous'

  const result = rateLimiter.isLimited(userId, role)

  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', result.limit)
  res.setHeader('X-RateLimit-Remaining', result.remaining)
  
  if (result.reset) {
    res.setHeader('X-RateLimit-Reset', result.reset)
  }

  if (result.limited) {
    res.setHeader('Retry-After', result.retryAfter)
    return res.status(429).json({
      error: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: result.retryAfter,
      limit: result.limit
    })
  }

  next()
}

/**
 * Get rate limit stats
 */
export const getRateLimitStats = () => {
  return rateLimiter.getStats()
}

/**
 * Reset user rate limit
 */
export const resetUserRateLimit = (userId) => {
  rateLimiter.reset(userId)
}

export default {
  userRateLimit,
  getRateLimitStats,
  resetUserRateLimit
}
