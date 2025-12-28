import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import mongoose from 'mongoose'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

const getCollection = (name) => mongoose.connection.collection(name)

const normalizeDoc = (doc) => {
  if (!doc) return null
  const { _id, ...rest } = doc
  return { id: _id.toString(), ...rest }
}

// GET /api/progress
router.get('/', async (req, res) => {
  try {
    const { childId, month } = req.query
    let query = {}
    
    if (childId) query.childId = childId
    if (month) query.month = month
    
    const progress = await getCollection('progress')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()
    
    res.json(progress.map(normalizeDoc))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch progress' })
  }
})

// GET /api/progress/:childId
router.get('/:childId', async (req, res) => {
  try {
    const progress = await getCollection('progress')
      .find({ childId: req.params.childId })
      .sort({ createdAt: -1 })
      .toArray()
    res.json(progress.map(normalizeDoc))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch child progress' })
  }
})

// POST /api/progress
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { childId, month, skills, achievements, recommendations } = req.body

    if (!childId) return res.status(400).json({ error: 'childId is required' })
    
    const progressMonth = month || new Date().toISOString().slice(0, 7)
    const existing = await getCollection('progress').findOne({ childId, month: progressMonth })
    
    const progressData = {
      id: existing?.id || `progress_${Date.now()}`,
      childId,
      month: progressMonth,
      skills: skills || {},
      achievements: achievements || [],
      recommendations: recommendations || '',
      createdBy: req.user?.id || 'admin',
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    if (existing) {
      await getCollection('progress').updateOne(
        { childId, month: progressMonth },
        { $set: progressData }
      )
    } else {
      await getCollection('progress').insertOne(progressData)
    }
    
    res.status(201).json(normalizeDoc(progressData))
  } catch (error) {
    res.status(500).json({ error: 'Failed to save progress' })
  }
})

// GET /api/achievements
router.get('/achievements/list', async (req, res) => {
  try {
    const achievements = await getCollection('achievements').find({}).toArray()
    res.json(achievements.map(normalizeDoc))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch achievements' })
  }
})

export default router
