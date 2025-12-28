import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { readData, writeData } from '../utils/db.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// GET /api/feedback - Tasdiqlangan sharhlarni olish (public)
router.get('/', async (req, res) => {
  try {
    const { type } = req.query
    let feedback = readData('feedback.json') || []
    
    // Agar type berilmagan bo'lsa - faqat tasdiqlangan feedback
    if (!type) {
      feedback = feedback.filter(f => f.isApproved && f.type === 'feedback')
    } else if (type === 'question') {
      // Savollar uchun - barchasini qaytarish (chat uchun)
      feedback = feedback.filter(f => f.type === 'question')
    }
    
    feedback.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    res.json(feedback)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch feedback' })
  }
})

// GET /api/feedback/stats - Statistika
router.get('/stats', async (req, res) => {
  try {
    let feedback = readData('feedback.json') || []
    feedback = feedback.filter(f => f.isApproved && f.type === 'feedback')
    
    const totalRatings = feedback.length
    const averageRating = totalRatings > 0 
      ? (feedback.reduce((sum, f) => sum + f.rating, 0) / totalRatings).toFixed(1)
      : 0
    
    res.json({
      totalRatings,
      averageRating: parseFloat(averageRating)
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// GET /api/feedback/pending - Tasdiqlanmagan fikrlar (admin)
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    let feedback = readData('feedback.json') || []
    feedback = feedback.filter(f => !f.isApproved)
    feedback.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    res.json(feedback)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending feedback' })
  }
})

// GET /api/feedback/all - Admin uchun barcha sharhlar
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query
    let feedback = readData('feedback.json') || []
    
    // Faqat feedback type
    feedback = feedback.filter(f => f.type === 'feedback')
    
    if (status === 'pending') {
      feedback = feedback.filter(f => !f.isApproved)
    } else if (status === 'approved') {
      feedback = feedback.filter(f => f.isApproved)
    }
    
    feedback.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    res.json(feedback)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch feedback' })
  }
})

// POST /api/feedback - Yangi sharh yoki savol qo'shish
router.post('/', async (req, res) => {
  try {
    const { type, rating, comment, parentName, parentPhone, parentEmail, targetName } = req.body
    
    // Savol uchun rating shart emas
    if (type !== 'question') {
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' })
      }
    }
    
    if (!comment) {
      return res.status(400).json({ error: 'Comment is required' })
    }
    
    const feedback = readData('feedback.json') || []
    
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
    
    // Savol uchun qo'shimcha maydonlar
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
    
    feedback.push(newFeedback)
    writeData('feedback.json', feedback)
    
    res.status(201).json({
      message: type === 'question' 
        ? 'Savolingiz qabul qilindi. Tez orada javob beramiz.'
        : 'Fikringiz qabul qilindi. Admin tasdiqlashidan keyin ko\'rinadi.',
      feedback: newFeedback
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit feedback' })
  }
})

// PUT /api/feedback/:id/approve - Tasdiqlash (admin)
router.put('/:id/approve', authenticateToken, async (req, res) => {
  try {
    const feedback = readData('feedback.json') || []
    const index = feedback.findIndex(f => f.id === req.params.id)
    
    if (index === -1) {
      return res.status(404).json({ error: 'Feedback not found' })
    }
    
    feedback[index].isApproved = true
    feedback[index].approvedAt = new Date().toISOString()
    
    writeData('feedback.json', feedback)
    res.json(feedback[index])
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve feedback' })
  }
})

// PUT /api/feedback/:id - Feedbackni yangilash (chat javoblari uchun)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const feedback = readData('feedback.json') || []
    const index = feedback.findIndex(f => f.id === req.params.id)
    
    if (index === -1) {
      return res.status(404).json({ error: 'Feedback not found' })
    }
    
    // Yangilash mumkin bo'lgan maydonlar
    const { messages, status, answeredAt, answeredBy, isApproved } = req.body
    
    if (messages) feedback[index].messages = messages
    if (status) feedback[index].status = status
    if (answeredAt) feedback[index].answeredAt = answeredAt
    if (answeredBy) feedback[index].answeredBy = answeredBy
    if (isApproved !== undefined) feedback[index].isApproved = isApproved
    
    // Javob berilganda avtomatik tasdiqlash
    if (status === 'answered') {
      feedback[index].isApproved = true
    }
    
    feedback[index].updatedAt = new Date().toISOString()
    
    writeData('feedback.json', feedback)
    res.json(feedback[index])
  } catch (error) {
    res.status(500).json({ error: 'Failed to update feedback' })
  }
})

// DELETE /api/feedback/:id - O'chirish (admin) - soft delete
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    let feedback = readData('feedback.json') || []
    const index = feedback.findIndex(f => f.id === req.params.id)
    if (index === -1) return res.status(404).json({ error: 'Feedback not found' })
    
    // Soft delete
    feedback[index].isDeleted = true
    feedback[index].deletedAt = new Date().toISOString()
    feedback[index].deletedBy = req.user?.id || 'unknown'
    
    writeData('feedback.json', feedback)
    res.json({ message: 'Feedback deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete feedback' })
  }
})

export default router