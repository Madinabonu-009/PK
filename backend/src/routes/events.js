import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import mongoose from 'mongoose'
import { authenticateToken } from '../middleware/auth.js'
import logger from '../utils/logger.js'

const router = express.Router()

const getCollection = (name) => mongoose.connection.collection(name)

const normalizeDoc = (doc) => {
  if (!doc) return null
  const { _id, ...rest } = doc
  return { id: _id.toString(), ...rest }
}

// GET /api/events
router.get('/', async (req, res) => {
  try {
    const { month, year, type, all, page = 1, limit = 20 } = req.query
    const pageNum = parseInt(page) || 1
    const limitNum = Math.min(parseInt(limit) || 20, 100)
    const skip = (pageNum - 1) * limitNum
    
    let query = { isDeleted: { $ne: true } }
    if (type) query.type = type
    if (!all) query.published = { $ne: false }
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0)
      query.date = { $gte: startDate.toISOString(), $lte: endDate.toISOString() }
    }
    
    const [events, total] = await Promise.all([
      getCollection('events').find(query).sort({ date: 1 }).skip(skip).limit(limitNum).toArray(),
      getCollection('events').countDocuments(query)
    ])
    
    res.json({
      data: events.map(normalizeDoc),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasNext: pageNum * limitNum < total,
        hasPrev: pageNum > 1
      }
    })
  } catch (error) {
    logger.error('Events fetch error', { error: error.message, stack: error.stack })
    res.status(500).json({ error: 'Failed to fetch events' })
  }
})

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  try {
    let event
    try {
      event = await getCollection('events').findOne({ _id: new mongoose.Types.ObjectId(req.params.id) })
    } catch {
      event = await getCollection('events').findOne({ id: req.params.id })
    }
    
    if (!event) return res.status(404).json({ error: 'Event not found' })
    res.json(normalizeDoc(event))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event' })
  }
})

// POST /api/events
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, date, type, color, description, location } = req.body
    if (!title || !date) {
      return res.status(400).json({ error: 'Title and date are required' })
    }
    
    const event = {
      id: uuidv4(),
      title,
      date,
      type: type || 'event',
      color: color || '#667eea',
      description,
      location,
      published: true,
      createdAt: new Date().toISOString()
    }
    
    await getCollection('events').insertOne(event)
    res.status(201).json(normalizeDoc(event))
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' })
  }
})

// PUT /api/events/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    let filter
    try {
      filter = { _id: new mongoose.Types.ObjectId(req.params.id) }
    } catch {
      filter = { id: req.params.id }
    }

    const result = await getCollection('events').findOneAndUpdate(
      filter,
      { $set: { ...req.body, updatedAt: new Date().toISOString() } },
      { returnDocument: 'after' }
    )
    
    const event = result.value || result
    if (!event) return res.status(404).json({ error: 'Event not found' })
    res.json(normalizeDoc(event))
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event' })
  }
})

// DELETE /api/events/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    let filter
    try {
      filter = { _id: new mongoose.Types.ObjectId(req.params.id) }
    } catch {
      filter = { id: req.params.id }
    }

    const result = await getCollection('events').findOneAndUpdate(
      filter,
      { $set: {
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: req.user?.id || 'unknown'
      }},
      { returnDocument: 'after' }
    )
    
    if (!result.value && !result._id) return res.status(404).json({ error: 'Event not found' })
    res.json({ message: 'Event deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event' })
  }
})

export default router
