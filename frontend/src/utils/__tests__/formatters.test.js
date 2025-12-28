/**
 * Tests for formatters utility
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  formatDate,
  formatDateShort,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  formatNumber,
  formatCurrency,
  formatPhone,
  formatFileSize,
  formatPercentage,
  truncateText,
  capitalize,
  formatName,
  formatAge,
  formatDuration
} from '../formatters'

describe('Formatters', () => {
  describe('formatDateShort', () => {
    it('should format date as DD.MM.YYYY', () => {
      expect(formatDateShort('2024-12-19')).toBe('19.12.2024')
      expect(formatDateShort(new Date(2024, 0, 15))).toBe('15.01.2024')
    })

    it('should return empty string for invalid input', () => {
      expect(formatDateShort('')).toBe('')
      expect(formatDateShort(null)).toBe('')
    })
  })

  describe('formatTime', () => {
    it('should format time as HH:MM', () => {
      const date = new Date(2024, 0, 1, 14, 30)
      expect(formatTime(date)).toBe('14:30')
    })

    it('should pad single digits', () => {
      const date = new Date(2024, 0, 1, 9, 5)
      expect(formatTime(date)).toBe('09:05')
    })
  })

  describe('formatDateTime', () => {
    it('should format date and time', () => {
      const date = new Date(2024, 11, 19, 14, 30)
      expect(formatDateTime(date)).toBe('19.12.2024 14:30')
    })
  })

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2024, 11, 19, 12, 0, 0))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should format recent time as "hozirgina"', () => {
      const now = new Date()
      expect(formatRelativeTime(now)).toBe('hozirgina')
    })

    it('should format minutes ago', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 daqiqa oldin')
    })

    it('should format hours ago', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
      expect(formatRelativeTime(twoHoursAgo)).toBe('2 soat oldin')
    })

    it('should format days ago', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      expect(formatRelativeTime(threeDaysAgo)).toBe('3 kun oldin')
    })
  })

  describe('formatNumber', () => {
    it('should format numbers with separators', () => {
      expect(formatNumber(1000)).toMatch(/1.?000/)
      expect(formatNumber(1000000)).toMatch(/1.?000.?000/)
    })

    it('should return empty string for invalid input', () => {
      expect(formatNumber(null)).toBe('')
      expect(formatNumber(undefined)).toBe('')
    })
  })

  describe('formatCurrency', () => {
    it('should format currency', () => {
      const result = formatCurrency(1000000)
      expect(result).toContain('1')
      expect(result).toContain('000')
    })

    it('should handle different currencies', () => {
      const usd = formatCurrency(100, 'USD', 'en-US')
      expect(usd).toContain('$')
    })
  })

  describe('formatPhone', () => {
    it('should format Uzbekistan phone numbers', () => {
      expect(formatPhone('998901234567')).toBe('+998 90 123 45 67')
      expect(formatPhone('901234567')).toBe('+998 90 123 45 67')
    })

    it('should return original for unrecognized format', () => {
      expect(formatPhone('12345')).toBe('12345')
    })

    it('should return empty string for empty input', () => {
      expect(formatPhone('')).toBe('')
      expect(formatPhone(null)).toBe('')
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(500)).toBe('500.00 B')
    })

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1.00 KB')
      expect(formatFileSize(2048)).toBe('2.00 KB')
    })

    it('should format megabytes', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.00 MB')
    })

    it('should format gigabytes', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.00 GB')
    })

    it('should return 0 B for zero or invalid', () => {
      expect(formatFileSize(0)).toBe('0 B')
      expect(formatFileSize(null)).toBe('0 B')
    })
  })

  describe('formatPercentage', () => {
    it('should calculate and format percentage', () => {
      expect(formatPercentage(25, 100)).toBe('25.0%')
      expect(formatPercentage(1, 3)).toBe('33.3%')
    })

    it('should handle zero total', () => {
      expect(formatPercentage(10, 0)).toBe('0%')
    })

    it('should support custom decimals', () => {
      expect(formatPercentage(1, 3, 2)).toBe('33.33%')
    })
  })

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const longText = 'This is a very long text that should be truncated'
      expect(truncateText(longText, 20)).toBe('This is a very long...')
    })

    it('should not truncate short text', () => {
      expect(truncateText('Short', 20)).toBe('Short')
    })

    it('should return empty string for empty input', () => {
      expect(truncateText('')).toBe('')
      expect(truncateText(null)).toBe('')
    })
  })

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello')
      expect(capitalize('HELLO')).toBe('Hello')
      expect(capitalize('hELLO')).toBe('Hello')
    })

    it('should return empty string for empty input', () => {
      expect(capitalize('')).toBe('')
      expect(capitalize(null)).toBe('')
    })
  })

  describe('formatName', () => {
    it('should format full name', () => {
      expect(formatName({ firstName: 'John', lastName: 'Doe' })).toBe('John Doe')
    })

    it('should handle missing parts', () => {
      expect(formatName({ firstName: 'John' })).toBe('John')
      expect(formatName({ lastName: 'Doe' })).toBe('Doe')
      expect(formatName({ name: 'John Doe' })).toBe('John Doe')
    })

    it('should return empty string for empty input', () => {
      expect(formatName(null)).toBe('')
      expect(formatName({})).toBe('')
    })
  })

  describe('formatAge', () => {
    it('should format age in years', () => {
      const threeYearsAgo = new Date()
      threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3)
      
      expect(formatAge(threeYearsAgo)).toContain('3 yosh')
    })

    it('should format age in months for babies', () => {
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      
      expect(formatAge(sixMonthsAgo)).toContain('oy')
    })

    it('should return empty string for empty input', () => {
      expect(formatAge(null)).toBe('')
    })
  })

  describe('formatDuration', () => {
    it('should format minutes', () => {
      expect(formatDuration(30)).toBe('30 daqiqa')
    })

    it('should format hours', () => {
      expect(formatDuration(60)).toBe('1 soat')
      expect(formatDuration(120)).toBe('2 soat')
    })

    it('should format hours and minutes', () => {
      expect(formatDuration(90)).toBe('1 soat 30 daqiqa')
    })

    it('should return 0 daqiqa for zero', () => {
      expect(formatDuration(0)).toBe('0 daqiqa')
    })
  })
})
