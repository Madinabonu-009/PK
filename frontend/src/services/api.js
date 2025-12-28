/**
 * API Service - Improved with caching, better error handling
 * Issues Fixed: #3, #5, #10, #14
 */

import axios from 'axios'
import secureStorage from '../utils/secureStorage'
import { API_CONFIG, STORAGE_KEYS, ERROR_MESSAGES } from '../constants'

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: { 'Content-Type': 'application/json' }
})

// Simple in-memory cache
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

const getCacheKey = (config) => `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`

const getFromCache = (key) => {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  cache.delete(key)
  return null
}

const setCache = (key, data) => {
  // Limit cache size
  if (cache.size > 100) {
    const firstKey = cache.keys().next().value
    cache.delete(firstKey)
  }
  cache.set(key, { data, timestamp: Date.now() })
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token
    const token = secureStorage.getItem(STORAGE_KEYS.TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add request ID
    config.headers['X-Request-ID'] = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Check cache for GET requests
    if (config.method === 'get' && !config.skipCache) {
      const cacheKey = getCacheKey(config)
      const cached = getFromCache(cacheKey)
      if (cached) {
        config.adapter = () => Promise.resolve({
          data: cached,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
          cached: true
        })
      }
    }

    config.metadata = { startTime: Date.now() }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor with improved retry logic
api.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (response.config.method === 'get' && !response.cached && !response.config.skipCache) {
      const cacheKey = getCacheKey(response.config)
      setCache(cacheKey, response.data)
    }
    return response
  },
  async (error) => {
    const config = error.config
    config._retryCount = config._retryCount || 0

    if (error.response) {
      const { status } = error.response

      // Handle 401 - Token expired
      if (status === 401) {
        // Try to refresh token first
        if (!config._isRetry && config.url !== '/auth/refresh') {
          config._isRetry = true
          try {
            const refreshToken = secureStorage.getItem('refreshToken')
            if (refreshToken) {
              const refreshResponse = await api.post('/auth/refresh', { refreshToken })
              if (refreshResponse.data.token) {
                secureStorage.setItem(STORAGE_KEYS.TOKEN, refreshResponse.data.token)
                config.headers.Authorization = `Bearer ${refreshResponse.data.token}`
                return api(config)
              }
            }
          } catch {
            // Refresh failed, logout
            secureStorage.removeItem(STORAGE_KEYS.TOKEN)
            secureStorage.removeItem('refreshToken')
            secureStorage.removeItem(STORAGE_KEYS.USER)
            // Faqat admin sahifalarida login ga yo'naltirish
            if (window.location.pathname.startsWith('/admin') && !window.location.pathname.includes('/login')) {
              window.location.href = '/admin/login'
            }
          }
        }
      }

      // Retry on server errors (only for idempotent requests)
      const isIdempotent = ['get', 'head', 'options', 'put', 'delete'].includes(config.method)
      if ([500, 502, 503, 504].includes(status) && isIdempotent && config._retryCount < API_CONFIG.MAX_RETRIES) {
        config._retryCount++
        const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, config._retryCount - 1)
        await new Promise(resolve => setTimeout(resolve, delay))
        return api(config)
      }

      // Rate limiting - wait and retry
      if (status === 429 && config._retryCount < API_CONFIG.MAX_RETRIES) {
        config._retryCount++
        const retryAfter = error.response.headers['retry-after'] || 5
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
        return api(config)
      }
    } else if (error.request && config._retryCount < API_CONFIG.MAX_RETRIES) {
      // Network error - retry
      config._retryCount++
      const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, config._retryCount - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
      return api(config)
    }

    return Promise.reject(error)
  }
)

// Clear cache utility
export const clearCache = (pattern = null) => {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key)
      }
    }
  } else {
    cache.clear()
  }
}

// API methods
export const apiService = {
  get: (url, config = {}) => api.get(url, config),
  post: (url, data, config = {}) => api.post(url, data, config),
  put: (url, data, config = {}) => api.put(url, data, config),
  patch: (url, data, config = {}) => api.patch(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),
  
  upload: (url, file, onProgress) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      skipCache: true,
      onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / e.total))
    })
  }
}

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => { clearCache(); return api.post('/auth/logout') },
  me: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
  updateProfile: (updates) => api.put('/auth/profile', updates)
}

// Children API
export const childrenAPI = {
  getAll: (params) => api.get('/children', { params }),
  getById: (id) => api.get(`/children/${id}`),
  create: (data) => { clearCache('children'); return api.post('/children', data) },
  update: (id, data) => { clearCache('children'); return api.put(`/children/${id}`, data) },
  delete: (id) => { clearCache('children'); return api.delete(`/children/${id}`) },
  getProgress: (id) => api.get(`/children/${id}/progress`),
  getAttendance: (id, params) => api.get(`/children/${id}/attendance`, { params })
}

// Groups API
export const groupsAPI = {
  getAll: () => api.get('/groups'),
  getById: (id) => api.get(`/groups/${id}`),
  create: (data) => { clearCache('groups'); return api.post('/groups', data) },
  update: (id, data) => { clearCache('groups'); return api.put(`/groups/${id}`, data) },
  delete: (id) => { clearCache('groups'); return api.delete(`/groups/${id}`) }
}

// Payments API
export const paymentsAPI = {
  getAll: (params) => api.get('/payments', { params }),
  getById: (id) => api.get(`/payments/${id}`),
  create: (data) => { clearCache('payments'); return api.post('/payments', data) },
  getStats: () => api.get('/payments/stats'),
  getConfig: () => api.get('/payments/config')
}

// Menu API
export const menuAPI = {
  getAll: (params) => api.get('/menu', { params }),
  getByDate: (date) => api.get(`/menu/date/${date}`),
  create: (data) => { clearCache('menu'); return api.post('/menu', data) },
  update: (id, data) => { clearCache('menu'); return api.put(`/menu/${id}`, data) },
  delete: (id) => { clearCache('menu'); return api.delete(`/menu/${id}`) }
}

// Game Progress API
export const gameProgressAPI = {
  getProgress: (childId) => api.get(`/game-progress/${childId}`),
  getStats: (childId) => api.get(`/game-progress/${childId}/stats`),
  saveSession: (data) => api.post('/game-progress/session', data),
  getRecommendations: (childId) => api.get(`/game-progress/${childId}/recommendations`)
}

// Health API
export const healthAPI = {
  check: () => api.get('/health', { skipCache: true }),
  detailed: () => api.get('/health/detailed', { skipCache: true })
}

export default api
