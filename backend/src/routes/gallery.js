import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { readData, writeData } from '../utils/db.js'
import { authenticateToken } from '../middleware/auth.js'
import logger from '../utils/logger.js'

const router = express.Router()

// GET /api/gallery - Public galereyani olish
router.get('/', async (req, res) => {
  try {
    const { type, album, page = 1, limit = 20 } = req.query
    const pageNum = parseInt(page) || 1
    const limitNum = Math.min(parseInt(limit) || 20, 100) // Max 100 per page
    const skip = (pageNum - 1) * limitNum
    
    let gallery = readData('gallery.json') || []
    
    // Faqat published
    gallery = gallery.filter(g => g.published !== false)
    
    if (type) gallery = gallery.filter(g => g.type === type)
    if (album) gallery = gallery.filter(g => g.album === album)
    
    gallery.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
    
    const total = gallery.length
    const paginated = gallery.slice(skip, skip + limitNum)
    
    res.json({
      data: paginated,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasNext: skip + limitNum < total,
        hasPrev: pageNum > 1
      }
    })
  } catch (error) {
    logger.error('Gallery fetch error', { error: error.message, stack: error.stack })
    res.status(500).json({ error: 'Failed to fetch gallery' })
  }
})

// GET /api/gallery/all - Admin uchun barcha media
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const pageNum = parseInt(page) || 1
    const limitNum = Math.min(parseInt(limit) || 20, 100)
    const skip = (pageNum - 1) * limitNum
    
    let gallery = readData('gallery.json') || []
    gallery.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
    
    const total = gallery.length
    const paginated = gallery.slice(skip, skip + limitNum)
    
    res.json({
      data: paginated,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasNext: skip + limitNum < total,
        hasPrev: pageNum > 1
      }
    })
  } catch (error) {
    logger.error('Gallery fetch error (admin)', { error: error.message, stack: error.stack })
    res.status(500).json({ error: 'Failed to fetch gallery' })
  }
})

// GET /api/gallery/albums - Albumlar ro'yxati
router.get('/albums', async (req, res) => {
  try {
    const gallery = readData('gallery.json') || []
    const albums = [...new Set(gallery.map(g => g.album).filter(Boolean))]
    res.json(albums)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch albums' })
  }
})

// POST /api/gallery - Yangi media qo'shish (admin)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { type, url, thumbnail, title, album } = req.body
    
    if (!url || !type) {
      return res.status(400).json({ error: 'URL and type are required' })
    }
    
    const gallery = readData('gallery.json') || []
    
    const newMedia = {
      id: uuidv4(),
      type,
      url,
      thumbnail: thumbnail || url,
      title: title || '',
      album: album || 'general',
      createdAt: new Date().toISOString(),
      published: true
    }
    
    gallery.push(newMedia)
    writeData('gallery.json', gallery)
    
    res.status(201).json(newMedia)
  } catch (error) {
    res.status(500).json({ error: 'Failed to add media' })
  }
})

// PUT /api/gallery/:id - Media yangilash (admin)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const gallery = readData('gallery.json') || []
    const index = gallery.findIndex(g => g.id === req.params.id)
    
    if (index === -1) {
      return res.status(404).json({ error: 'Media not found' })
    }
    
    gallery[index] = { ...gallery[index], ...req.body }
    writeData('gallery.json', gallery)
    res.json(gallery[index])
  } catch (error) {
    res.status(500).json({ error: 'Failed to update media' })
  }
})

// DELETE /api/gallery/:id - Media o'chirish (admin) - soft delete
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    let gallery = readData('gallery.json') || []
    const index = gallery.findIndex(g => g.id === req.params.id)
    if (index === -1) return res.status(404).json({ error: 'Media not found' })
    
    // Soft delete
    gallery[index].isDeleted = true
    gallery[index].deletedAt = new Date().toISOString()
    gallery[index].deletedBy = req.user?.id || 'unknown'
    
    writeData('gallery.json', gallery)
    res.json({ message: 'Media deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete media' })
  }
})

export default router