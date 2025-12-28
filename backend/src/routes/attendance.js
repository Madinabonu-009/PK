import express from 'express'
import mongoose from 'mongoose'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

const getCollection = (name) => mongoose.connection.collection(name)

// GET /api/attendance
router.get('/', authenticateToken, async (req, res) => {
  try {
    const attendance = await getCollection('attendance').find({}).toArray()
    res.json(attendance)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/attendance/today
router.get('/today', authenticateToken, async (req, res) => {
  try {
    const children = await getCollection('children').find({ isDeleted: { $ne: true } }).toArray()
    const today = new Date().toISOString().split('T')[0]
    const attendance = await getCollection('attendance').find({ date: today }).toArray()
    
    const result = children.map(child => {
      const att = attendance.find(a => a.childId === (child._id?.toString() || child.id))
      return {
        childId: child._id || child.id,
        childName: `${child.firstName} ${child.lastName}`,
        groupId: child.groupId,
        photo: child.photo,
        attendance: att || null,
        status: att ? att.status : 'not_marked'
      }
    })
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/attendance/group/:groupId
router.get('/group/:groupId', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params
    const { date } = req.query
    const targetDate = date || new Date().toISOString().split('T')[0]
    
    const children = await getCollection('children').find({ 
      groupId, 
      isDeleted: { $ne: true } 
    }).toArray()
    
    const attendance = await getCollection('attendance').find({ date: targetDate }).toArray()
    
    const result = children.map(child => {
      const childId = child._id?.toString() || child.id
      const att = attendance.find(a => a.childId === childId)
      return {
        childId,
        childName: `${child.firstName} ${child.lastName}`,
        photo: child.photo,
        attendance: att || null,
        status: att ? att.status : 'not_marked'
      }
    })
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/attendance/checkin
router.post('/checkin', authenticateToken, async (req, res) => {
  try {
    const { childId, by, notes } = req.body
    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toTimeString().slice(0, 5)
    
    const children = await getCollection('children').find({}).toArray()
    const child = children.find(c => (c._id?.toString() || c.id) === childId)
    if (!child) return res.status(404).json({ error: 'Bola topilmadi' })
    
    const existing = await getCollection('attendance').findOne({ childId, date: today })
    
    if (existing) {
      await getCollection('attendance').updateOne(
        { _id: existing._id },
        { $set: { checkIn: { time: now, by, notes }, status: 'present' } }
      )
      res.json({ success: true, attendance: { ...existing, checkIn: { time: now, by, notes }, status: 'present' } })
    } else {
      const newAtt = {
        childId,
        date: today,
        checkIn: { time: now, by, notes },
        checkOut: null,
        status: 'present',
        createdAt: new Date()
      }
      await getCollection('attendance').insertOne(newAtt)
      res.json({ success: true, attendance: newAtt })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/attendance/checkout
router.post('/checkout', authenticateToken, async (req, res) => {
  try {
    const { childId, by, notes } = req.body
    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toTimeString().slice(0, 5)
    
    const existing = await getCollection('attendance').findOne({ childId, date: today })
    if (!existing) return res.status(400).json({ error: 'Avval check-in qiling' })
    
    await getCollection('attendance').updateOne(
      { _id: existing._id },
      { $set: { checkOut: { time: now, by, notes } } }
    )
    res.json({ success: true, attendance: { ...existing, checkOut: { time: now, by, notes } } })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/attendance/absent
router.post('/absent', authenticateToken, async (req, res) => {
  try {
    const { childId, reason } = req.body
    const today = new Date().toISOString().split('T')[0]
    
    const existing = await getCollection('attendance').findOne({ childId, date: today })
    
    if (existing) {
      await getCollection('attendance').updateOne(
        { _id: existing._id },
        { $set: { status: 'absent', absentReason: reason } }
      )
      res.json({ success: true })
    } else {
      await getCollection('attendance').insertOne({
        childId,
        date: today,
        status: 'absent',
        absentReason: reason,
        createdAt: new Date()
      })
      res.json({ success: true })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/attendance/stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, groupId } = req.query
    let attendance = await getCollection('attendance').find({}).toArray()
    
    if (startDate) attendance = attendance.filter(a => a.date >= startDate)
    if (endDate) attendance = attendance.filter(a => a.date <= endDate)
    
    if (groupId) {
      const children = await getCollection('children').find({ groupId }).toArray()
      const childIds = children.map(c => c._id?.toString() || c.id)
      attendance = attendance.filter(a => childIds.includes(a.childId))
    }
    
    res.json({
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      attendanceRate: attendance.length > 0 
        ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100) 
        : 0
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/attendance/child/:childId
router.get('/child/:childId', authenticateToken, async (req, res) => {
  try {
    const { childId } = req.params
    const attendance = await getCollection('attendance').find({ childId }).sort({ date: -1 }).toArray()
    res.json(attendance)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
