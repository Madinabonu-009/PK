/**
 * Tests for validators utility
 */

import { describe, it, expect } from 'vitest'
import {
  isValidEmail,
  isValidPhone,
  validatePassword,
  isRequired,
  minLength,
  maxLength,
  inRange,
  isPastDate,
  isFutureDate,
  isValidAge,
  isValidUrl,
  createValidator
} from '../validators'

describe('Validators', () => {
  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
      expect(isValidEmail('user+tag@example.org')).toBe(true)
    })

    it('should return false for invalid emails', () => {
      expect(isValidEmail('')).toBe(false)
      expect(isValidEmail(null)).toBe(false)
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('invalid@')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
      expect(isValidEmail('user@.com')).toBe(false)
    })
  })

  describe('isValidPhone', () => {
    it('should return true for valid Uzbekistan phone numbers', () => {
      expect(isValidPhone('998901234567')).toBe(true)
      expect(isValidPhone('+998 90 123 45 67')).toBe(true)
      expect(isValidPhone('901234567')).toBe(true)
    })

    it('should return false for invalid phone numbers', () => {
      expect(isValidPhone('')).toBe(false)
      expect(isValidPhone(null)).toBe(false)
      expect(isValidPhone('12345')).toBe(false)
      expect(isValidPhone('abcdefghij')).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('should validate strong password', () => {
      const result = validatePassword('Password123')
      expect(result.isValid).toBe(true)
      expect(result.score).toBeGreaterThanOrEqual(4)
    })

    it('should reject weak password', () => {
      const result = validatePassword('weak')
      expect(result.isValid).toBe(false)
      expect(result.messages.length).toBeGreaterThan(0)
    })

    it('should require minimum length', () => {
      const result = validatePassword('Pass1')
      expect(result.isValid).toBe(false)
      expect(result.messages).toContain('Parol kamida 8 ta belgidan iborat bo\'lishi kerak')
    })

    it('should require uppercase letter', () => {
      const result = validatePassword('password123')
      expect(result.messages).toContain('Kamida bitta katta harf bo\'lishi kerak')
    })

    it('should require lowercase letter', () => {
      const result = validatePassword('PASSWORD123')
      expect(result.messages).toContain('Kamida bitta kichik harf bo\'lishi kerak')
    })

    it('should require number', () => {
      const result = validatePassword('PasswordABC')
      expect(result.messages).toContain('Kamida bitta raqam bo\'lishi kerak')
    })

    it('should give bonus for special characters', () => {
      const withSpecial = validatePassword('Password123!')
      const withoutSpecial = validatePassword('Password123')
      expect(withSpecial.score).toBeGreaterThan(withoutSpecial.score)
    })
  })

  describe('isRequired', () => {
    it('should return true for non-empty values', () => {
      expect(isRequired('text')).toBe(true)
      expect(isRequired(0)).toBe(true)
      expect(isRequired([1, 2])).toBe(true)
      expect(isRequired({ key: 'value' })).toBe(true)
    })

    it('should return false for empty values', () => {
      expect(isRequired('')).toBe(false)
      expect(isRequired('   ')).toBe(false)
      expect(isRequired(null)).toBe(false)
      expect(isRequired(undefined)).toBe(false)
      expect(isRequired([])).toBe(false)
    })
  })

  describe('minLength', () => {
    it('should validate minimum length', () => {
      expect(minLength('hello', 3)).toBe(true)
      expect(minLength('hello', 5)).toBe(true)
      expect(minLength('hi', 3)).toBe(false)
      expect(minLength('', 1)).toBe(false)
      expect(minLength(null, 1)).toBe(false)
    })
  })

  describe('maxLength', () => {
    it('should validate maximum length', () => {
      expect(maxLength('hi', 5)).toBe(true)
      expect(maxLength('hello', 5)).toBe(true)
      expect(maxLength('hello world', 5)).toBe(false)
      expect(maxLength('', 5)).toBe(true)
      expect(maxLength(null, 5)).toBe(true)
    })
  })

  describe('inRange', () => {
    it('should validate number range', () => {
      expect(inRange(5, 1, 10)).toBe(true)
      expect(inRange(1, 1, 10)).toBe(true)
      expect(inRange(10, 1, 10)).toBe(true)
      expect(inRange(0, 1, 10)).toBe(false)
      expect(inRange(11, 1, 10)).toBe(false)
      expect(inRange('5', 1, 10)).toBe(true)
      expect(inRange('abc', 1, 10)).toBe(false)
    })
  })

  describe('isPastDate', () => {
    it('should validate past dates', () => {
      expect(isPastDate('2020-01-01')).toBe(true)
      expect(isPastDate(new Date(2020, 0, 1))).toBe(true)
      expect(isPastDate('2099-01-01')).toBe(false)
      expect(isPastDate(null)).toBe(false)
    })
  })

  describe('isFutureDate', () => {
    it('should validate future dates', () => {
      expect(isFutureDate('2099-01-01')).toBe(true)
      expect(isFutureDate('2020-01-01')).toBe(false)
      expect(isFutureDate(null)).toBe(false)
    })
  })

  describe('isValidAge', () => {
    it('should validate age for kindergarten children', () => {
      const threeYearsAgo = new Date()
      threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3)
      
      expect(isValidAge(threeYearsAgo)).toBe(true)
    })

    it('should reject too young children', () => {
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      
      expect(isValidAge(sixMonthsAgo)).toBe(false)
    })

    it('should reject too old children', () => {
      const tenYearsAgo = new Date()
      tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10)
      
      expect(isValidAge(tenYearsAgo)).toBe(false)
    })

    it('should accept custom age range', () => {
      const fiveYearsAgo = new Date()
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5)
      
      expect(isValidAge(fiveYearsAgo, 3, 10)).toBe(true)
    })
  })

  describe('isValidUrl', () => {
    it('should validate URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://localhost:3000')).toBe(true)
      expect(isValidUrl('ftp://files.example.com')).toBe(true)
      expect(isValidUrl('invalid')).toBe(false)
      expect(isValidUrl('')).toBe(false)
      expect(isValidUrl(null)).toBe(false)
    })
  })

  describe('createValidator', () => {
    it('should create validator from rules', () => {
      const validate = createValidator({
        email: [
          { required: true, message: 'Email kiritilishi shart' },
          { email: true, message: 'Email formati noto\'g\'ri' }
        ],
        password: [
          { required: true },
          { minLength: 8, message: 'Kamida 8 ta belgi' }
        ]
      })

      const errors = validate({ email: '', password: 'short' })
      
      expect(errors.email).toBe('Email kiritilishi shart')
      expect(errors.password).toBe('Kamida 8 ta belgi')
    })

    it('should return empty object for valid data', () => {
      const validate = createValidator({
        name: [{ required: true }]
      })

      const errors = validate({ name: 'John' })
      
      expect(Object.keys(errors).length).toBe(0)
    })

    it('should support custom validation', () => {
      const validate = createValidator({
        confirmPassword: [
          {
            custom: (value, values) => value === values.password,
            message: 'Parollar mos kelmadi'
          }
        ]
      })

      const errors = validate({ password: 'test123', confirmPassword: 'different' })
      
      expect(errors.confirmPassword).toBe('Parollar mos kelmadi')
    })
  })
})
