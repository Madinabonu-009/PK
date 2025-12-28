import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import rateLimit from 'express-rate-limit'
import { authenticateToken, requireRole } from '../middleware/auth.js'
import logger from '../utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Upload rate limiter - per user
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour per user
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { error: 'Too many uploads. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false
})

// Delete rate limiter
const deleteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 deletes per hour per user
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { error: 'Too many delete requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false
})

// Upload papkalarini yaratish
// Production'da data/uploads ichiga saqlash (Render disk persistence uchun)
const isProduction = process.env.NODE_ENV === 'production'
const baseUploadPath = isProduction 
  ? path.join(__dirname, '../../data/uploads')
  : path.join(__dirname, '../../uploads')

const uploadDirs = ['gallery', 'stories', 'events']
uploadDirs.forEach(dir => {
  const dirPath = path.join(baseUploadPath, dir)
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
})

// Multer konfiguratsiyasi
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Path traversal protection - faqat allowed folderlar
    const allowedFolders = ['gallery', 'stories', 'events']
    const folder = req.query.folder || 'gallery'
    
    // Folder validation
    if (!allowedFolders.includes(folder)) {
      return cb(new Error('Invalid folder name'), null)
    }
    
    const uploadPath = path.join(baseUploadPath, folder)
    
    // Papkani yaratish
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    // Filename sanitization - path traversal va xavfli belgilarni olib tashlash
    const originalName = path.basename(file.originalname) // Path traversal protection
    const sanitizedName = originalName
      .replace(/[/\\?%*:|"<>]/g, '') // Xavfli belgilar
      .replace(/\.\./g, '') // Path traversal
      .trim()
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(sanitizedName) || path.extname(originalName) || '.bin'
    
    // Faqat allowed extensions
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.webm', '.mov', '.avi']
    const lowerExt = ext.toLowerCase()
    
    if (!allowedExtensions.includes(lowerExt)) {
      return cb(new Error('Invalid file extension'), null)
    }
    
    cb(null, uniqueSuffix + lowerExt)
  }
})

// Fayl filtri - faqat rasm va video
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'
  ]
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Faqat rasm (jpg, png, gif, webp) va video (mp4, webm) yuklash mumkin'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max
  }
})

// POST /api/upload - Bitta fayl yuklash
router.post('/', authenticateToken, uploadLimiter, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Fayl yuklanmadi' })
    }
    
    const folder = req.query.folder || 'gallery'
    // Production'da data/uploads, development'da uploads
    const urlPrefix = isProduction ? '/data/uploads' : '/uploads'
    const fileUrl = `${urlPrefix}/${folder}/${req.file.filename}`
    const isVideo = req.file.mimetype.startsWith('video/')
    
    // Audit log
    logger.info('File uploaded', {
      userId: req.user.id,
      filename: req.file.filename,
      folder,
      size: req.file.size,
      type: isVideo ? 'video' : 'image'
    })
    
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      type: isVideo ? 'video' : 'image',
      size: req.file.size,
      mimetype: req.file.mimetype
    })
  } catch (error) {
    logger.error('Upload error', { error: error.message, userId: req.user?.id })
    res.status(500).json({ error: 'Fayl yuklashda xatolik' })
  }
})

// POST /api/upload/multiple - Ko'p fayl yuklash
router.post('/multiple', authenticateToken, uploadLimiter, upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Fayllar yuklanmadi' })
    }
    
    const folder = req.query.folder || 'gallery'
    const urlPrefix = isProduction ? '/data/uploads' : '/uploads'
    const files = req.files.map(file => ({
      url: `${urlPrefix}/${folder}/${file.filename}`,
      filename: file.filename,
      type: file.mimetype.startsWith('video/') ? 'video' : 'image',
      size: file.size
    }))
    
    // Audit log
    logger.info('Multiple files uploaded', {
      userId: req.user.id,
      count: files.length,
      folder,
      totalSize: files.reduce((sum, f) => sum + f.size, 0)
    })
    
    res.json({ success: true, files })
  } catch (error) {
    logger.error('Multiple upload error', { error: error.message, userId: req.user?.id })
    res.status(500).json({ error: 'Fayllar yuklashda xatolik' })
  }
})

// DELETE /api/upload - Faylni o'chirish
router.delete('/', authenticateToken, requireRole('admin', 'teacher'), deleteLimiter, (req, res) => {
  try {
    const { url } = req.body
    if (!url) {
      return res.status(400).json({ error: 'URL kerak' })
    }
    
    // Path traversal protection - faqat uploads papkasi ichida bo'lishi kerak
    const normalizedUrl = path.normalize(url)
      .replace(/^(\.\.[\/\\])+/, '')
      .replace(/^\/?(data\/)?uploads\//, '') // /uploads/ yoki /data/uploads/ ni olib tashlash
    
    // Uploads papkasi ichida ekanligini tekshirish
    const filePath = path.join(baseUploadPath, normalizedUrl)
    
    // Resolved path baseUploadPath ichida ekanligini tekshirish (path traversal protection)
    if (!filePath.startsWith(path.resolve(baseUploadPath))) {
      return res.status(403).json({ error: 'Xavfsizlik: Invalid file path' })
    }
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      res.json({ success: true, message: 'Fayl o\'chirildi' })
    } else {
      res.status(404).json({ error: 'Fayl topilmadi' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Faylni o\'chirishda xatolik' })
  }
})

// Error handler for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Fayl hajmi 50MB dan oshmasligi kerak' })
    }
    return res.status(400).json({ error: error.message })
  }
  if (error) {
    return res.status(400).json({ error: error.message })
  }
  next()
})

export default router
