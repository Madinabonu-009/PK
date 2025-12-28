/**
 * JWT Token Blacklist
 * Stores invalidated tokens (logout, password change, etc.)
 * In production, use Redis for distributed systems
 */

class TokenBlacklist {
  constructor() {
    this.blacklist = new Map()
    this.cleanupInterval = 3600000 // 1 hour
    
    // Start cleanup interval
    this.startCleanup()
  }
  
  /**
   * Add token to blacklist
   */
  add(token, expiresAt) {
    this.blacklist.set(token, {
      addedAt: Date.now(),
      expiresAt: expiresAt || Date.now() + 86400000 // 24 hours default
    })
  }
  
  /**
   * Check if token is blacklisted
   */
  isBlacklisted(token) {
    const entry = this.blacklist.get(token)
    
    if (!entry) return false
    
    // Remove if expired
    if (entry.expiresAt < Date.now()) {
      this.blacklist.delete(token)
      return false
    }
    
    return true
  }
  
  /**
   * Remove token from blacklist
   */
  remove(token) {
    return this.blacklist.delete(token)
  }
  
  /**
   * Clear all expired tokens
   */
  cleanup() {
    const now = Date.now()
    let removed = 0
    
    for (const [token, entry] of this.blacklist.entries()) {
      if (entry.expiresAt < now) {
        this.blacklist.delete(token)
        removed++
      }
    }
    
    if (removed > 0) {
      console.log(`Cleaned up ${removed} expired tokens from blacklist`)
    }
  }
  
  /**
   * Start automatic cleanup
   */
  startCleanup() {
    setInterval(() => {
      this.cleanup()
    }, this.cleanupInterval)
  }
  
  /**
   * Get blacklist size
   */
  size() {
    return this.blacklist.size
  }
  
  /**
   * Clear all tokens (use with caution)
   */
  clear() {
    this.blacklist.clear()
  }
}

// Export singleton instance
const tokenBlacklist = new TokenBlacklist()
export default tokenBlacklist

// Convenience exports
export const addToBlacklist = (token, expiresAt) => tokenBlacklist.add(token, expiresAt)
export const isTokenBlacklisted = (token) => tokenBlacklist.isBlacklisted(token)
export const removeFromBlacklist = (token) => tokenBlacklist.remove(token)
export const getBlacklistSize = () => tokenBlacklist.size()
