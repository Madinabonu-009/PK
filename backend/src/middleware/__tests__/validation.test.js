/**
 * Tests for validation middleware
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals'

// Mock Joi
const mockValidate = jest.fn()
const mockJoi = {
  object: jest.fn(() => ({
    validate: mockValidate
  })),
  string: jest.fn(() => ({
    required: jest.fn().mockReturnThis(),
    email: jest.fn().mockReturnThis(),
    min: jest.fn().mockReturnThis(),
    max: jest.fn().mockReturnThis()
  })),
  number: jest.fn(() => ({
    required: jest.fn().mockReturnThis(),
    min: jest.fn().mockReturnThis(),
    max: jest.fn().mockReturnThis()
  }))
}

jest.unstable_mockModule('joi', () => ({
  default: mockJoi
}))

describe('Validation Middleware', () => {
  let validateRequest
  let req, res, next

  beforeEach(async () => {
    jest.clearAllMocks()
    
    req = {
      body: {},
      query: {},
      params: {}
    }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }
    next = jest.fn()

    // Dynamic import after mocking
    const validationModule = await import('../validation.js')
    validateRequest = validationModule.validateRequest
  })

  it('should call next() when validation passes', async () => {
    const schema = { validate: jest.fn().mockReturnValue({ error: null, value: { name: 'Test' } }) }
    
    req.body = { name: 'Test' }

    const middleware = validateRequest(schema)
    await middleware(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('should return 400 when validation fails', async () => {
    const schema = {
      validate: jest.fn().mockReturnValue({
        error: {
          details: [{ message: 'Name is required' }]
        },
        value: null
      })
    }

    const middleware = validateRequest(schema)
    await middleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.any(String)
      })
    )
    expect(next).not.toHaveBeenCalled()
  })

  it('should validate request body by default', async () => {
    const schema = { validate: jest.fn().mockReturnValue({ error: null, value: {} }) }
    
    req.body = { test: 'value' }

    const middleware = validateRequest(schema)
    await middleware(req, res, next)

    expect(schema.validate).toHaveBeenCalledWith(
      req.body,
      expect.any(Object)
    )
  })

  it('should validate query params when specified', async () => {
    const schema = { validate: jest.fn().mockReturnValue({ error: null, value: {} }) }
    
    req.query = { page: '1' }

    const middleware = validateRequest(schema, 'query')
    await middleware(req, res, next)

    expect(schema.validate).toHaveBeenCalledWith(
      req.query,
      expect.any(Object)
    )
  })

  it('should validate route params when specified', async () => {
    const schema = { validate: jest.fn().mockReturnValue({ error: null, value: {} }) }
    
    req.params = { id: '123' }

    const middleware = validateRequest(schema, 'params')
    await middleware(req, res, next)

    expect(schema.validate).toHaveBeenCalledWith(
      req.params,
      expect.any(Object)
    )
  })

  it('should strip unknown fields by default', async () => {
    const schema = {
      validate: jest.fn().mockReturnValue({
        error: null,
        value: { name: 'Test' }
      })
    }

    req.body = { name: 'Test', unknown: 'field' }

    const middleware = validateRequest(schema)
    await middleware(req, res, next)

    expect(schema.validate).toHaveBeenCalledWith(
      req.body,
      expect.objectContaining({
        stripUnknown: true
      })
    )
  })
})
