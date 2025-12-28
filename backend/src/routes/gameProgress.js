import express from 'express'
import mongoose from 'mongoose'

const router = express.Router()

const getCollection = (name) => mongoose.connection.collection(name)

const normalizeDoc = (doc) => {
  if (!doc) return null
  const { _id, ...rest } = doc
  return { id: _id.toString(), ...rest }
}

// GET /api/game-progress/:childId
router.get('/:childId', async (req, res) => {
  try {
    const progress = await getCollection('gameprogress')
      .find({ childId: req.params.childId })
      .toArray()
    res.json(progress.map(normalizeDoc))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch game progress' })
  }
})

// GET /api/game-progress/:childId/stats
router.get('/:childId/stats', async (req, res) => {
  try {
    const progress = await getCollection('gameprogress')
      .find({ childId: req.params.childId })
      .toArray()
    
    const stats = {
      totalGames: progress.length,
      totalScore: progress.reduce((sum, p) => sum + (p.score || 0), 0),
      totalTime: progress.reduce((sum, p) => sum + (p.timeSpent || 0), 0),
      completedGames: progress.filter(p => p.completed).length
    }
    
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// GET /api/game-progress/:childId/recommendations
router.get('/:childId/recommendations', async (req, res) => {
  try {
    const progress = await getCollection('gameprogress')
      .find({ childId: req.params.childId })
      .toArray()

    const playedGames = progress.map(p => p.gameType)
    const allGames = ['memory', 'puzzle', 'math', 'letters', 'colors', 'shapes']
    const recommendations = allGames.filter(g => !playedGames.includes(g))
    
    res.json(recommendations)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recommendations' })
  }
})

// POST /api/game-progress/session
router.post('/session', async (req, res) => {
  try {
    const { childId, gameType, score, maxScore, timeSpent, completed } = req.body
    
    if (!childId || !gameType) {
      return res.status(400).json({ error: 'childId and gameType are required' })
    }
    
    const progressData = {
      id: `gp_${Date.now()}`,
      childId,
      gameType,
      score: score || 0,
      maxScore: maxScore || 100,
      timeSpent: timeSpent || 0,
      completed: completed !== false,
      playedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
    
    await getCollection('gameprogress').insertOne(progressData)
    
    res.status(201).json(progressData)
  } catch (error) {
    res.status(500).json({ error: 'Failed to save game session' })
  }
})

// GET /api/game-progress/:childId/:gameType
router.get('/:childId/:gameType', async (req, res) => {
  try {
    const progress = await getCollection('gameprogress').findOne({
      childId: req.params.childId,
      gameType: req.params.gameType
    })
    
    res.json(progress ? { id: progress._id.toString(), ...progress } : { message: 'No progress found' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch game progress' })
  }
})

export default router
