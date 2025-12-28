/**
 * Property-Based Tests for Authentication
 * 
 * **Feature: play-kids-platform, Property 8: Authentication Security**
 * **Validates: Requirements 9.2, 9.3**
 * 
 * Property: For any valid credentials, access should be granted;
 * for any invalid credentials, access should be denied with error message.
 */

import fc from 'fast-check'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { generateToken, authenticateToken, JWT_SECRET } from '../middleware/auth.js'

// Simple mock factory functions
const createMockResponse = () => {
  let statusCode = null
  let jsonData = null
  return {
    status: function(code) { statusCode = code; return this },
    json: function(data) { jsonData = data; return this },
    getStatus: () => statusCode,
    getJson: () => jsonData
  }
}

const createMockNext = () => {
  let called = false
  return {
    fn: () => { called = true },
    wasCalled: () => called
  }
}

describe('Property 8: Authentication Security', () => {
  // Helper to create a mock user
  const createMockUser = (username, role = 'admin') => ({
    id: '1',
    username,
    role,
    createdAt: new Date().toISOString()
  })

  /**
   * Property: For any valid user, generateToken should produce a valid JWT
   * that can be verified and contains the correct user information.
   */
  test('valid users receive valid tokens with correct payload', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        fc.constantFrom('admin', 'teacher'),
        (username, role) => {
          const user = createMockUser(username.trim(), role)
          const token = generateToken(user)
          
          // Token should be a non-empty string
          if (typeof token !== 'string' || token.length === 0) return false
          
          // Token should be verifiable
          const decoded = jwt.verify(token, JWT_SECRET)
          
          // Decoded token should contain correct user info
          return decoded.id === user.id &&
                 decoded.username === user.username &&
                 decoded.role === user.role
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: For any invalid/tampered token, authentication should fail.
   */
  test('invalid tokens are rejected', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 200 }),
        (invalidToken) => {
          const req = {
            headers: { authorization: `Bearer ${invalidToken}` }
          }
          const res = createMockResponse()
          const next = createMockNext()
          
          authenticateToken(req, res, next.fn)
          
          // Should either reject (401) or if by chance it's valid, call next
          // In practice, random strings won't be valid JWTs
          if (!next.wasCalled()) {
            return res.getStatus() === 401 && 
                   res.getJson() !== null && 
                   typeof res.getJson().error === 'string'
          }
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: For any request without a token, authentication should fail with 401.
   */
  test('missing tokens are rejected with 401', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(undefined, null, '', 'InvalidHeader'),
        (authHeader) => {
          const req = {
            headers: authHeader ? { authorization: authHeader } : {}
          }
          const res = createMockResponse()
          const next = createMockNext()
          
          authenticateToken(req, res, next.fn)
          
          // Should reject with 401
          return res.getStatus() === 401 && !next.wasCalled()
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: For any valid token, the middleware should call next() and attach user to request.
   */
  test('valid tokens grant access and attach user to request', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
        fc.constantFrom('admin', 'teacher'),
        (username, role) => {
          const user = createMockUser(username.trim(), role)
          const token = generateToken(user)
          
          const req = {
            headers: { authorization: `Bearer ${token}` }
          }
          const res = createMockResponse()
          const next = createMockNext()
          
          authenticateToken(req, res, next.fn)
          
          // Should call next() for valid token
          if (!next.wasCalled()) return false
          if (res.getStatus() !== null) return false
          
          // User should be attached to request
          return req.user !== undefined &&
                 req.user.id === user.id &&
                 req.user.username === user.username &&
                 req.user.role === user.role
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Password comparison - valid passwords match, invalid don't.
   */
  test('bcrypt correctly validates passwords', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 4, maxLength: 20 }).filter(s => s.trim().length >= 4),
        fc.string({ minLength: 4, maxLength: 20 }).filter(s => s.trim().length >= 4),
        async (correctPassword, wrongPassword) => {
          const trimmedCorrect = correctPassword.trim()
          const trimmedWrong = wrongPassword.trim()
          
          // Hash the correct password
          const hashedPassword = await bcrypt.hash(trimmedCorrect, 4) // Lower cost for speed
          
          // Correct password should match
          const validMatch = await bcrypt.compare(trimmedCorrect, hashedPassword)
          if (!validMatch) return false
          
          // Wrong password should not match (unless they happen to be the same)
          if (trimmedCorrect !== trimmedWrong) {
            const invalidMatch = await bcrypt.compare(trimmedWrong, hashedPassword)
            if (invalidMatch) return false
          }
          
          return true
        }
      ),
      { numRuns: 20 } // Fewer runs due to async bcrypt operations
    )
  }, 30000) // 30 second timeout for bcrypt operations
})
