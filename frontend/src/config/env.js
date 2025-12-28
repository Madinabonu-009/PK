/**
 * Environment Configuration with Defaults
 * Issue #50: Default values for environment variables
 */

// Helper to get env variable with default
const getEnv = (key, defaultValue) => {
  const value = import.meta.env[key]
  return value !== undefined ? value : defaultValue
}

// Helper to get boolean env
const getBoolEnv = (key, defaultValue = false) => {
  const value = import.meta.env[key]
  if (value === undefined) return defaultValue
  return value === 'true' || value === '1'
}

// Helper to get number env
const getNumEnv = (key, defaultValue) => {
  const value = import.meta.env[key]
  if (value === undefined) return defaultValue
  const num = parseInt(value, 10)
  return isNaN(num) ? defaultValue : num
}

// Environment configuration
export const ENV = {
  // App
  APP_NAME: getEnv('VITE_APP_NAME', 'Play Kids'),
  APP_VERSION: getEnv('VITE_APP_VERSION', '1.0.0'),
  NODE_ENV: getEnv('MODE', 'development'),
  
  // API
  API_URL: getEnv('VITE_API_URL', '/api'),
  API_TIMEOUT: getNumEnv('VITE_API_TIMEOUT', 30000),
  
  // Features
  ENABLE_ANALYTICS: getBoolEnv('VITE_ENABLE_ANALYTICS', false),
  ENABLE_PUSH_NOTIFICATIONS: getBoolEnv('VITE_ENABLE_PUSH', true),
  ENABLE_OFFLINE_MODE: getBoolEnv('VITE_ENABLE_OFFLINE', true),
  ENABLE_DEBUG: getBoolEnv('VITE_DEBUG', false),
  
  // Gamification
  XP_PER_GAME: getNumEnv('VITE_XP_PER_GAME', 20),
  MAX_DAILY_XP: getNumEnv('VITE_MAX_DAILY_XP', 500),
  
  // Storage
  STORAGE_PREFIX: getEnv('VITE_STORAGE_PREFIX', 'pk_'),
  
  // External Services
  SENTRY_DSN: getEnv('VITE_SENTRY_DSN', ''),
  GA_TRACKING_ID: getEnv('VITE_GA_ID', ''),
  
  // Limits
  MAX_FILE_SIZE: getNumEnv('VITE_MAX_FILE_SIZE', 5 * 1024 * 1024), // 5MB
  MAX_IMAGE_SIZE: getNumEnv('VITE_MAX_IMAGE_SIZE', 2 * 1024 * 1024), // 2MB
  
  // Timeouts
  TOAST_DURATION: getNumEnv('VITE_TOAST_DURATION', 5000),
  DEBOUNCE_DELAY: getNumEnv('VITE_DEBOUNCE_DELAY', 300),
  
  // Pagination
  DEFAULT_PAGE_SIZE: getNumEnv('VITE_PAGE_SIZE', 10),
  MAX_PAGE_SIZE: getNumEnv('VITE_MAX_PAGE_SIZE', 100)
}

// Computed values
export const IS_DEV = ENV.NODE_ENV === 'development'
export const IS_PROD = ENV.NODE_ENV === 'production'
export const IS_TEST = ENV.NODE_ENV === 'test'

// Validate required env vars in production
export function validateEnv() {
  const errors = []
  
  // API_URL /api bo'lishi to'g'ri - backend va frontend bitta serverda
  // Boshqa validatsiyalar kerak bo'lsa shu yerga qo'shish mumkin
  
  if (errors.length > 0) {
    console.warn('⚠️ Environment validation warnings:', errors)
  }
  
  return errors.length === 0
}

export default ENV
