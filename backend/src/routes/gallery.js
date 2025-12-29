import express from 'express'
import mongoose from 'mongoose'
import { authenticateToken } from '../middleware/auth.js'
import logger from '../utils/logger.js'

const router = express.Router()

const getCollection = (name) => mongoose.connection.collection(name)

// GET /api/gallery
router.get('/', async (req, res) => {
  try {
    const { type, album, page = 1, limit = 20 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    let query = { published: { $ne: false }, isDeleted: { $ne: true } }
    if (type) query.type = type
    if (album) query.album = album
    
    const gallery = await getCollection('galleries').find(query).sort({ createdAt: -1 }).toArray()
    const total = gallery.length
    const paginated = gallery.slice(skip, skip + parseInt(limit))
    
    res.json({
      data: paginated.map(g => ({ ...g, id: g._id || g.id })),
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    })
  } catch (error) {
    logger.error('Gallery fetch error', { error: error.message })
    res.status(500).json({ error: 'Failed to fetch gallery' })
  }
})

// GET /api/gallery/all
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const gallery = await getCollection('galleries').find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 }).toArray()
    res.json({
      data: gallery.map(g => ({ ...g, id: g._id || g.id })),
      pagination: { total: gallery.length }
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gallery' })
  }
})

// GET /api/gallery/albums
router.get('/albums', async (req, res) => {
  try {
    const gallery = await getCollection('galleries').find({ isDeleted: { $ne: true } }).toArray()
    const albums = [...new Set(gallery.map(g => g.album).filter(Boolean))]
    res.json(albums)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch albums' })
  }
})

// POST /api/gallery
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { type, url, thumbnail, title, album, description, isPublished, published } = req.body
    
    if (!url) {
      return res.status(400).json({ error: 'URL majburiy' })
    }
    if (!type) {
      return res.status(400).json({ error: 'Media turi majburiy (image/video)' })
    }
    
    const newMedia = {
      id: `media_${Date.now()}`,
      type,
      url,
      thumbnail: thumbnail || url,
      title: title || '',
      description: description || '',
      album: album || 'general',
      published: published !== false && isPublished !== false,
      isPublished: published !== false && isPublished !== false,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user?.username || 'admin'
    }
    
    const result = await getCollection('galleries').insertOne(newMedia)
    logger.info('Media added', { id: result.insertedId, type, title, createdBy: req.user?.username })
    
    res.status(201).json({ 
      ...newMedia, 
      id: result.insertedId?.toString() || newMedia.id,
      _id: result.insertedId 
    })
  } catch (error) {
    logger.error('Gallery add error', { error: error.message })
    res.status(500).json({ error: 'Media qo\'shishda xatolik', details: error.message })
  }
})

// POST /api/gallery/upload - File upload endpoint
router.post('/upload', authenticateToken, async (req, res) => {
  try {
    // For now, return error since file upload requires multer setup
    // In production, you would use multer middleware and upload to cloud storage
    return res.status(400).json({ 
      error: 'Fayl yuklash hozircha mavjud emas. URL orqali qo\'shing.',
      message: 'File upload not available. Please use URL method.'
    })
  } catch (error) {
    logger.error('Gallery upload error', { error: error.message })
    res.status(500).json({ error: 'Fayl yuklashda xatolik' })
  }
})

// PUT /api/gallery/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const gallery = await getCollection('galleries').find({}).toArray()
    const media = gallery.find(g => (g._id?.toString() || g.id) === req.params.id)
    
    if (!media) return res.status(404).json({ error: 'Media not found' })
    
    const { isPublished, published, ...otherData } = req.body
    const updateData = { 
      ...otherData, 
      updatedAt: new Date() 
    }
    
    // Handle both isPublished and published fields
    if (isPublished !== undefined) {
      updateData.isPublished = isPublished
      updateData.published = isPublished
    }
    if (published !== undefined) {
      updateData.published = published
      updateData.isPublished = published
    }
    
    if (media._id) {
      await getCollection('galleries').updateOne({ _id: media._id }, { $set: updateData })
    } else {
      await getCollection('galleries').updateOne({ id: media.id }, { $set: updateData })
    }
    
    logger.info('Media updated', { id: req.params.id })
    res.json({ ...media, ...updateData })
  } catch (error) {
    logger.error('Gallery update error', { error: error.message })
    res.status(500).json({ error: 'Failed to update media' })
  }
})

// DELETE /api/gallery/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const gallery = await getCollection('galleries').find({}).toArray()
    const media = gallery.find(g => (g._id?.toString() || g.id) === req.params.id)
    
    if (!media) return res.status(404).json({ error: 'Media not found' })
    
    if (media._id) {
      await getCollection('galleries').updateOne({ _id: media._id }, { $set: { isDeleted: true, deletedAt: new Date() } })
    } else {
      await getCollection('galleries').updateOne({ id: media.id }, { $set: { isDeleted: true, deletedAt: new Date() } })
    }
    
    res.json({ message: 'Media deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete media' })
  }
})

export default router
