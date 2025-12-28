import express from 'express'
import GameProgress from '../models/GameProgress.js'

const router = express.Router()

// GET /api/game-progress/:childId - Bola o'yin progressi
router.get('/:childId', async (req, res) => {
  try {
    const progress = await GameProgress.getChildProgress(req.params.childId)
    res.json(progress)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch game progress' })
  }
})

// GET /api/game-progress/:childId/stats - Bola statistikasi
router.get('/:childId/stats', async (req, res) => {
  try {
    const stats = await GameProgress.getChildStats(req.params.childId)
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// GET /api/game-progress/:childId/recommendations - Tavsiyalar
router.get('/:childId/recommendations', async (req, res) => {
  try {
    const recommendations = await GameProgress.getRecommendedGames(req.params.childId)
    res.json(recommendations)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recommendations' })
  }
})

// POST /api/game-progress/session - O'yin sessiyasini saqlash
router.post('/session', async (req, res) => {
  try {
    const { childId, gameType, score, maxScore, timeSpent, completed } = req.body
    
    if (!childId || !gameType) {
      return res.status(400).json({ error: 'childId and gameType are required' })
    }
    
    const progress = await GameProgress.updateGameProgress(childId, gameType, {
      score: score || 0,
      maxScore: maxScore || 100,
      timeSpent: timeSpent || 0,
      completed: completed !== false
    })
    
    res.status(201).json(progress)
  } catch (error) {
    res.status(500).json({ error: 'Failed to save game session' })
  }
})

// GET /api/game-progress/:childId/:gameType - Muayyan o'yin progressi
router.get('/:childId/:gameType', async (req, res) => {
  try {
    const progress = await GameProgress.getGameProgress(req.params.childId, req.params.gameType)
    res.json(progress || { message: 'No progress found' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch game progress' })
  }
})

export default router
