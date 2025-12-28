import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import logger from '../utils/logger.js'
import Gallery from '../models/Gallery.js'

const router = express.Router()

// GET /api/gallery - Public galereyani olish
router.get('/', async (req, res) => {
  try {
    const { type, album, page = 1, limit = 20 } = req.query
    const pageNum = parseInt(page) || 1
    const limitNum = Math.min(parseInt(limit) || 20, 100)
    const skip = (pageNum - 1) * limitNum
    
    let query = { published: true, isDeleted: { $ne: true } }
    if (type) query.type = type
    if (album) query.album = album
    
    const [data, total] = await Promise.all([
      Gallery.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Gallery.countDocuments(query)
    ])
    
    res.json({
      data,
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
    logger.error('Gallery fetch error', { error: error.message })
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
    
    const [data, total] = await Promise.all([
      Gallery.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Gallery.countDocuments({ isDeleted: { $ne: true } })
    ])
    
    res.json({
      data,
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
    logger.error('Gallery fetch error (admin)', { error: error.message })
    res.status(500).json({ error: 'Failed to fetch gallery' })
  }
})

// GET /api/gallery/albums - Albumlar ro'yxati
router.get('/albums', async (req, res) => {
  try {
    const albums = await Gallery.distinct('album', { isDeleted: { $ne: true } })
    res.json(albums.filter(Boolean))
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
    
    const media = new Gallery({
      type,
      url,
      thumbnail: thumbnail || url,
      title: title || '',
      album: album || 'general',
      published: true
    })
    await media.save()
    
    res.status(201).json(media)
  } catch (error) {
    res.status(500).json({ error: 'Failed to add media' })
  }
})

// PUT /api/gallery/:id - Media yangilash (admin)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const media = await Gallery.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    )
    if (!media) return res.status(404).json({ error: 'Media not found' })
    res.json(media)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update media' })
  }
})

// DELETE /api/gallery/:id - Media o'chirish (admin) - soft delete
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const media = await Gallery.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date(), deletedBy: req.user?.id },
      { new: true }
    )
    if (!media) return res.status(404).json({ error: 'Media not found' })
    res.json({ message: 'Media deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete media' })
  }
})

export default router
