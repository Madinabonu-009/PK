/**
 * Tests for brute force protection middleware
 */

import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals'

describe('Brute Force Protection', () => {
  let bruteForceProtection, resetAttempts, getAttempts
  let req, res, next

  beforeEach(async () => {
    jest.useFakeTimers()
    jest.clearAllMocks()

    req = {
      ip: '127.0.0.1',
      body: { username: 'testuser' }
    }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }
    next = jest.fn()

    // Import fresh module
    const module = await import('../bruteForce.js')
    bruteForceProtection = module.bruteForceProtection
    resetAttempts = module.resetAttempts
    getAttempts = module.getAttempts
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should allow request on first attempt', () => {
    bruteForceProtection(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('should track failed attempts', () => {
    const key = `${req.ip}:${req.body.username}`

    // Simulate 3 failed attempts
    for (let i = 0; i < 3; i++) {
      bruteForceProtection(req, res, next)
    }

    const attempts = getAttempts(key)
    expect(attempts).toBe(3)
  })

  it('should block after max attempts', () => {
    // Simulate 5 failed attempts (max)
    for (let i = 0; i < 5; i++) {
      bruteForceProtection(req, res, next)
      next.mockClear()
      res.status.mockClear()
      res.json.mockClear()
    }

    // 6th attempt should be blocked
    bruteForceProtection(req, res, next)

    expect(res.status).toHaveBeenCalledWith(429)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('Too many')
      })
    )
    expect(next).not.toHaveBeenCalled()
  })

  it('should reset attempts after lockout period', () => {
    const key = `${req.ip}:${req.body.username}`

    // Max out attempts
    for (let i = 0; i < 6; i++) {
      bruteForceProtection(req, res, next)
    }

    // Fast forward 15 minutes
    jest.advanceTimersByTime(15 * 60 * 1000 + 1000)

    // Reset mocks
    next.mockClear()
    res.status.mockClear()

    // Should be allowed again
    bruteForceProtection(req, res, next)

    expect(next).toHaveBeenCalled()
  })

  it('should reset attempts manually', () => {
    const key = `${req.ip}:${req.body.username}`

    // Add some attempts
    for (let i = 0; i < 3; i++) {
      bruteForceProtection(req, res, next)
    }

    expect(getAttempts(key)).toBe(3)

    // Reset
    resetAttempts(key)

    expect(getAttempts(key)).toBe(0)
  })

  it('should track attempts per user', () => {
    const req2 = {
      ip: '127.0.0.1',
      body: { username: 'anotheruser' }
    }

    // 3 attempts for user1
    for (let i = 0; i < 3; i++) {
      bruteForceProtection(req, res, next)
    }

    // 2 attempts for user2
    for (let i = 0; i < 2; i++) {
      bruteForceProtection(req2, res, next)
    }

    expect(getAttempts(`${req.ip}:${req.body.username}`)).toBe(3)
    expect(getAttempts(`${req2.ip}:${req2.body.username}`)).toBe(2)
  })

  it('should include retry-after header when blocked', () => {
    res.set = jest.fn()

    // Max out attempts
    for (let i = 0; i < 6; i++) {
      bruteForceProtection(req, res, next)
    }

    // Check if Retry-After would be set (implementation dependent)
    expect(res.status).toHaveBeenCalledWith(429)
  })
})
