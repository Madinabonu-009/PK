import express from 'express'
import mongoose from 'mongoose'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()
const getCollection = (name) => mongoose.connection.collection(name)

// GET /api/daily-reports
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { date, childId, groupId, page = 1, limit = 20 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    let reports = await getCollection('dailyreports').find({ isDeleted: { $ne: true } }).toArray()
    const children = await getCollection('children').find({}).toArray()
    
    if (date) reports = reports.filter(r => r.date === date)
    if (childId) reports = reports.filter(r => r.childId === childId)
    if (groupId) {
      const groupChildIds = children.filter(c => c.groupId === groupId).map(c => c._id?.toString() || c.id)
      reports = reports.filter(r => groupChildIds.includes(r.childId))
    }
    
    reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    const total = reports.length
    const paginated = reports.slice(skip, skip + parseInt(limit))
    
    const result = paginated.map(report => {
      const child = children.find(c => (c._id?.toString() || c.id) === report.childId)
      return {
        ...report,
        id: report._id || report.id,
        childName: child ? `${child.firstName} ${child.lastName}` : 'Noma\'lum',
        childPhoto: child?.photo
      }
    })
    
    res.json({ data: result, pagination: { page: parseInt(page), limit: parseInt(limit), total } })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' })
  }
})

// GET /api/daily-reports/today-menu
router.get('/today-menu', authenticateToken, async (req, res) => {
  try {
    const menu = await getCollection('menu').findOne({})
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const today = days[new Date().getDay()]
    res.json(menu?.days?.[today] || menu?.[today] || {})
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu' })
  }
})

// GET /api/daily-reports/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const reports = await getCollection('dailyreports').find({}).toArray()
    const report = reports.find(r => (r._id?.toString() || r.id) === req.params.id)
    if (!report) return res.status(404).json({ error: 'Report not found' })
    res.json({ ...report, id: report._id || report.id })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch report' })
  }
})

// POST /api/daily-reports
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { childId } = req.body
    const today = new Date().toISOString().split('T')[0]
    
    const reports = await getCollection('dailyreports').find({}).toArray()
    const existing = reports.find(r => r.childId === childId && r.date === today)
    if (existing) return res.status(400).json({ error: 'Report already exists for today' })
    
    const newReport = {
      ...req.body,
      date: today,
      createdBy: req.user.id,
      createdAt: new Date()
    }
    const result = await getCollection('dailyreports').insertOne(newReport)
    res.status(201).json({ ...newReport, id: result.insertedId })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create report' })
  }
})

// PUT /api/daily-reports/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const reports = await getCollection('dailyreports').find({}).toArray()
    const report = reports.find(r => (r._id?.toString() || r.id) === req.params.id)
    if (!report) return res.status(404).json({ error: 'Report not found' })
    
    const updateData = { ...req.body, updatedAt: new Date() }
    if (report._id) {
      await getCollection('dailyreports').updateOne({ _id: report._id }, { $set: updateData })
    } else {
      await getCollection('dailyreports').updateOne({ id: report.id }, { $set: updateData })
    }
    res.json({ ...report, ...updateData })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update report' })
  }
})

// POST /api/daily-reports/:childId/arrival
router.post('/:childId/arrival', authenticateToken, async (req, res) => {
  try {
    const { childId } = req.params
    const { time, broughtBy, condition, notes } = req.body
    const today = new Date().toISOString().split('T')[0]
    
    const reports = await getCollection('dailyreports').find({}).toArray()
    let report = reports.find(r => r.childId === childId && r.date === today)
    
    if (!report) {
      report = { childId, date: today, createdBy: req.user.id, createdAt: new Date() }
      const result = await getCollection('dailyreports').insertOne(report)
      report._id = result.insertedId
    }
    
    const arrival = { time: time || new Date().toTimeString().slice(0, 5), broughtBy, condition: condition || 'good', notes }
    await getCollection('dailyreports').updateOne({ _id: report._id }, { $set: { arrival } })
    
    res.json({ ...report, arrival })
  } catch (error) {
    res.status(500).json({ error: 'Failed to record arrival' })
  }
})

// POST /api/daily-reports/:childId/departure
router.post('/:childId/departure', authenticateToken, async (req, res) => {
  try {
    const { childId } = req.params
    const { time, pickedUpBy, condition, notes } = req.body
    const today = new Date().toISOString().split('T')[0]
    
    const reports = await getCollection('dailyreports').find({}).toArray()
    const report = reports.find(r => r.childId === childId && r.date === today)
    if (!report) return res.status(404).json({ error: 'No report found for today' })
    
    const departure = { time: time || new Date().toTimeString().slice(0, 5), pickedUpBy, condition: condition || 'good', notes }
    await getCollection('dailyreports').updateOne({ _id: report._id }, { $set: { departure } })
    
    res.json({ ...report, departure })
  } catch (error) {
    res.status(500).json({ error: 'Failed to record departure' })
  }
})

// POST /api/daily-reports/:childId/meal/:mealType
router.post('/:childId/meal/:mealType', authenticateToken, async (req, res) => {
  try {
    const { childId, mealType } = req.params
    const { items, eaten, notes, appetite } = req.body
    const today = new Date().toISOString().split('T')[0]
    
    const reports = await getCollection('dailyreports').find({}).toArray()
    const report = reports.find(r => r.childId === childId && r.date === today)
    if (!report) return res.status(404).json({ error: 'No report found for today' })
    
    const meals = report.meals || {}
    meals[mealType] = { items, eaten, notes, appetite: appetite || 'good', recordedAt: new Date() }
    
    await getCollection('dailyreports').updateOne({ _id: report._id }, { $set: { meals } })
    res.json({ ...report, meals })
  } catch (error) {
    res.status(500).json({ error: 'Failed to record meal' })
  }
})

// GET /api/daily-reports/child/:childId/history
router.get('/child/:childId/history', authenticateToken, async (req, res) => {
  try {
    const { childId } = req.params
    const { limit = 30 } = req.query
    
    const reports = await getCollection('dailyreports').find({ childId }).sort({ date: -1 }).limit(parseInt(limit)).toArray()
    res.json(reports.map(r => ({ ...r, id: r._id || r.id })))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' })
  }
})

// DELETE /api/daily-reports/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const reports = await getCollection('dailyreports').find({}).toArray()
    const report = reports.find(r => (r._id?.toString() || r.id) === req.params.id)
    if (!report) return res.status(404).json({ error: 'Report not found' })
    
    if (report._id) {
      await getCollection('dailyreports').updateOne({ _id: report._id }, { $set: { isDeleted: true, deletedAt: new Date() } })
    } else {
      await getCollection('dailyreports').updateOne({ id: report.id }, { $set: { isDeleted: true, deletedAt: new Date() } })
    }
    res.json({ success: true, message: 'Report deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete report' })
  }
})

export default router
