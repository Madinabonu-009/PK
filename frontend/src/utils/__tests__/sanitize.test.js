/**
 * Tests for sanitization utilities
 */

import { describe, it, expect } from 'vitest'
import {
  sanitizeHtml,
  escapeHtml,
  sanitizeUrl,
  sanitizeEmail,
  sanitizePhone,
  sanitizeFilename,
  limitLength
} from '../sanitize'

describe('Sanitization Utilities', () => {
  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>'))
        .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;')
    })

    it('should handle empty string', () => {
      expect(escapeHtml('')).toBe('')
    })

    it('should handle null/undefined', () => {
      expect(escapeHtml(null)).toBe('')
      expect(escapeHtml(undefined)).toBe('')
    })
  })

  describe('sanitizeUrl', () => {
    it('should allow safe URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com')
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com')
    })

    it('should block javascript: protocol', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('')
    })

    it('should block data: protocol', () => {
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('')
    })

    it('should handle empty string', () => {
      expect(sanitizeUrl('')).toBe('')
    })
  })

  describe('sanitizeEmail', () => {
    it('should validate and sanitize valid emails', () => {
      expect(sanitizeEmail('test@example.com')).toBe('test@example.com')
      expect(sanitizeEmail('  TEST@EXAMPLE.COM  ')).toBe('test@example.com')
    })

    it('should reject invalid emails', () => {
      expect(sanitizeEmail('invalid')).toBe('')
      expect(sanitizeEmail('test@')).toBe('')
      expect(sanitizeEmail('@example.com')).toBe('')
    })
  })

  describe('sanitizePhone', () => {
    it('should validate Uzbekistan phone format', () => {
      expect(sanitizePhone('+998901234567')).toBe('+998901234567')
      expect(sanitizePhone('998901234567')).toBe('+998901234567')
    })

    it('should reject invalid phone numbers', () => {
      expect(sanitizePhone('+99890123456')).toBe('') // too short
      expect(sanitizePhone('+9989012345678')).toBe('') // too long
      expect(sanitizePhone('+123456789012')).toBe('') // wrong country code
    })

    it('should handle empty string', () => {
      expect(sanitizePhone('')).toBe('')
    })
  })

  describe('sanitizeFilename', () => {
    it('should remove path separators', () => {
      expect(sanitizeFilename('../../../etc/passwd')).toBe('etcpasswd')
      expect(sanitizeFilename('..\\..\\windows\\system32')).toBe('windowssystem32')
    })

    it('should remove dangerous characters', () => {
      expect(sanitizeFilename('file<>:"|?*.txt')).toBe('file.txt')
    })

    it('should preserve safe filenames', () => {
      expect(sanitizeFilename('document.pdf')).toBe('document.pdf')
      expect(sanitizeFilename('my-file_123.txt')).toBe('my-file_123.txt')
    })
  })

  describe('limitLength', () => {
    it('should limit string length', () => {
      const longString = 'a'.repeat(2000)
      expect(limitLength(longString, 100)).toHaveLength(100)
    })

    it('should not modify short strings', () => {
      expect(limitLength('short', 100)).toBe('short')
    })

    it('should use default max length', () => {
      const longString = 'a'.repeat(2000)
      expect(limitLength(longString)).toHaveLength(1000)
    })
  })
})
