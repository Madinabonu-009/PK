import express from 'express'
import mongoose from 'mongoose'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()
const getCollection = (name) => mongoose.connection.collection(name)

// GET /api/achievements
router.get('/', async (req, res) => {
  try {
    const achievements = await getCollection('achievements').find({ isDeleted: { $ne: true } }).toArray()
    res.json(achievements.map(a => ({ ...a, id: a._id || a.id })))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch achievements' })
  }
})

// GET /api/achievements/child/:childId
router.get('/child/:childId', authenticateToken, async (req, res) => {
  try {
    const { childId } = req.params
    const children = await getCollection('children').find({}).toArray()
    const achievements = await getCollection('achievements').find({}).toArray()
    
    const child = children.find(c => (c._id?.toString() || c.id) === childId)
    if (!child) return res.status(404).json({ error: 'Bola topilmadi' })
    
    const childAchievements = (child.achievements || []).map(ach => {
      const achievementId = typeof ach === 'string' ? ach : ach.achievementId
      const achievementData = achievements.find(a => (a._id?.toString() || a.id) === achievementId)
      if (!achievementData) return null
      return { ...achievementData, earnedAt: typeof ach === 'object' ? ach.earnedAt : null }
    }).filter(Boolean)
    
    res.json({ achievements: childAchievements, totalPoints: childAchievements.reduce((sum, a) => sum + (a.points || 0), 0) })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch child achievements' })
  }
})

// POST /api/achievements/award
router.post('/award', authenticateToken, async (req, res) => {
  try {
    const { childId, achievementId } = req.body
    if (!childId || !achievementId) return res.status(400).json({ error: 'childId va achievementId kerak' })
    
    const children = await getCollection('children').find({}).toArray()
    const achievements = await getCollection('achievements').find({}).toArray()
    
    const child = children.find(c => (c._id?.toString() || c.id) === childId)
    if (!child) return res.status(404).json({ error: 'Bola topilmadi' })
    
    const achievement = achievements.find(a => (a._id?.toString() || a.id) === achievementId)
    if (!achievement) return res.status(404).json({ error: 'Yutuq topilmadi' })
    
    if (!child.achievements) child.achievements = []
    
    const alreadyAwarded = child.achievements.some(a => {
      const id = typeof a === 'string' ? a : a.achievementId
      return id === achievementId
    })
    if (alreadyAwarded) return res.status(400).json({ error: 'Bu yutuq allaqachon berilgan' })
    
    child.achievements.push({ achievementId, earnedAt: new Date().toISOString(), awardedBy: req.user?.username })
    child.points = (child.points || 0) + (achievement.points || 0)
    
    if (child._id) {
      await getCollection('children').updateOne({ _id: child._id }, { $set: { achievements: child.achievements, points: child.points } })
    } else {
      await getCollection('children').updateOne({ id: child.id }, { $set: { achievements: child.achievements, points: child.points } })
    }
    
    res.json({ message: 'Yutuq berildi!', achievement, newPoints: child.points })
  } catch (error) {
    res.status(500).json({ error: 'Yutuq berishda xatolik' })
  }
})

// POST /api/achievements
router.post('/', authenticateToken, async (req, res) => {
  try {
    const newAchievement = { ...req.body, createdAt: new Date() }
    const result = await getCollection('achievements').insertOne(newAchievement)
    res.status(201).json({ ...newAchievement, id: result.insertedId })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create achievement' })
  }
})

// DELETE /api/achievements/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const achievements = await getCollection('achievements').find({}).toArray()
    const achievement = achievements.find(a => (a._id?.toString() || a.id) === req.params.id)
    if (!achievement) return res.status(404).json({ error: 'Achievement not found' })
    
    if (achievement._id) {
      await getCollection('achievements').updateOne({ _id: achievement._id }, { $set: { isDeleted: true, deletedAt: new Date() } })
    } else {
      await getCollection('achievements').updateOne({ id: achievement.id }, { $set: { isDeleted: true, deletedAt: new Date() } })
    }
    res.json({ message: 'Achievement deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete achievement' })
  }
})

export default router
