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
    const { type, url, thumbnail, title, album } = req.body
    if (!url || !type) return res.status(400).json({ error: 'URL and type required' })
    
    const newMedia = {
      type,
      url,
      thumbnail: thumbnail || url,
      title: title || '',
      album: album || 'general',
      published: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    const result = await getCollection('galleries').insertOne(newMedia)
    res.status(201).json({ ...newMedia, id: result.insertedId })
  } catch (error) {
    res.status(500).json({ error: 'Failed to add media' })
  }
})

// PUT /api/gallery/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const gallery = await getCollection('galleries').find({}).toArray()
    const media = gallery.find(g => (g._id?.toString() || g.id) === req.params.id)
    
    if (!media) return res.status(404).json({ error: 'Media not found' })
    
    const updateData = { ...req.body, updatedAt: new Date() }
    
    if (media._id) {
      await getCollection('galleries').updateOne({ _id: media._id }, { $set: updateData })
    } else {
      await getCollection('galleries').updateOne({ id: media.id }, { $set: updateData })
    }
    
    res.json({ ...media, ...updateData })
  } catch (error) {
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
