/**
 * Backend Environment Configuration with Defaults
 * Issue #50: Default values for environment variables
 */

import dotenv from 'dotenv'

// Load .env file
dotenv.config()

// Helper to get env variable with default
const getEnv = (key, defaultValue) => {
  return process.env[key] || defaultValue
}

// Helper to get boolean env
const getBoolEnv = (key, defaultValue = false) => {
  const value = process.env[key]
  if (value === undefined) return defaultValue
  return value === 'true' || value === '1'
}

// Helper to get number env
const getNumEnv = (key, defaultValue) => {
  const value = process.env[key]
  if (value === undefined) return defaultValue
  const num = parseInt(value, 10)
  return isNaN(num) ? defaultValue : num
}

// Environment configuration
export const ENV = {
  // Server
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  PORT: getNumEnv('PORT', 5000),
  HOST: getEnv('HOST', '0.0.0.0'),
  
  // Database
  MONGODB_URI: getEnv('MONGODB_URI', 'mongodb://localhost:27017/play-kids'),
  DB_NAME: getEnv('DB_NAME', 'play-kids'),
  
  // JWT
  JWT_SECRET: getEnv('JWT_SECRET', 'your-super-secret-key-change-in-production'),
  JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN', '7d'),
  JWT_REFRESH_EXPIRES_IN: getEnv('JWT_REFRESH_EXPIRES_IN', '30d'),
  
  // CORS
  CORS_ORIGIN: getEnv('CORS_ORIGIN', 'http://localhost:5173'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: getNumEnv('RATE_LIMIT_WINDOW', 15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX: getNumEnv('RATE_LIMIT_MAX', 100),
  
  // File Upload
  MAX_FILE_SIZE: getNumEnv('MAX_FILE_SIZE', 5 * 1024 * 1024), // 5MB
  UPLOAD_DIR: getEnv('UPLOAD_DIR', 'uploads'),
  
  // Email (optional)
  SMTP_HOST: getEnv('SMTP_HOST', ''),
  SMTP_PORT: getNumEnv('SMTP_PORT', 587),
  SMTP_USER: getEnv('SMTP_USER', ''),
  SMTP_PASS: getEnv('SMTP_PASS', ''),
  EMAIL_FROM: getEnv('EMAIL_FROM', 'noreply@playkids.uz'),
  
  // Logging
  LOG_LEVEL: getEnv('LOG_LEVEL', 'info'),
  LOG_FILE: getEnv('LOG_FILE', 'logs/app.log'),
  
  // Security
  BCRYPT_ROUNDS: getNumEnv('BCRYPT_ROUNDS', 12),
  SESSION_SECRET: getEnv('SESSION_SECRET', 'session-secret-change-in-production'),
  
  // Features
  ENABLE_SWAGGER: getBoolEnv('ENABLE_SWAGGER', true),
  ENABLE_MORGAN: getBoolEnv('ENABLE_MORGAN', true)
}

// Computed values
export const IS_DEV = ENV.NODE_ENV === 'development'
export const IS_PROD = ENV.NODE_ENV === 'production'
export const IS_TEST = ENV.NODE_ENV === 'test'

// Validate required env vars
export function validateEnv() {
  const errors = []
  
  if (IS_PROD) {
    if (ENV.JWT_SECRET === 'your-super-secret-key-change-in-production') {
      errors.push('JWT_SECRET must be changed in production!')
    }
    if (ENV.SESSION_SECRET === 'session-secret-change-in-production') {
      errors.push('SESSION_SECRET must be changed in production!')
    }
    if (!ENV.MONGODB_URI.includes('mongodb+srv')) {
      console.warn('⚠️ Consider using MongoDB Atlas in production')
    }
  }
  
  if (errors.length > 0) {
    console.error('❌ Environment validation errors:', errors)
    if (IS_PROD) {
      process.exit(1)
    }
  }
  
  return errors.length === 0
}

export default ENV
