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

// GET /api/feedback
router.get('/', async (req, res) => {
  try {
    const { type } = req.query
    let query = { isDeleted: { $ne: true } }
    
    if (!type) {
      query.isApproved = true
      query.type = 'feedback'
    } else if (type === 'question') {
      query.type = 'question'
    }
    
    const feedback = await getCollection('feedback')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()
    
    res.json(feedback.map(normalizeDoc))
  } catch (error) {
    console.error('Feedback fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch feedback' })
  }
})

// GET /api/feedback/stats
router.get('/stats', async (req, res) => {
  try {
    const feedback = await getCollection('feedback')
      .find({ isApproved: true, type: 'feedback', isDeleted: { $ne: true } })
      .toArray()
    
    const totalRatings = feedback.length
    const averageRating = totalRatings > 0 
      ? (feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / totalRatings).toFixed(1)
      : 0
    
    res.json({
      totalRatings,
      averageRating: parseFloat(averageRating)
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// GET /api/feedback/pending
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    const feedback = await getCollection('feedback')
      .find({ isApproved: { $ne: true }, isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .toArray()
    
    res.json(feedback.map(normalizeDoc))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending feedback' })
  }
})

// GET /api/feedback/all
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query
    let query = { type: 'feedback', isDeleted: { $ne: true } }
    
    if (status === 'pending') {
      query.isApproved = { $ne: true }
    } else if (status === 'approved') {
      query.isApproved = true
    }
    
    const feedback = await getCollection('feedback')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()
    
    res.json(feedback.map(normalizeDoc))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch feedback' })
  }
})

// POST /api/feedback
router.post('/', async (req, res) => {
  try {
    const { type, rating, comment, parentName, parentPhone, parentEmail, targetName } = req.body
    
    if (type !== 'question') {
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' })
      }
    }
    
    if (!comment) {
      return res.status(400).json({ error: 'Comment is required' })
    }
    
    const newFeedback = {
      id: uuidv4(),
      type: type || 'feedback',
      rating: parseInt(rating) || 5,
      comment,
      parentName: parentName || 'Anonim',
      parentPhone: parentPhone || null,
      parentEmail: parentEmail || parentPhone || null,
      targetName: targetName || null,
      isApproved: false,
      createdAt: new Date().toISOString()
    }
    
    if (type === 'question') {
      newFeedback.messages = [{
        id: 1,
        type: 'parent',
        text: comment,
        time: new Date().toISOString(),
        name: parentName || 'Ota-ona'
      }]
      newFeedback.status = 'pending'
    }
    
    await getCollection('feedback').insertOne(newFeedback)
    
    res.status(201).json({
      message: type === 'question' 
        ? 'Savolingiz qabul qilindi. Tez orada javob beramiz.'
        : 'Fikringiz qabul qilindi. Admin tasdiqlashidan keyin ko\'rinadi.',
      feedback: normalizeDoc(newFeedback)
    })
  } catch (error) {
    console.error('Feedback create error:', error)
    res.status(500).json({ error: 'Failed to submit feedback' })
  }
})

// PUT /api/feedback/:id/approve
router.put('/:id/approve', authenticateToken, async (req, res) => {
  try {
    let filter
    try {
      filter = { _id: new mongoose.Types.ObjectId(req.params.id) }
    } catch {
      filter = { id: req.params.id }
    }

    const result = await getCollection('feedback').findOneAndUpdate(
      filter,
      { $set: { isApproved: true, approvedAt: new Date().toISOString() } },
      { returnDocument: 'after' }
    )
    
    const feedback = result.value || result
    if (!feedback) return res.status(404).json({ error: 'Feedback not found' })
    res.json(normalizeDoc(feedback))
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve feedback' })
  }
})

// PUT /api/feedback/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    let filter
    try {
      filter = { _id: new mongoose.Types.ObjectId(req.params.id) }
    } catch {
      filter = { id: req.params.id }
    }

    const { messages, status, answeredAt, answeredBy, isApproved } = req.body
    const updateData = { updatedAt: new Date().toISOString() }
    
    if (messages) updateData.messages = messages
    if (status) updateData.status = status
    if (answeredAt) updateData.answeredAt = answeredAt
    if (answeredBy) updateData.answeredBy = answeredBy
    if (isApproved !== undefined) updateData.isApproved = isApproved
    if (status === 'answered') updateData.isApproved = true

    const result = await getCollection('feedback').findOneAndUpdate(
      filter,
      { $set: updateData },
      { returnDocument: 'after' }
    )
    
    const feedback = result.value || result
    if (!feedback) return res.status(404).json({ error: 'Feedback not found' })
    res.json(normalizeDoc(feedback))
  } catch (error) {
    res.status(500).json({ error: 'Failed to update feedback' })
  }
})

// DELETE /api/feedback/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    let filter
    try {
      filter = { _id: new mongoose.Types.ObjectId(req.params.id) }
    } catch {
      filter = { id: req.params.id }
    }

    const result = await getCollection('feedback').findOneAndUpdate(
      filter,
      { $set: {
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: req.user?.id || 'unknown'
      }},
      { returnDocument: 'after' }
    )
    
    if (!result.value && !result._id) return res.status(404).json({ error: 'Feedback not found' })
    res.json({ message: 'Feedback deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete feedback' })
  }
})

export default router
