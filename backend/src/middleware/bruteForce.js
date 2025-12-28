/**
 * Brute Force Protection
 * Prevents repeated login attempts
 */

import rateLimit from 'express-rate-limit'

/**
 * Login attempt limiter
 * Allows 5 attempts per 15 minutes per IP
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: {
    error: 'Too many login attempts. Please try again after 15 minutes.',
    code: 'TOO_MANY_ATTEMPTS',
    retryAfter: 15 * 60 // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  // Skip successful requests
  skipSuccessfulRequests: true,
  // Custom key generator (by IP + username)
  keyGenerator: (req) => {
    const ip = (req.ip || req.socket?.remoteAddress || 'unknown').replace(/^::ffff:/, '')
    return `${ip}-${req.body?.username || 'unknown'}`
  }
})

/**
 * Account-specific limiter
 * Tracks failed attempts per account
 */
class AccountLimiter {
  constructor() {
    this.attempts = new Map()
    this.lockouts = new Map()
    this.maxAttempts = 5
    this.lockoutDuration = 15 * 60 * 1000 // 15 minutes
    this.attemptWindow = 15 * 60 * 1000 // 15 minutes
    
    // Cleanup old entries every hour
    setInterval(() => this.cleanup(), 3600000)
  }
  
  /**
   * Record failed login attempt
   */
  recordFailedAttempt(username) {
    const now = Date.now()
    
    if (!this.attempts.has(username)) {
      this.attempts.set(username, [])
    }
    
    const attempts = this.attempts.get(username)
    attempts.push(now)
    
    // Remove old attempts outside window
    const recentAttempts = attempts.filter(
      time => now - time < this.attemptWindow
    )
    this.attempts.set(username, recentAttempts)
    
    // Check if should lock account
    if (recentAttempts.length >= this.maxAttempts) {
      this.lockAccount(username)
      return {
        locked: true,
        remainingAttempts: 0,
        lockoutEndsAt: now + this.lockoutDuration
      }
    }
    
    return {
      locked: false,
      remainingAttempts: this.maxAttempts - recentAttempts.length,
      attempts: recentAttempts.length
    }
  }
  
  /**
   * Lock account temporarily
   */
  lockAccount(username) {
    const lockoutEndsAt = Date.now() + this.lockoutDuration
    this.lockouts.set(username, lockoutEndsAt)
  }
  
  /**
   * Check if account is locked
   */
  isLocked(username) {
    const lockoutEndsAt = this.lockouts.get(username)
    
    if (!lockoutEndsAt) return false
    
    const now = Date.now()
    
    if (now >= lockoutEndsAt) {
      // Lockout expired
      this.lockouts.delete(username)
      this.attempts.delete(username)
      return false
    }
    
    return {
      locked: true,
      remainingTime: Math.ceil((lockoutEndsAt - now) / 1000), // seconds
      lockoutEndsAt
    }
  }
  
  /**
   * Reset attempts for account (after successful login)
   */
  reset(username) {
    this.attempts.delete(username)
    this.lockouts.delete(username)
  }
  
  /**
   * Cleanup old entries
   */
  cleanup() {
    const now = Date.now()
    
    // Clean up old attempts
    for (const [username, attempts] of this.attempts.entries()) {
      const recentAttempts = attempts.filter(
        time => now - time < this.attemptWindow
      )
      
      if (recentAttempts.length === 0) {
        this.attempts.delete(username)
      } else {
        this.attempts.set(username, recentAttempts)
      }
    }
    
    // Clean up expired lockouts
    for (const [username, lockoutEndsAt] of this.lockouts.entries()) {
      if (now >= lockoutEndsAt) {
        this.lockouts.delete(username)
      }
    }
  }
  
  /**
   * Get stats
   */
  getStats() {
    return {
      activeAttempts: this.attempts.size,
      activeLockouts: this.lockouts.size
    }
  }
}

// Export singleton instance
const accountLimiter = new AccountLimiter()
export default accountLimiter

/**
 * Middleware to check account lockout
 */
export const checkAccountLockout = (req, res, next) => {
  const username = req.body?.username
  
  if (!username) {
    return next()
  }
  
  const lockStatus = accountLimiter.isLocked(username)
  
  if (lockStatus) {
    return res.status(429).json({
      error: 'Account temporarily locked due to too many failed login attempts',
      code: 'ACCOUNT_LOCKED',
      remainingTime: lockStatus.remainingTime,
      retryAfter: lockStatus.remainingTime
    })
  }
  
  next()
}

/**
 * Record failed login
 */
export const recordFailedLogin = (username) => {
  return accountLimiter.recordFailedAttempt(username)
}

/**
 * Reset login attempts
 */
export const resetLoginAttempts = (username) => {
  accountLimiter.reset(username)
}

export { accountLimiter }
