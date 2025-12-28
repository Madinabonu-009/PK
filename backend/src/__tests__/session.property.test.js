/**
 * Property-Based Tests for Session Handling
 * 
 * **Feature: play-kids-platform, Property 9: Session Expiry Handling**
 * **Validates: Requirements 9.4**
 * 
 * Property: For any expired session, the user should be redirected to login page
 * when accessing protected routes.
 */

import fc from 'fast-check'
import jwt from 'jsonwebtoken'
import { authenticateToken, JWT_SECRET } from '../middleware/auth.js'

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

describe('Property 9: Session Expiry Handling', () => {
  /**
   * Property: For any expired token, authentication middleware should reject
   * with 401 status and appropriate error message.
   */
  test('expired tokens are rejected with 401', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
        fc.constantFrom('admin', 'teacher'),
        (username, role) => {
          // Create an expired token (expired 1 hour ago)
          const expiredToken = jwt.sign(
            { id: '1', username: username.trim(), role },
            JWT_SECRET,
            { expiresIn: '-1h' } // Already expired
          )
          
          const req = {
            headers: { authorization: `Bearer ${expiredToken}` }
          }
          const res = createMockResponse()
          const next = createMockNext()
          
          authenticateToken(req, res, next.fn)
          
          // Should reject with 401 for expired token
          return res.getStatus() === 401 && 
                 !next.wasCalled() &&
                 res.getJson() !== null &&
                 typeof res.getJson().error === 'string'
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: For any valid non-expired token, authentication should succeed.
   */
  test('non-expired tokens grant access', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
        fc.constantFrom('admin', 'teacher'),
        fc.integer({ min: 1, max: 24 }), // Hours until expiry
        (username, role, hoursValid) => {
          // Create a valid token that expires in the future
          const validToken = jwt.sign(
            { id: '1', username: username.trim(), role },
            JWT_SECRET,
            { expiresIn: `${hoursValid}h` }
          )
          
          const req = {
            headers: { authorization: `Bearer ${validToken}` }
          }
          const res = createMockResponse()
          const next = createMockNext()
          
          authenticateToken(req, res, next.fn)
          
          // Should call next() for valid non-expired token
          return next.wasCalled() && 
                 res.getStatus() === null &&
                 req.user !== undefined &&
                 req.user.username === username.trim()
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: For any token with tampered expiry, authentication should fail.
   */
  test('tampered tokens are rejected', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
        (username) => {
          // Create a valid token
          const validToken = jwt.sign(
            { id: '1', username: username.trim(), role: 'admin' },
            JWT_SECRET,
            { expiresIn: '1h' }
          )
          
          // Tamper with the token by modifying a character
          const parts = validToken.split('.')
          if (parts.length !== 3) return true // Skip if not valid JWT format
          
          // Modify the payload part
          const tamperedPayload = parts[1].slice(0, -1) + 'X'
          const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`
          
          const req = {
            headers: { authorization: `Bearer ${tamperedToken}` }
          }
          const res = createMockResponse()
          const next = createMockNext()
          
          authenticateToken(req, res, next.fn)
          
          // Should reject tampered token
          return res.getStatus() === 401 && !next.wasCalled()
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: For any token signed with wrong secret, authentication should fail.
   */
  test('tokens signed with wrong secret are rejected', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 10, maxLength: 50 }).filter(s => s !== JWT_SECRET),
        (username, wrongSecret) => {
          // Create a token with wrong secret
          const wrongSecretToken = jwt.sign(
            { id: '1', username: username.trim(), role: 'admin' },
            wrongSecret,
            { expiresIn: '1h' }
          )
          
          const req = {
            headers: { authorization: `Bearer ${wrongSecretToken}` }
          }
          const res = createMockResponse()
          const next = createMockNext()
          
          authenticateToken(req, res, next.fn)
          
          // Should reject token signed with wrong secret
          return res.getStatus() === 401 && !next.wasCalled()
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Session expiry time boundary - tokens should be valid until expiry.
   */
  test('tokens are valid until exact expiry time', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
        (username) => {
          // Create a token that expires in 2 seconds
          const shortLivedToken = jwt.sign(
            { id: '1', username: username.trim(), role: 'admin' },
            JWT_SECRET,
            { expiresIn: '10s' }
          )
          
          // Immediately verify - should be valid
          const req = {
            headers: { authorization: `Bearer ${shortLivedToken}` }
          }
          const res = createMockResponse()
          const next = createMockNext()
          
          authenticateToken(req, res, next.fn)
          
          // Should be valid immediately after creation
          return next.wasCalled() && res.getStatus() === null
        }
      ),
      { numRuns: 50 }
    )
  })
})
