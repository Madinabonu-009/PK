import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import fs from 'fs'
import { checkEnvironment } from './utils/envCheck.js'
import { requestLogger, logError, generateRequestId } from './middleware/requestLogger.js'
import { performanceMonitor, metricsHandler } from './middleware/performanceMonitor.js'
import { setupGracefulShutdown, registerCleanup } from './utils/gracefulShutdown.js'
import { securityHeaders, removeSensitiveHeaders, addSecurityContext } from './middleware/securityHeaders.js'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './config/swagger.js'
import connectDB from './config/database.js'
import healthRoutes from './routes/health.js'

// Validate environment variables on startup
checkEnvironment()
import authRoutes from './routes/auth.js'
import childrenRoutes from './routes/children.js'
import groupsRoutes from './routes/groups.js'
import menuRoutes from './routes/menu.js'
import enrollmentsRoutes from './routes/enrollments.js'
import teachersRoutes from './routes/teachers.js'
import contactRoutes from './routes/contact.js'
import blogRoutes from './routes/blog.js'
import eventsRoutes from './routes/events.js'
import achievementsRoutes from './routes/achievements.js'
import paymentsRoutes from './routes/payments.js'
import journalRoutes from './routes/journal.js'
import feedbackRoutes from './routes/feedback.js'
import questionsRoutes from './routes/questions.js'
import galleryRoutes from './routes/gallery.js'
import telegramRoutes from './routes/telegram.js'
import attendanceRoutes from './routes/attendance.js'
import dailyReportsRoutes from './routes/dailyReports.js'
import debtsRoutes from './routes/debts.js'
import storiesRoutes from './routes/stories.js'
import progressRoutes from './routes/progress.js'
import gameProgressRoutes from './routes/gameProgress.js'
import curriculumRoutes from './routes/curriculum.js'
import errorsRoutes from './routes/errors.js'
import migrationsRoutes from './routes/migrations.js'
import uploadRoutes from './routes/upload.js'
import settingsRoutes from './routes/settings.js'
import usersRoutes from './routes/users.js'
import { csrfTokenHandler } from './middleware/csrf.js'
import { initCronJobs } from './services/cronJobs.js'
import logger from './utils/logger.js'

const app = express()
const PORT = process.env.PORT || 3000

// Trust proxy for Render.com (behind reverse proxy)
app.set('trust proxy', 1)

// MongoDB ulanish
let useDatabase = false
connectDB().then(connected => {
  useDatabase = connected
  app.locals.useDatabase = connected
})

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

// Rate Limiting
const isDev = process.env.NODE_ENV === 'development'

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: isDev ? 1000 : parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false
})

// Stricter rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 100 : 5, // 5 attempts in production
  message: { error: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false
})

app.use('/api/', apiLimiter)
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/parent/login', authLimiter)

// CORS Configuration - Issue #8: Stricter CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000']

// Production da localhost'ni olib tashlash va faqat o'z domenini qo'shish
if (process.env.NODE_ENV === 'production') {
  // Remove localhost origins in production
  const localhostOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000']
  localhostOrigins.forEach(lo => {
    const idx = allowedOrigins.indexOf(lo)
    if (idx > -1) allowedOrigins.splice(idx, 1)
  })
  
  // Add production domain
  if (!allowedOrigins.includes('https://play-kids.onrender.com')) {
    allowedOrigins.push('https://play-kids.onrender.com')
  }
  
  // Specific subdomains only, not wildcard
  if (process.env.ADDITIONAL_ORIGINS) {
    allowedOrigins.push(...process.env.ADDITIONAL_ORIGINS.split(',').map(o => o.trim()))
  }
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, same-origin, etc.)
    if (!origin) return callback(null, true)
    
    // Strict origin check - no wildcards
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      logger.warn(`CORS blocked origin: ${origin}`)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-CSRF-Token'],
  exposedHeaders: ['X-Request-ID'],
  maxAge: 86400 // 24 hours
}))

// Security headers
app.use(removeSensitiveHeaders)
app.use(securityHeaders)
app.use(addSecurityContext)

// Request ID generation
app.use(generateRequestId)

// Request logging
app.use(requestLogger)

// Performance monitoring
app.use(performanceMonitor)

// Compression
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false
    }
    return compression.filter(req, res)
  },
  level: 6
}))

// Middleware
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/children', childrenRoutes)
app.use('/api/groups', groupsRoutes)
app.use('/api/menu', menuRoutes)
app.use('/api/enrollments', enrollmentsRoutes)
app.use('/api/teachers', teachersRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/blog', blogRoutes)
app.use('/api/events', eventsRoutes)
app.use('/api/achievements', achievementsRoutes)
app.use('/api/payments', paymentsRoutes)
app.use('/api/journal', journalRoutes)
app.use('/api/feedback', feedbackRoutes)
app.use('/api/questions', questionsRoutes)
app.use('/api/gallery', galleryRoutes)
app.use('/api/telegram', telegramRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/daily-reports', dailyReportsRoutes)
app.use('/api/debts', debtsRoutes)
app.use('/api/stories', storiesRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/game-progress', gameProgressRoutes)
app.use('/api/curriculum', curriculumRoutes)
app.use('/api/errors', errorsRoutes)
app.use('/api/migrations', migrationsRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/users', usersRoutes)

// CSRF token endpoint
app.get('/api/csrf-token', csrfTokenHandler)

// Static files - uploads papkasi
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Development'da uploads, Production'da data/uploads
const uploadsPath = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, '../data/uploads')
  : path.join(__dirname, '../uploads')

// Har ikkala path'ni ham serve qilish (backward compatibility)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
app.use('/data/uploads', express.static(uploadsPath))

// Serve images from frontend/public/images (for gallery)
const imagesPath = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, '../../frontend/dist/images')
  : path.join(__dirname, '../../frontend/public/images')
app.use('/images', express.static(imagesPath))

// Production: Serve frontend static files
if (process.env.NODE_ENV === 'production') {
  // Frontend dist path - try multiple locations for Render compatibility
  let frontendPath = path.join(__dirname, '../../frontend/dist') // relative to backend/src
  
  // Fallback paths
  const fallbackPaths = [
    path.join(process.cwd(), '../frontend/dist'),
    path.join(process.cwd(), 'frontend/dist'),
    '/opt/render/project/src/frontend/dist'
  ]
  
  if (!fs.existsSync(frontendPath)) {
    for (const fp of fallbackPaths) {
      if (fs.existsSync(fp)) {
        frontendPath = fp
        break
      }
    }
  }
  
  console.log('Serving frontend from:', frontendPath)
  
  // Check if frontend dist exists
  if (!fs.existsSync(frontendPath)) {
    console.error('❌ Frontend dist folder not found at:', frontendPath)
    console.log('Available paths:', fs.readdirSync(process.cwd()))
  } else {
    console.log('✅ Frontend dist folder found')
  }
  
  // Static files with correct MIME types
  app.use(express.static(frontendPath, {
    maxAge: '1y',
    etag: true,
    setHeaders: (res, filePath) => {
      // Set correct MIME types
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8')
      } else if (filePath.endsWith('.json')) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
      } else if (filePath.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
      } else if (filePath.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png')
      } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg')
      } else if (filePath.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml')
      } else if (filePath.endsWith('.woff2')) {
        res.setHeader('Content-Type', 'font/woff2')
      } else if (filePath.endsWith('.woff')) {
        res.setHeader('Content-Type', 'font/woff')
      } else if (filePath.endsWith('.ico')) {
        res.setHeader('Content-Type', 'image/x-icon')
      }
    }
  }))
  
  // SPA fallback - API bo'lmagan barcha so'rovlarni index.html ga yo'naltirish
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return next()
    }
    // Skip static files
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|json|map)$/)) {
      return next()
    }
    
    const indexPath = path.join(frontendPath, 'index.html')
    if (fs.existsSync(indexPath)) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
      res.sendFile(indexPath)
    } else {
      res.status(404).json({ error: 'Frontend not built. Run npm run build first.' })
    }
  })
}

// Cron jobs ishga tushirish
initCronJobs()

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Play Kids API Documentation'
}))

// Swagger JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerSpec)
})

// Health check routes
app.use('/api/health', healthRoutes)

// Performance metrics endpoint
app.get('/api/metrics', metricsHandler)

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Error logging middleware
app.use(logError)

// Error handling middleware
app.use((err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development'
  
  // Log error
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    details: err.details
  })
  
  // Don't expose internal errors in production
  const statusCode = err.status || err.statusCode || 500
  const message = isDev ? err.message : (statusCode === 500 ? 'Internal server error' : err.message)
  
  res.status(statusCode).json({ 
    error: message,
    ...(isDev && { stack: err.stack, details: err.details })
  })
})

const server = app.listen(PORT, () => {
  logger.success(`🚀 Server running on port ${PORT}`)
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
  logger.info(`Database: ${useDatabase ? 'MongoDB' : 'JSON files'}`)
})

// Initialize WebSocket
import { initializeWebSocket } from './services/websocket.js'
initializeWebSocket(server)

// Setup graceful shutdown
setupGracefulShutdown(server)

// Register cleanup handlers
registerCleanup(async () => {
  logger.info('Cleaning up resources...')
  // Add any cleanup logic here (close DB connections, etc.)
})

export default app
