/**
 * Environment variables validation
 * Run this on startup to ensure all required env vars are set
 */

// Faqat haqiqatan kerakli o'zgaruvchilar
const requiredEnvVars = [
  'JWT_SECRET'
]

// Production'da kerakli o'zgaruvchilar
const productionRequiredEnvVars = [
  'JWT_SECRET'
]

const optionalEnvVars = [
  'PORT',
  'NODE_ENV',
  'MONGODB_URI',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_CHAT_ID',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'RATE_LIMIT_WINDOW_MS',
  'RATE_LIMIT_MAX_REQUESTS',
  'ALLOWED_ORIGINS',
  'ENCRYPTION_KEY'
]

export const checkEnvironment = () => {
  const missing = []
  const warnings = []
  const critical = []
  
  const isProduction = process.env.NODE_ENV === 'production'
  const varsToCheck = isProduction ? productionRequiredEnvVars : requiredEnvVars

  // Check required variables
  varsToCheck.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName)
    }
  })

  // Set default PORT if not provided
  if (!process.env.PORT) {
    process.env.PORT = '3000'
  }

  // Check JWT secret strength - CRITICAL in production
  if (process.env.JWT_SECRET) {
    const defaultSecrets = [
      'play-kids-secret-key',
      'your_super_secret',
      'secret',
      'jwt_secret',
      'change_me',
      'your-secret-key'
    ]
    
    const isDefaultSecret = defaultSecrets.some(ds => 
      process.env.JWT_SECRET.toLowerCase().includes(ds.toLowerCase())
    )
    
    if (isDefaultSecret && isProduction) {
      critical.push('JWT_SECRET is using default/example value - CHANGE IT IMMEDIATELY!')
    } else if (isDefaultSecret) {
      warnings.push('JWT_SECRET appears to be using example value - change before production')
    }
    
    if (process.env.JWT_SECRET.length < 32 && isProduction) {
      critical.push('JWT_SECRET must be at least 32 characters long in production')
    } else if (process.env.JWT_SECRET.length < 32) {
      warnings.push('JWT_SECRET should be at least 32 characters long for better security')
    }
  }

  if (process.env.TELEGRAM_BOT_TOKEN?.includes('your_bot_token')) {
    warnings.push('TELEGRAM_BOT_TOKEN appears to be using example value - Telegram notifications disabled')
  }

  // Validate PORT
  const port = parseInt(process.env.PORT)
  if (isNaN(port) || port < 1 || port > 65535) {
    warnings.push('PORT should be a valid port number (1-65535), using default 3000')
    process.env.PORT = '3000'
  }

  // Validate rate limit values
  if (process.env.RATE_LIMIT_WINDOW_MS) {
    const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS)
    if (isNaN(windowMs) || windowMs < 1000) {
      warnings.push('RATE_LIMIT_WINDOW_MS should be at least 1000ms')
    }
  }

  if (process.env.RATE_LIMIT_MAX_REQUESTS) {
    const maxReq = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS)
    if (isNaN(maxReq) || maxReq < 1) {
      warnings.push('RATE_LIMIT_MAX_REQUESTS should be a positive number')
    }
  }

  // Validate Telegram chat ID format (only if provided)
  if (process.env.TELEGRAM_CHAT_ID && !/^-?\d+$/.test(process.env.TELEGRAM_CHAT_ID)) {
    warnings.push('TELEGRAM_CHAT_ID should be a numeric value')
  }

  // Check ALLOWED_ORIGINS format
  if (process.env.ALLOWED_ORIGINS) {
    const origins = process.env.ALLOWED_ORIGINS.split(',')
    origins.forEach(origin => {
      const trimmed = origin.trim()
      if (trimmed && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        warnings.push(`Invalid origin format: ${trimmed}. Should start with http:// or https://`)
      }
    })
  }

  // Report critical issues (only in production)
  if (critical.length > 0 && isProduction) {
    console.error('🚨 CRITICAL SECURITY ISSUES:')
    critical.forEach(c => console.error(`   - ${c}`))
    console.error('\n❌ Cannot start in production with critical security issues!')
    process.exit(1)
  } else if (critical.length > 0) {
    console.warn('🚨 Security warnings (would be critical in production):')
    critical.forEach(c => console.warn(`   - ${c}`))
  }

  // Report missing required vars
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:')
    missing.forEach(v => console.error(`   - ${v}`))
    console.error('\nPlease check your .env file')
    process.exit(1)
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Environment warnings:')
    warnings.forEach(w => console.warn(`   - ${w}`))
  }

  console.log('✅ Environment variables validated')
}

// Validate specific values
export const validateEnvValue = (name, value, type = 'string') => {
  if (!value) return false
  
  switch (type) {
    case 'number':
      return !isNaN(parseInt(value))
    case 'boolean':
      return value === 'true' || value === 'false'
    case 'url':
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    default:
      return typeof value === 'string' && value.length > 0
  }
}
