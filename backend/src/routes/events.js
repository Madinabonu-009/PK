import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { readData, writeData } from '../utils/db.js'
import { authenticateToken } from '../middleware/auth.js'
import { normalizeId } from '../utils/helpers.js'
import logger from '../utils/logger.js'
import Event from '../models/Event.js'

const router = express.Router()

// GET /api/events
router.get('/', async (req, res) => {
  try {
    const { month, year, type, all, page = 1, limit = 20 } = req.query
    const pageNum = parseInt(page) || 1
    const limitNum = Math.min(parseInt(limit) || 20, 100) // Max 100 per page
    const skip = (pageNum - 1) * limitNum
    
    if (req.app.locals.useDatabase) {
      let query = { isDeleted: { $ne: true } }
      if (type) query.type = type
      if (!all) query.published = true
      
      if (month && year) {
        const startDate = new Date(year, month - 1, 1)
        const endDate = new Date(year, month, 0)
        query.date = { $gte: startDate, $lte: endDate }
      }
      
      const [events, total] = await Promise.all([
        Event.find(query).sort({ date: 1 }).skip(skip).limit(limitNum),
        Event.countDocuments(query)
      ])
      
      return res.json({
        data: events.map(normalizeId),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
          hasNext: pageNum * limitNum < total,
          hasPrev: pageNum > 1
        }
      })
    }
    
    let events = readData('events.json') || []
    
    // Filter out deleted events
    events = events.filter(e => !e.isDeleted)
    
    // Faqat published (agar all=true bo'lmasa)
    if (!all) {
      events = events.filter(e => e.published !== false)
    }
    
    if (month && year) {
      events = events.filter(e => {
        const eventDate = new Date(e.date)
        return eventDate.getMonth() + 1 === parseInt(month) && 
               eventDate.getFullYear() === parseInt(year)
      })
    }
    if (type) events = events.filter(e => e.type === type)
    events.sort((a, b) => new Date(a.date) - new Date(b.date))
    
    const total = events.length
    const paginated = events.slice(skip, skip + limitNum)
    
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
    logger.error('Events fetch error', { error: error.message, stack: error.stack })
    res.status(500).json({ error: 'Failed to fetch events' })
  }
})

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  try {
    if (req.app.locals.useDatabase) {
      const event = await Event.findById(req.params.id)
      if (!event) return res.status(404).json({ error: 'Event not found' })
      return res.json(event)
    }
    
    const events = readData('events.json') || []
    const event = events.find(e => e.id === req.params.id)
    if (!event) return res.status(404).json({ error: 'Event not found' })
    res.json(event)
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
    
    if (req.app.locals.useDatabase) {
      const event = new Event({
        title,
        date,
        type: type || 'event',
        color: color || '#667eea',
        description,
        location
      })
      await event.save()
      return res.status(201).json(event)
    }
    
    const events = readData('events.json') || []
    const newEvent = {
      id: uuidv4(),
      title,
      date,
      type: type || 'event',
      color: color || '#667eea',
      description,
      location
    }
    events.push(newEvent)
    writeData('events.json', events)
    res.status(201).json(newEvent)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' })
  }
})

// PUT /api/events/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.app.locals.useDatabase) {
      const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true })
      if (!event) return res.status(404).json({ error: 'Event not found' })
      return res.json(event)
    }
    
    const events = readData('events.json') || []
    const index = events.findIndex(e => e.id === req.params.id)
    if (index === -1) return res.status(404).json({ error: 'Event not found' })
    
    events[index] = { ...events[index], ...req.body }
    writeData('events.json', events)
    res.json(events[index])
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event' })
  }
})

// DELETE /api/events/:id (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.app.locals.useDatabase) {
      const event = await Event.findByIdAndUpdate(
        req.params.id,
        {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: req.user?.id || 'unknown'
        },
        { new: true }
      )
      if (!event) return res.status(404).json({ error: 'Event not found' })
      return res.json({ message: 'Event deleted' })
    }
    
    let events = readData('events.json') || []
    const index = events.findIndex(e => e.id === req.params.id)
    if (index === -1) return res.status(404).json({ error: 'Event not found' })
    
    // Soft delete
    events[index].isDeleted = true
    events[index].deletedAt = new Date().toISOString()
    events[index].deletedBy = req.user?.id || 'unknown'
    
    writeData('events.json', events)
    res.json({ message: 'Event deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event' })
  }
})

export default router
