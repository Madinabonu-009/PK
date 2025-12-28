import express from 'express'
import mongoose from 'mongoose'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

const getCollection = (name) => mongoose.connection.collection(name)

const normalizeDoc = (doc) => {
  if (!doc) return null
  const { _id, ...rest } = doc
  return { id: _id.toString(), ...rest }
}

// Bugungi story (public)
router.get('/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const todayStory = await getCollection('stories').findOne({ date: today, isDeleted: { $ne: true } })
    
    if (todayStory) {
      await getCollection('stories').updateOne(
        { _id: todayStory._id },
        { $inc: { views: 1 } }
      )
    }
    
    res.json(todayStory ? normalizeDoc(todayStory) : null)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Barcha storylar (admin)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const stories = await getCollection('stories')
      .find({ isDeleted: { $ne: true } })
      .sort({ date: -1 })
      .toArray()
    res.json(stories.map(normalizeDoc))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Yangi story yaratish
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { date, media, description } = req.body
    const storyDate = date || new Date().toISOString().split('T')[0]

    const existing = await getCollection('stories').findOne({ date: storyDate, isDeleted: { $ne: true } })
    if (existing) {
      return res.status(400).json({ error: 'Bu kun uchun story allaqachon mavjud' })
    }
    
    const newStory = {
      id: `story${Date.now()}`,
      date: storyDate,
      media: media || [],
      description: description || '',
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      views: 0
    }
    
    await getCollection('stories').insertOne(newStory)
    res.status(201).json(normalizeDoc(newStory))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Story yangilash
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    let filter
    try {
      filter = { _id: new mongoose.Types.ObjectId(req.params.id) }
    } catch {
      filter = { id: req.params.id }
    }

    const { media, description } = req.body
    const updateData = { updatedAt: new Date().toISOString() }
    if (media) updateData.media = media
    if (description !== undefined) updateData.description = description

    const result = await getCollection('stories').findOneAndUpdate(
      filter,
      { $set: updateData },
      { returnDocument: 'after' }
    )
    
    const story = result.value || result
    if (!story) return res.status(404).json({ error: 'Story topilmadi' })
    res.json(normalizeDoc(story))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Media qo'shish
router.post('/:id/media', authenticateToken, async (req, res) => {
  try {
    let filter
    try {
      filter = { _id: new mongoose.Types.ObjectId(req.params.id) }
    } catch {
      filter = { id: req.params.id }
    }

    const { type, url, caption } = req.body
    
    const result = await getCollection('stories').findOneAndUpdate(
      filter,
      { $push: { media: { type: type || 'image', url, caption: caption || '' } } },
      { returnDocument: 'after' }
    )
    
    const story = result.value || result
    if (!story) return res.status(404).json({ error: 'Story topilmadi' })
    res.json(normalizeDoc(story))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Story o'chirish
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    let filter
    try {
      filter = { _id: new mongoose.Types.ObjectId(req.params.id) }
    } catch {
      filter = { id: req.params.id }
    }

    const result = await getCollection('stories').findOneAndUpdate(
      filter,
      { $set: {
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: req.user?.id || 'unknown'
      }},
      { returnDocument: 'after' }
    )
    
    if (!result.value && !result._id) return res.status(404).json({ error: 'Story topilmadi' })
    res.json({ success: true, message: 'Story deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
