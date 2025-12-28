import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import mongoose from 'mongoose'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

const getCollection = (name) => mongoose.connection.collection(name)

const normalizeDoc = (doc) => {
  if (!doc) return null
  const { _id, ...rest } = doc
  return { id: _id.toString(), ...rest }
}

// GET /api/journal
router.get('/', async (req, res) => {
  try {
    const { type, groupId, limit } = req.query
    let query = { isDeleted: { $ne: true }, isPublic: { $ne: false } }
    
    if (type) query.type = type
    if (groupId) query.groupId = groupId
    
    let cursor = getCollection('journal').find(query).sort({ date: -1 })
    if (limit) cursor = cursor.limit(parseInt(limit))
    
    const journal = await cursor.toArray()
    res.json(journal.map(normalizeDoc))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch journal' })
  }
})

// GET /api/journal/:id
router.get('/:id', async (req, res) => {
  try {
    let entry
    try {
      entry = await getCollection('journal').findOne({ 
        _id: new mongoose.Types.ObjectId(req.params.id),
        isDeleted: { $ne: true }
      })
    } catch {
      entry = await getCollection('journal').findOne({ 
        id: req.params.id,
        isDeleted: { $ne: true }
      })
    }
    
    if (!entry) return res.status(404).json({ error: 'Journal entry not found' })
    res.json(normalizeDoc(entry))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch journal entry' })
  }
})


// POST /api/journal
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, type, mediaUrl, groupId, groupName, date, tags } = req.body
    
    if (!title || !mediaUrl) {
      return res.status(400).json({ error: 'Title and mediaUrl are required' })
    }
    
    const newEntry = {
      id: uuidv4(),
      title,
      description: description || '',
      type: type || 'photo',
      mediaUrl,
      thumbnailUrl: type === 'video' ? mediaUrl.replace('.mp4', '_thumb.jpg') : mediaUrl,
      groupId,
      groupName,
      date: date || new Date().toISOString(),
      uploadedBy: req.user.username,
      isPublic: true,
      tags: tags || [],
      createdAt: new Date().toISOString()
    }
    
    await getCollection('journal').insertOne(newEntry)
    res.status(201).json(normalizeDoc(newEntry))
  } catch (error) {
    res.status(500).json({ error: 'Failed to create journal entry' })
  }
})

// PUT /api/journal/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    let filter
    try {
      filter = { _id: new mongoose.Types.ObjectId(req.params.id) }
    } catch {
      filter = { id: req.params.id }
    }

    const result = await getCollection('journal').findOneAndUpdate(
      filter,
      { $set: { ...req.body, updatedAt: new Date().toISOString() } },
      { returnDocument: 'after' }
    )
    
    const entry = result.value || result
    if (!entry) return res.status(404).json({ error: 'Journal entry not found' })
    res.json(normalizeDoc(entry))
  } catch (error) {
    res.status(500).json({ error: 'Failed to update journal entry' })
  }
})

// DELETE /api/journal/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    let filter
    try {
      filter = { _id: new mongoose.Types.ObjectId(req.params.id) }
    } catch {
      filter = { id: req.params.id }
    }

    const result = await getCollection('journal').findOneAndUpdate(
      filter,
      { $set: {
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: req.user?.username || 'admin'
      }},
      { returnDocument: 'after' }
    )
    
    if (!result.value && !result._id) return res.status(404).json({ error: 'Journal entry not found' })
    res.json({ message: 'Journal entry deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete journal entry' })
  }
})

export default router
