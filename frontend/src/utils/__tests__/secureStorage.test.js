/**
 * Tests for secure storage
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import secureStorage from '../secureStorage'

describe('SecureStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('getItem and setItem', () => {
    it('should store and retrieve items', () => {
      secureStorage.setItem('test', 'value')
      expect(secureStorage.getItem('test')).toBe('value')
    })

    it('should return null for non-existent items', () => {
      expect(secureStorage.getItem('nonexistent')).toBeNull()
    })

    it('should handle localStorage errors gracefully', () => {
      localStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })

      const result = secureStorage.setItem('test', 'value')
      expect(result).toBe(false)
    })
  })

  describe('removeItem', () => {
    it('should remove items', () => {
      secureStorage.setItem('test', 'value')
      secureStorage.removeItem('test')
      expect(secureStorage.getItem('test')).toBeNull()
    })
  })

  describe('clear', () => {
    it('should clear all items', () => {
      secureStorage.setItem('test1', 'value1')
      secureStorage.setItem('test2', 'value2')
      secureStorage.clear()
      expect(secureStorage.getItem('test1')).toBeNull()
      expect(secureStorage.getItem('test2')).toBeNull()
    })
  })

  describe('secure items', () => {
    it('should encode secure items', () => {
      secureStorage.setSecureItem('token', 'secret123')
      const stored = localStorage.getItem('token')
      expect(stored).not.toBe('secret123')
    })

    it('should decode secure items', () => {
      secureStorage.setSecureItem('token', 'secret123')
      expect(secureStorage.getSecureItem('token')).toBe('secret123')
    })
  })
})
