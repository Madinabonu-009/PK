/**
 * Health Routes
 * Sog'liq bo'limi API + Health Check endpoints
 */

import express from 'express'
import HealthRecord from '../models/HealthRecord.js'
import { authenticateToken, adminOnly } from '../middleware/auth.js'

const auth = authenticateToken
const adminAuth = [authenticateToken, adminOnly]

const router = express.Router()

// ═══════════════════════════════════════════════════════════════
// 🏥 HEALTH CHECK ENDPOINTS (for deployment)
// ═══════════════════════════════════════════════════════════════

// Basic health check
router.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'play-kids-api'
  })
})

// Detailed health check
router.get('/detailed', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
    env: process.env.NODE_ENV || 'development'
  })
})

// Readiness probe (for Kubernetes/Render)
router.get('/ready', (req, res) => {
  res.json({ status: 'ready' })
})

// Liveness probe (for Kubernetes/Render)
router.get('/live', (req, res) => {
  res.json({ status: 'alive' })
})

// ═══════════════════════════════════════════════════════════════
// 👶 CHILD HEALTH RECORDS
// ═══════════════════════════════════════════════════════════════

// Get health record by child ID
router.get('/child/:childId', auth, async (req, res) => {
  try {
    let record = await HealthRecord.findOne({ childId: req.params.childId })
    
    if (!record) {
      record = new HealthRecord({ childId: req.params.childId })
      await record.save()
    }
    
    res.json(record)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update health record
router.put('/child/:childId', auth, async (req, res) => {
  try {
    const record = await HealthRecord.findOneAndUpdate(
      { childId: req.params.childId },
      { $set: req.body },
      { new: true, upsert: true }
    )
    res.json(record)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Add vaccination
router.post('/child/:childId/vaccination', auth, async (req, res) => {
  try {
    const record = await HealthRecord.findOneAndUpdate(
      { childId: req.params.childId },
      { $push: { vaccinations: req.body } },
      { new: true, upsert: true }
    )
    res.json(record)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Add allergy
router.post('/child/:childId/allergy', auth, async (req, res) => {
  try {
    const record = await HealthRecord.findOneAndUpdate(
      { childId: req.params.childId },
      { $push: { allergies: req.body } },
      { new: true, upsert: true }
    )
    res.json(record)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Add daily health record
router.post('/child/:childId/daily', auth, async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Remove existing record for today
    await HealthRecord.updateOne(
      { childId: req.params.childId },
      { $pull: { dailyRecords: { date: { $gte: today } } } }
    )
    
    const record = await HealthRecord.findOneAndUpdate(
      { childId: req.params.childId },
      { 
        $push: { 
          dailyRecords: { 
            ...req.body, 
            date: new Date(),
            recordedBy: req.user._id 
          } 
        } 
      },
      { new: true, upsert: true }
    )
    res.json(record)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get daily records for date range
router.get('/child/:childId/daily', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const record = await HealthRecord.findOne({ childId: req.params.childId })
    
    if (!record) {
      return res.json([])
    }
    
    let dailyRecords = record.dailyRecords
    
    if (startDate && endDate) {
      dailyRecords = dailyRecords.filter(r => 
        r.date >= new Date(startDate) && r.date <= new Date(endDate)
      )
    }
    
    res.json(dailyRecords.sort((a, b) => b.date - a.date))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get upcoming vaccinations
router.get('/vaccinations/upcoming', adminAuth, async (req, res) => {
  try {
    const records = await HealthRecord.find({
      'vaccinations.nextDue': { 
        $gte: new Date(),
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    }).populate('childId', 'firstName lastName')
    
    const upcoming = []
    records.forEach(record => {
      record.vaccinations.forEach(vac => {
        if (vac.nextDue && vac.nextDue >= new Date()) {
          upcoming.push({
            child: record.childId,
            vaccination: vac
          })
        }
      })
    })
    
    res.json(upcoming.sort((a, b) => a.vaccination.nextDue - b.vaccination.nextDue))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get children with allergies
router.get('/allergies/all', adminAuth, async (req, res) => {
  try {
    const records = await HealthRecord.find({
      'allergies.0': { $exists: true }
    }).populate('childId', 'firstName lastName groupId')
    
    res.json(records.map(r => ({
      child: r.childId,
      allergies: r.allergies
    })))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
