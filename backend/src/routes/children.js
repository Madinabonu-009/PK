import express from 'express'
import mongoose from 'mongoose'
import { authenticateToken } from '../middleware/auth.js'
import logger from '../utils/logger.js'

const router = express.Router()

const getCollection = (name) => mongoose.connection.collection(name)

// GET /api/children/public
router.get('/public', async (req, res) => {
  try {
    const children = await getCollection('children').find({ 
      isActive: { $ne: false }, 
      isDeleted: { $ne: true } 
    }).toArray()
    
    res.json(children.map(c => ({
      id: c._id || c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      birthDate: c.birthDate,
      groupId: c.groupId,
      groupName: c.groupName,
      photo: c.photo,
      points: c.points || 0,
      level: c.level || 1,
      achievements: c.achievements || [],
      gender: c.gender
    })))
  } catch (error) {
    logger.error('Public children fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch children' })
  }
})

// GET /api/children
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, groupId, page = 1, limit = 50 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    let query = { isDeleted: { $ne: true } }
    if (groupId) query.groupId = groupId
    
    let children = await getCollection('children').find(query).toArray()
    
    if (search) {
      const s = search.toLowerCase()
      children = children.filter(c => 
        c.firstName?.toLowerCase().includes(s) || 
        c.lastName?.toLowerCase().includes(s)
      )
    }
    
    const total = children.length
    const paginated = children.slice(skip, skip + parseInt(limit))
    
    res.json({
      data: paginated.map(c => ({ ...c, id: c._id || c.id })),
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    })
  } catch (error) {
    logger.error('Children fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch children' })
  }
})

// GET /api/children/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const children = await getCollection('children').find({}).toArray()
    const child = children.find(c => (c._id?.toString() || c.id) === req.params.id)
    if (!child) return res.status(404).json({ error: 'Child not found' })
    res.json({ ...child, id: child._id || child.id })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch child' })
  }
})

// POST /api/children
router.post('/', authenticateToken, async (req, res) => {
  try {
    const newChild = {
      ...req.body,
      points: 0,
      level: 1,
      achievements: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    const result = await getCollection('children').insertOne(newChild)
    res.status(201).json({ ...newChild, id: result.insertedId })
  } catch (error) {
    logger.error('Create child error:', error)
    res.status(500).json({ error: 'Failed to create child' })
  }
})

// PUT /api/children/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const children = await getCollection('children').find({}).toArray()
    const child = children.find(c => (c._id?.toString() || c.id) === req.params.id)
    
    if (!child) return res.status(404).json({ error: 'Child not found' })
    
    const updateData = { ...req.body, updatedAt: new Date() }
    
    if (child._id) {
      await getCollection('children').updateOne({ _id: child._id }, { $set: updateData })
    } else {
      await getCollection('children').updateOne({ id: child.id }, { $set: updateData })
    }
    
    res.json({ ...child, ...updateData, id: child._id || child.id })
  } catch (error) {
    logger.error('Update child error:', error)
    res.status(500).json({ error: 'Failed to update child' })
  }
})

// DELETE /api/children/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const children = await getCollection('children').find({}).toArray()
    const child = children.find(c => (c._id?.toString() || c.id) === req.params.id)
    
    if (!child) return res.status(404).json({ error: 'Child not found' })
    
    if (child._id) {
      await getCollection('children').updateOne({ _id: child._id }, { $set: { isDeleted: true, deletedAt: new Date() } })
    } else {
      await getCollection('children').updateOne({ id: child.id }, { $set: { isDeleted: true, deletedAt: new Date() } })
    }
    
    res.json({ success: true, message: 'Child deleted' })
  } catch (error) {
    logger.error('Delete child error:', error)
    res.status(500).json({ error: 'Failed to delete child' })
  }
})

// POST /api/children/:id/points
router.post('/:id/points', authenticateToken, async (req, res) => {
  try {
    const { points } = req.body
    const children = await getCollection('children').find({}).toArray()
    const child = children.find(c => (c._id?.toString() || c.id) === req.params.id)
    
    if (!child) return res.status(404).json({ error: 'Child not found' })
    
    const newPoints = (child.points || 0) + points
    const newLevel = Math.floor(newPoints / 100) + 1
    
    if (child._id) {
      await getCollection('children').updateOne({ _id: child._id }, { $set: { points: newPoints, level: newLevel } })
    } else {
      await getCollection('children').updateOne({ id: child.id }, { $set: { points: newPoints, level: newLevel } })
    }
    
    res.json({ ...child, points: newPoints, level: newLevel })
  } catch (error) {
    res.status(500).json({ error: 'Failed to add points' })
  }
})

export default router
