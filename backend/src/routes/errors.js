/**
 * Error Tracking Routes
 * Receives and stores frontend errors
 */

import express from 'express'
import { writeData, readData } from '../utils/db.js'
import logger from '../utils/logger.js'

const router = express.Router()

/**
 * @swagger
 * /errors:
 *   post:
 *     summary: Log frontend error
 *     tags: [Errors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               stack:
 *                 type: string
 *               context:
 *                 type: object
 *     responses:
 *       200:
 *         description: Error logged successfully
 */
router.post('/', async (req, res) => {
  try {
    const errorData = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...req.body,
      ip: req.ip,
      receivedAt: new Date().toISOString()
    }

    // Log to Winston
    logger.error('Frontend error', errorData)

    // Store in file (optional - for analysis)
    const errors = readData('errors.json') || []
    errors.push(errorData)

    // Keep only last 1000 errors
    if (errors.length > 1000) {
      errors.splice(0, errors.length - 1000)
    }

    writeData('errors.json', errors)

    // TODO: Send to external service (Sentry, LogRocket, etc.)

    res.json({ success: true, id: errorData.id })
  } catch (error) {
    logger.error('Failed to log frontend error:', error)
    res.status(500).json({ error: 'Failed to log error' })
  }
})

/**
 * @swagger
 * /errors/stats:
 *   get:
 *     summary: Get error statistics
 *     tags: [Errors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Error statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const errors = readData('errors.json') || []
    
    // Calculate stats
    const now = Date.now()
    const last24h = errors.filter(e => 
      now - new Date(e.timestamp).getTime() < 24 * 60 * 60 * 1000
    )
    const last7d = errors.filter(e => 
      now - new Date(e.timestamp).getTime() < 7 * 24 * 60 * 60 * 1000
    )

    // Group by message
    const byMessage = {}
    errors.forEach(e => {
      const msg = e.message || 'Unknown'
      byMessage[msg] = (byMessage[msg] || 0) + 1
    })

    // Top errors
    const topErrors = Object.entries(byMessage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([message, count]) => ({ message, count }))

    res.json({
      total: errors.length,
      last24h: last24h.length,
      last7d: last7d.length,
      topErrors,
      recentErrors: errors.slice(-10).reverse()
    })
  } catch (error) {
    logger.error('Failed to get error stats:', error)
    res.status(500).json({ error: 'Failed to get stats' })
  }
})

export default router
