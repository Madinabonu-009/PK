/**
 * Tests for useFetch hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useFetch } from '../useFetch'

// Mock fetch
global.fetch = vi.fn()

describe('useFetch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return initial state', () => {
    global.fetch.mockImplementation(() => new Promise(() => {}))

    const { result } = renderHook(() => useFetch('/api/test'))

    expect(result.current.data).toBeNull()
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it('should fetch data successfully', async () => {
    const mockData = { id: 1, name: 'Test' }
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData)
    })

    const { result } = renderHook(() => useFetch('/api/test'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)
    expect(result.current.error).toBeNull()
  })

  it('should handle fetch error', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    })

    const { result } = renderHook(() => useFetch('/api/test'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeTruthy()
  })

  it('should handle network error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useFetch('/api/test'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBeNull()
    expect(result.current.error).toBe('Network error')
  })

  it('should refetch when URL changes', async () => {
    const mockData1 = { id: 1 }
    const mockData2 = { id: 2 }

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData1)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData2)
      })

    const { result, rerender } = renderHook(
      ({ url }) => useFetch(url),
      { initialProps: { url: '/api/test1' } }
    )

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData1)
    })

    rerender({ url: '/api/test2' })

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData2)
    })

    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('should provide refetch function', async () => {
    const mockData = { id: 1 }
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData)
    })

    const { result } = renderHook(() => useFetch('/api/test'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.refetch).toBeDefined()
    expect(typeof result.current.refetch).toBe('function')

    await act(async () => {
      await result.current.refetch()
    })

    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('should skip fetch when skip option is true', () => {
    const { result } = renderHook(() => useFetch('/api/test', { skip: true }))

    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBeNull()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('should abort fetch on unmount', async () => {
    let abortSignal = null
    global.fetch.mockImplementation((url, options) => {
      abortSignal = options?.signal
      return new Promise(() => {})
    })

    const { unmount } = renderHook(() => useFetch('/api/test'))

    unmount()

    expect(abortSignal?.aborted).toBe(true)
  })
})
