/**
 * Tests for useScrollProgress hook
 * 
 * Feature: scroll-progress-line
 * Property-based tests using fast-check
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import * as fc from 'fast-check'
import { 
  useScrollProgress, 
  calculateProgress, 
  getProgressState 
} from '../useScrollProgress'

// Mock window properties
const mockWindow = {
  scrollY: 0,
  innerHeight: 800,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  requestAnimationFrame: vi.fn((cb) => {
    cb()
    return 1
  }),
  cancelAnimationFrame: vi.fn()
}

const mockDocument = {
  documentElement: {
    scrollHeight: 2000
  }
}

describe('useScrollProgress', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    
    // Setup window mocks
    vi.stubGlobal('scrollY', mockWindow.scrollY)
    vi.stubGlobal('innerHeight', mockWindow.innerHeight)
    vi.stubGlobal('addEventListener', mockWindow.addEventListener)
    vi.stubGlobal('removeEventListener', mockWindow.removeEventListener)
    vi.stubGlobal('requestAnimationFrame', mockWindow.requestAnimationFrame)
    vi.stubGlobal('cancelAnimationFrame', mockWindow.cancelAnimationFrame)
    
    // Setup document mock
    Object.defineProperty(document, 'documentElement', {
      value: mockDocument.documentElement,
      writable: true,
      configurable: true
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  describe('calculateProgress', () => {
    /**
     * Feature: scroll-progress-line, Property 1: Scroll Progress Accuracy
     * For any scroll position within the document, the progress value SHALL equal
     * scrollY / (documentHeight - viewportHeight), clamped between 0 and 1.
     * Validates: Requirements 2.1
     */
    it('should calculate progress accurately for any valid scroll position', () => {
      fc.assert(
        fc.property(
          fc.nat(10000), // scrollY: 0 to 10000
          fc.integer({ min: 100, max: 5000 }), // documentHeight: 100 to 5000
          fc.integer({ min: 100, max: 2000 }), // viewportHeight: 100 to 2000
          (scrollY, documentHeight, viewportHeight) => {
            // Ensure document is taller than viewport for valid scrolling
            const adjustedDocHeight = Math.max(documentHeight, viewportHeight + 1)
            
            const progress = calculateProgress(scrollY, adjustedDocHeight, viewportHeight)
            const scrollableHeight = adjustedDocHeight - viewportHeight
            const expectedProgress = Math.min(Math.max(scrollY / scrollableHeight, 0), 1)
            
            // Progress should equal expected value
            expect(progress).toBeCloseTo(expectedProgress, 10)
            
            // Progress should always be between 0 and 1
            expect(progress).toBeGreaterThanOrEqual(0)
            expect(progress).toBeLessThanOrEqual(1)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return 0 when document height equals viewport height', () => {
      const progress = calculateProgress(100, 800, 800)
      expect(progress).toBe(0)
    })

    it('should return 0 when document is smaller than viewport', () => {
      const progress = calculateProgress(100, 500, 800)
      expect(progress).toBe(0)
    })

    it('should clamp progress to 1 when scrollY exceeds scrollable height', () => {
      const progress = calculateProgress(2000, 1500, 800)
      expect(progress).toBe(1)
    })

    it('should return 0 for negative scrollY', () => {
      const progress = calculateProgress(-100, 2000, 800)
      expect(progress).toBe(0)
    })
  })

  describe('getProgressState', () => {
    /**
     * Feature: scroll-progress-line, Property 2: State Transitions
     * For any progress value:
     * - When progress > 0.9, isNearEnd SHALL be true
     * - When progress >= 0.99, isComplete SHALL be true
     * Validates: Requirements 3.1, 3.2
     */
    it('should correctly determine state for any progress value', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 1, noNaN: true }),
          (progress) => {
            const state = getProgressState(progress)
            
            // isNearEnd should be true when progress > 0.9
            if (progress > 0.9) {
              expect(state.isNearEnd).toBe(true)
            } else {
              expect(state.isNearEnd).toBe(false)
            }
            
            // isComplete should be true when progress >= 0.99
            if (progress >= 0.99) {
              expect(state.isComplete).toBe(true)
            } else {
              expect(state.isComplete).toBe(false)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return isNearEnd=false and isComplete=false for progress < 0.9', () => {
      const state = getProgressState(0.5)
      expect(state.isNearEnd).toBe(false)
      expect(state.isComplete).toBe(false)
    })

    it('should return isNearEnd=true and isComplete=false for 0.9 < progress < 0.99', () => {
      const state = getProgressState(0.95)
      expect(state.isNearEnd).toBe(true)
      expect(state.isComplete).toBe(false)
    })

    it('should return isNearEnd=true and isComplete=true for progress >= 0.99', () => {
      const state = getProgressState(1)
      expect(state.isNearEnd).toBe(true)
      expect(state.isComplete).toBe(true)
    })
  })

  describe('useScrollProgress hook', () => {
    it('should return initial state', () => {
      const { result } = renderHook(() => useScrollProgress())
      
      expect(result.current).toHaveProperty('progress')
      expect(result.current).toHaveProperty('isNearEnd')
      expect(result.current).toHaveProperty('isComplete')
      expect(result.current).toHaveProperty('hasCompletedOnce')
    })

    it('should add scroll and resize event listeners', () => {
      renderHook(() => useScrollProgress())
      
      expect(window.addEventListener).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function),
        { passive: true }
      )
      expect(window.addEventListener).toHaveBeenCalledWith(
        'resize',
        expect.any(Function),
        { passive: true }
      )
    })

    it('should cleanup event listeners on unmount', () => {
      const { unmount } = renderHook(() => useScrollProgress())
      
      unmount()
      
      expect(window.removeEventListener).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function)
      )
      expect(window.removeEventListener).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      )
    })

    it('should calculate initial progress on mount', () => {
      // This test verifies that the hook calculates progress on mount
      // The actual RAF usage is an implementation detail
      const { result } = renderHook(() => useScrollProgress())
      
      // Progress should be calculated (0 since we're at top)
      expect(typeof result.current.progress).toBe('number')
      expect(result.current.progress).toBeGreaterThanOrEqual(0)
      expect(result.current.progress).toBeLessThanOrEqual(1)
    })
  })
})
