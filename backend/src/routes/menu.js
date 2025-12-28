import express from 'express'
import mongoose from 'mongoose'
import { authenticateToken } from '../middleware/auth.js'
import logger from '../utils/logger.js'

const router = express.Router()

const getCollection = (name) => mongoose.connection.collection(name)

// GET /api/menu
router.get('/', async (req, res) => {
  try {
    const menu = await getCollection('menu').findOne({})
    if (!menu) return res.status(404).json({ error: 'Menu not found' })
    res.json(menu.days || menu)
  } catch (error) {
    logger.error('Menu fetch error', { error: error.message })
    res.status(500).json({ error: 'Failed to fetch menu' })
  }
})

// GET /api/menu/week/:weekNumber
router.get('/week/:weekNumber', async (req, res) => {
  try {
    const menu = await getCollection('menu').findOne({})
    res.json(menu?.days || menu || {})
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu' })
  }
})

// PUT /api/menu
router.put('/', authenticateToken, async (req, res) => {
  try {
    const existing = await getCollection('menu').findOne({})
    
    if (existing) {
      await getCollection('menu').updateOne({ _id: existing._id }, { $set: { days: req.body, updatedAt: new Date() } })
    } else {
      await getCollection('menu').insertOne({ days: req.body, createdAt: new Date(), updatedAt: new Date() })
    }
    
    res.json(req.body)
  } catch (error) {
    logger.error('Menu update error', { error: error.message })
    res.status(500).json({ error: 'Failed to update menu' })
  }
})

// POST /api/menu
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { days } = req.body
    await getCollection('menu').insertOne({ days, createdAt: new Date() })
    res.status(201).json(days)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create menu' })
  }
})

export default router
