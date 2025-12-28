import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { readData, writeData } from '../utils/db.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// GET /api/achievements - Barcha yutuqlar
router.get('/', async (req, res) => {
  try {
    const achievements = readData('achievements.json') || []
    // Filter out soft-deleted achievements
    const activeAchievements = achievements.filter(a => !a.isDeleted)
    res.json(activeAchievements)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch achievements' })
  }
})

// GET /api/achievements/child/:childId - Bolaning yutuqlari
router.get('/child/:childId', authenticateToken, async (req, res) => {
  try {
    const { childId } = req.params
    const children = readData('children.json') || []
    const achievements = readData('achievements.json') || []
    
    const child = children.find(c => c.id === childId)
    if (!child) {
      return res.status(404).json({ error: 'Bola topilmadi' })
    }
    
    // Bolaning yutuqlarini olish
    const childAchievements = (child.achievements || []).map(ach => {
      const achievementId = typeof ach === 'string' ? ach : ach.achievementId
      const achievementData = achievements.find(a => a.id === achievementId)
      if (!achievementData) return null
      
      return {
        ...achievementData,
        earnedAt: typeof ach === 'object' ? ach.earnedAt : null
      }
    }).filter(Boolean)
    
    res.json({ 
      achievements: childAchievements,
      totalPoints: childAchievements.reduce((sum, a) => sum + (a.points || 0), 0)
    })
  } catch (error) {
    console.error('Error fetching child achievements:', error)
    res.status(500).json({ error: 'Failed to fetch child achievements' })
  }
})

// POST /api/achievements/award - Bolaga yutuq berish
router.post('/award', authenticateToken, async (req, res) => {
  try {
    const { childId, achievementId } = req.body
    
    if (!childId || !achievementId) {
      return res.status(400).json({ error: 'childId va achievementId kerak' })
    }
    
    const children = readData('children.json') || []
    const achievements = readData('achievements.json') || []
    
    const childIndex = children.findIndex(c => c.id === childId)
    if (childIndex === -1) {
      return res.status(404).json({ error: 'Bola topilmadi' })
    }
    
    const achievement = achievements.find(a => a.id === achievementId)
    if (!achievement) {
      return res.status(404).json({ error: 'Yutuq topilmadi' })
    }
    
    // Bolaning yutuqlarini tekshirish
    const child = children[childIndex]
    if (!child.achievements) {
      child.achievements = []
    }
    
    // Allaqachon berilganmi tekshirish
    const alreadyAwarded = child.achievements.some(a => {
      const id = typeof a === 'string' ? a : a.achievementId
      return id === achievementId
    })
    
    if (alreadyAwarded) {
      return res.status(400).json({ error: 'Bu yutuq allaqachon berilgan' })
    }
    
    // Yutuqni qo'shish
    child.achievements.push({
      achievementId,
      earnedAt: new Date().toISOString(),
      awardedBy: req.user?.username || 'admin'
    })
    
    // Ballni qo'shish
    child.points = (child.points || 0) + (achievement.points || 0)
    
    // Saqlash
    children[childIndex] = child
    writeData('children.json', children)
    
    res.json({ 
      message: 'Yutuq berildi!',
      achievement,
      newPoints: child.points
    })
  } catch (error) {
    console.error('Error awarding achievement:', error)
    res.status(500).json({ error: 'Yutuq berishda xatolik' })
  }
})

// POST /api/achievements - Yangi yutuq qo'shish
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, icon, color, points } = req.body
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' })
    }
    
    const achievements = readData('achievements.json') || []
    
    const newAchievement = {
      id: uuidv4(),
      name,
      description: description || {},
      icon: icon || '⭐',
      color: color || '#f59e0b',
      points: points || 10,
      createdAt: new Date().toISOString()
    }
    
    achievements.push(newAchievement)
    writeData('achievements.json', achievements)
    res.status(201).json(newAchievement)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create achievement' })
  }
})

// DELETE /api/achievements/:id (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const achievements = readData('achievements.json') || []
    const index = achievements.findIndex(a => a.id === req.params.id)
    
    if (index === -1) {
      return res.status(404).json({ error: 'Achievement not found' })
    }
    
    // Soft delete
    achievements[index].isDeleted = true
    achievements[index].deletedAt = new Date().toISOString()
    achievements[index].deletedBy = req.user?.username || 'admin'
    writeData('achievements.json', achievements)
    res.json({ message: 'Achievement deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete achievement' })
  }
})

export default router
