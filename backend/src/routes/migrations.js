/**
 * Migration Management Routes
 * API endpoints for managing database migrations
 */

import express from 'express'
import migrationRunner from '../migrations/index.js'
import { authenticateToken, adminOnly } from '../middleware/auth.js'
import logger from '../utils/logger.js'

const router = express.Router()

/**
 * @swagger
 * /api/migrations/status:
 *   get:
 *     summary: Get migration status
 *     tags: [Migrations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Migration status
 */
router.get('/status', authenticateToken, adminOnly, (req, res) => {
  try {
    const status = migrationRunner.getStatus()
    res.json(status)
  } catch (error) {
    logger.error('Error getting migration status:', error)
    res.status(500).json({ error: 'Failed to get migration status' })
  }
})

/**
 * @swagger
 * /api/migrations/run:
 *   post:
 *     summary: Run pending migrations
 *     tags: [Migrations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Migrations executed
 */
router.post('/run', authenticateToken, adminOnly, async (req, res) => {
  try {
    logger.info('Running pending migrations...')
    const result = await migrationRunner.runPending()
    
    if (result.success) {
      res.json({
        message: `Successfully executed ${result.executed} migrations`,
        ...result
      })
    } else {
      res.status(500).json({
        error: 'Some migrations failed',
        ...result
      })
    }
  } catch (error) {
    logger.error('Error running migrations:', error)
    res.status(500).json({ error: 'Failed to run migrations' })
  }
})

/**
 * @swagger
 * /api/migrations/rollback:
 *   post:
 *     summary: Rollback last migration
 *     tags: [Migrations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Migration rolled back
 */
router.post('/rollback', authenticateToken, adminOnly, async (req, res) => {
  try {
    logger.info('Rolling back last migration...')
    const result = await migrationRunner.rollbackLast()
    
    if (result.success) {
      res.json({
        message: `Successfully rolled back migration ${result.id}`,
        ...result
      })
    } else {
      res.status(400).json({
        error: result.message || 'Rollback failed',
        ...result
      })
    }
  } catch (error) {
    logger.error('Error rolling back migration:', error)
    res.status(500).json({ error: 'Failed to rollback migration' })
  }
})

export default router
