/**
 * Tests for useAsyncEffect hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAsyncEffect } from '../useAsyncEffect'

describe('useAsyncEffect', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should execute async function', async () => {
    const asyncFn = vi.fn().mockResolvedValue('result')

    renderHook(() => useAsyncEffect(asyncFn, []))

    await waitFor(() => {
      expect(asyncFn).toHaveBeenCalledTimes(1)
    })
  })

  it('should pass isMounted check function', async () => {
    let isMountedFn = null
    const asyncFn = vi.fn().mockImplementation((isMounted) => {
      isMountedFn = isMounted
      return Promise.resolve()
    })

    const { unmount } = renderHook(() => useAsyncEffect(asyncFn, []))

    await waitFor(() => {
      expect(isMountedFn).toBeDefined()
      expect(isMountedFn()).toBe(true)
    })

    unmount()
    expect(isMountedFn()).toBe(false)
  })

  it('should re-run when dependencies change', async () => {
    const asyncFn = vi.fn().mockResolvedValue('result')
    let dep = 1

    const { rerender } = renderHook(() => useAsyncEffect(asyncFn, [dep]))

    await waitFor(() => {
      expect(asyncFn).toHaveBeenCalledTimes(1)
    })

    dep = 2
    rerender()

    await waitFor(() => {
      expect(asyncFn).toHaveBeenCalledTimes(2)
    })
  })

  it('should handle errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const asyncFn = vi.fn().mockRejectedValue(new Error('Test error'))

    renderHook(() => useAsyncEffect(asyncFn, []))

    await waitFor(() => {
      expect(asyncFn).toHaveBeenCalled()
    })

    consoleSpy.mockRestore()
  })

  it('should not update state after unmount', async () => {
    let resolvePromise
    const asyncFn = vi.fn().mockImplementation((isMounted) => {
      return new Promise((resolve) => {
        resolvePromise = () => {
          if (isMounted()) {
            resolve('result')
          }
        }
      })
    })

    const { unmount } = renderHook(() => useAsyncEffect(asyncFn, []))

    unmount()
    
    // Should not throw or cause issues
    if (resolvePromise) {
      resolvePromise()
    }
  })
})
