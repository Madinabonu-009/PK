/**
 * Custom fetch hook with automatic cleanup and error handling
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import api from '../services/api'

/**
 * useFetch - Fetch data with loading, error states and cleanup
 */
export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const isMountedRef = useRef(true)
  const abortControllerRef = useRef(null)
  
  const {
    method = 'GET',
    body = null,
    dependencies = [],
    skip = false,
    onSuccess = null,
    onError = null
  } = options
  
  const fetchData = useCallback(async () => {
    if (skip) return
    
    // Create new abort controller
    abortControllerRef.current = new AbortController()
    
    try {
      if (isMountedRef.current) {
        setLoading(true)
        setError(null)
      }
      
      const config = {
        method,
        signal: abortControllerRef.current.signal
      }
      
      if (body) {
        config.data = body
      }
      
      const response = await api({
        url,
        ...config
      })
      
      if (isMountedRef.current) {
        setData(response.data)
        setLoading(false)
        
        if (onSuccess) {
          onSuccess(response.data)
        }
      }
    } catch (err) {
      // Ignore abort errors
      if (err.name === 'AbortError' || err.name === 'CanceledError') {
        return
      }
      
      if (isMountedRef.current) {
        setError(err.response?.data?.error || err.message || 'An error occurred')
        setLoading(false)
        
        if (onError) {
          onError(err)
        }
      }
    }
  }, [url, method, body, skip, onSuccess, onError, ...dependencies])
  
  useEffect(() => {
    isMountedRef.current = true
    fetchData()
    
    return () => {
      isMountedRef.current = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchData])
  
  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])
  
  return { data, loading, error, refetch }
}

/**
 * useApi - More flexible API hook
 */
export const useApi = (initialUrl = null) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const isMountedRef = useRef(true)
  const abortControllerRef = useRef(null)
  
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])
  
  const execute = useCallback(async (url, options = {}) => {
    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    abortControllerRef.current = new AbortController()
    
    try {
      if (isMountedRef.current) {
        setLoading(true)
        setError(null)
      }
      
      const response = await api({
        url: url || initialUrl,
        signal: abortControllerRef.current.signal,
        ...options
      })
      
      if (isMountedRef.current) {
        setData(response.data)
        setLoading(false)
      }
      
      return { data: response.data, error: null }
    } catch (err) {
      if (err.name === 'AbortError' || err.name === 'CanceledError') {
        return { data: null, error: null }
      }
      
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred'
      
      if (isMountedRef.current) {
        setError(errorMessage)
        setLoading(false)
      }
      
      return { data: null, error: errorMessage }
    }
  }, [initialUrl])
  
  const reset = useCallback(() => {
    if (isMountedRef.current) {
      setData(null)
      setError(null)
      setLoading(false)
    }
  }, [])
  
  return { data, loading, error, execute, reset }
}

/**
 * useLazyFetch - Fetch only when triggered
 */
export const useLazyFetch = () => {
  return useApi()
}

export default useFetch
