import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { readData, writeData } from '../utils/db.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// GET /api/progress - Barcha progress
router.get('/', async (req, res) => {
  try {
    const { childId, month } = req.query
    let progress = readData('progress.json') || []
    
    if (childId) {
      progress = progress.filter(p => p.childId === childId)
    }
    if (month) {
      progress = progress.filter(p => p.month === month)
    }
    
    progress.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    res.json(progress)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch progress' })
  }
})

// GET /api/progress/:childId - Bola progress tarixi
router.get('/:childId', async (req, res) => {
  try {
    const progress = readData('progress.json') || []
    const childProgress = progress
      .filter(p => p.childId === req.params.childId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    res.json(childProgress)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch child progress' })
  }
})

// POST /api/progress - Yangi baholash
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { childId, month, skills, achievements, recommendations } = req.body
    
    if (!childId) {
      return res.status(400).json({ error: 'childId is required' })
    }
    
    const progress = readData('progress.json') || []
    
    // Shu oy uchun mavjud bo'lsa yangilash
    const existingIndex = progress.findIndex(p => p.childId === childId && p.month === month)
    
    const progressData = {
      id: existingIndex >= 0 ? progress[existingIndex].id : uuidv4(),
      childId,
      month: month || new Date().toISOString().slice(0, 7),
      skills: skills || {},
      achievements: achievements || [],
      recommendations: recommendations || '',
      createdBy: req.user?.id || 'admin',
      createdAt: existingIndex >= 0 ? progress[existingIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    if (existingIndex >= 0) {
      progress[existingIndex] = progressData
    } else {
      progress.push(progressData)
    }
    
    writeData('progress.json', progress)
    res.status(201).json(progressData)
  } catch (error) {
    res.status(500).json({ error: 'Failed to save progress' })
  }
})

// GET /api/achievements - Barcha yutuqlar
router.get('/achievements/list', async (req, res) => {
  try {
    const achievements = readData('achievements.json') || []
    res.json(achievements)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch achievements' })
  }
})

export default router
