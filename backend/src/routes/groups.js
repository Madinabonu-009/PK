import express from 'express'
import mongoose from 'mongoose'
import { authenticateToken } from '../middleware/auth.js'
import logger from '../utils/logger.js'

const router = express.Router()

// Helper: get collection
const getCollection = (name) => mongoose.connection.collection(name)

// GET /api/groups/public
router.get('/public', async (req, res) => {
  try {
    const groups = await getCollection('groups').find({}).toArray()
    res.json(groups.map(g => ({ id: g._id || g.id, name: g.name, ageRange: g.ageRange })))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch groups' })
  }
})

// GET /api/groups
router.get('/', async (req, res) => {
  try {
    const groups = await getCollection('groups').find({}).toArray()
    const children = await getCollection('children').find({ isDeleted: { $ne: true } }).toArray()
    
    const result = groups.map(g => ({
      ...g,
      id: g._id || g.id,
      childCount: children.filter(c => c.groupId === (g._id?.toString() || g.id)).length
    }))
    res.json(result)
  } catch (error) {
    logger.error('Groups fetch error', { error: error.message })
    res.status(500).json({ error: 'Failed to fetch groups' })
  }
})

// GET /api/groups/:id
router.get('/:id', async (req, res) => {
  try {
    const groups = await getCollection('groups').find({}).toArray()
    const group = groups.find(g => (g._id?.toString() || g.id) === req.params.id)
    if (!group) return res.status(404).json({ error: 'Group not found' })
    res.json({ ...group, id: group._id || group.id })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch group' })
  }
})

// POST /api/groups
router.post('/', authenticateToken, async (req, res) => {
  try {
    const newGroup = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    const result = await getCollection('groups').insertOne(newGroup)
    res.status(201).json({ ...newGroup, id: result.insertedId })
  } catch (error) {
    logger.error('Create group error', { error: error.message })
    res.status(500).json({ error: 'Failed to create group' })
  }
})

// PUT /api/groups/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const groups = await getCollection('groups').find({}).toArray()
    const group = groups.find(g => (g._id?.toString() || g.id) === req.params.id)
    
    if (!group) return res.status(404).json({ error: 'Group not found' })
    
    const updateData = { ...req.body, updatedAt: new Date() }
    
    if (group._id) {
      await getCollection('groups').updateOne({ _id: group._id }, { $set: updateData })
    } else {
      await getCollection('groups').updateOne({ id: group.id }, { $set: updateData })
    }
    
    res.json({ ...group, ...updateData, id: group._id || group.id })
  } catch (error) {
    logger.error('Update group error', { error: error.message })
    res.status(500).json({ error: 'Failed to update group' })
  }
})

// DELETE /api/groups/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const groups = await getCollection('groups').find({}).toArray()
    const group = groups.find(g => (g._id?.toString() || g.id) === req.params.id)
    
    if (!group) return res.status(404).json({ error: 'Group not found' })
    
    const updateData = { isDeleted: true, deletedAt: new Date() }
    
    if (group._id) {
      await getCollection('groups').updateOne({ _id: group._id }, { $set: updateData })
    } else {
      await getCollection('groups').updateOne({ id: group.id }, { $set: updateData })
    }
    
    res.json({ success: true, message: 'Group deleted' })
  } catch (error) {
    logger.error('Delete group error', { error: error.message })
    res.status(500).json({ error: 'Failed to delete group' })
  }
})

export default router
