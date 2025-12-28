import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { readData, writeData } from '../utils/db.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// GET /api/questions - Foydalanuvchi o'z savollarini ko'rish (telefon raqami bilan)
router.get('/', async (req, res) => {
  try {
    const { phone } = req.query
    let questions = readData('questions.json') || []
    
    // Filter out soft-deleted questions
    questions = questions.filter(q => !q.isDeleted)
    
    if (phone) {
      // Faqat o'z savollarini ko'rsin
      questions = questions.filter(q => q.parentPhone === phone)
    }
    
    questions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    res.json(questions)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' })
  }
})

// GET /api/questions/all - Admin uchun barcha savollar
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const { status, includeDeleted } = req.query
    let questions = readData('questions.json') || []
    
    // Filter out soft-deleted unless admin requests them
    if (includeDeleted !== 'true') {
      questions = questions.filter(q => !q.isDeleted)
    }
    
    if (status) {
      questions = questions.filter(q => q.status === status)
    }
    
    questions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    res.json(questions)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' })
  }
})

// POST /api/questions - Yangi savol yuborish
router.post('/', async (req, res) => {
  try {
    const { question, parentName, parentPhone, childId } = req.body
    
    if (!question || !parentName || !parentPhone) {
      return res.status(400).json({ error: 'Question, name and phone are required' })
    }
    
    const questions = readData('questions.json') || []
    
    const newQuestion = {
      id: uuidv4(),
      question,
      parentName,
      parentPhone,
      childId: childId || null,
      status: 'pending',
      answerText: null,
      answeredAt: null,
      answeredBy: null,
      createdAt: new Date().toISOString()
    }
    
    questions.push(newQuestion)
    writeData('questions.json', questions)
    
    res.status(201).json({
      message: 'Savolingiz qabul qilindi. Tez orada javob beramiz.',
      question: newQuestion
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit question' })
  }
})

// PUT /api/questions/:id/answer - Savolga javob berish (admin)
router.put('/:id/answer', authenticateToken, async (req, res) => {
  try {
    const { answerText } = req.body
    
    if (!answerText) {
      return res.status(400).json({ error: 'Answer text is required' })
    }
    
    const questions = readData('questions.json') || []
    const index = questions.findIndex(q => q.id === req.params.id)
    
    if (index === -1) {
      return res.status(404).json({ error: 'Question not found' })
    }
    
    questions[index].answerText = answerText
    questions[index].status = 'answered'
    questions[index].answeredAt = new Date().toISOString()
    questions[index].answeredBy = req.user.username || 'admin'
    questions[index].seen = false // Yangi javob - hali ko'rilmagan
    
    writeData('questions.json', questions)
    res.json(questions[index])
  } catch (error) {
    res.status(500).json({ error: 'Failed to answer question' })
  }
})

// PUT /api/questions/:id/seen - Javobni ko'rilgan deb belgilash
router.put('/:id/seen', async (req, res) => {
  try {
    const questions = readData('questions.json') || []
    const index = questions.findIndex(q => q.id === req.params.id)
    
    if (index === -1) {
      return res.status(404).json({ error: 'Question not found' })
    }
    
    questions[index].seen = true
    writeData('questions.json', questions)
    res.json(questions[index])
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as seen' })
  }
})

// DELETE /api/questions/:id - Savolni o'chirish (admin) - soft delete
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const questions = readData('questions.json') || []
    const index = questions.findIndex(q => q.id === req.params.id)
    
    if (index === -1) {
      return res.status(404).json({ error: 'Question not found' })
    }
    
    // Soft delete
    questions[index].isDeleted = true
    questions[index].deletedAt = new Date().toISOString()
    questions[index].deletedBy = req.user?.username || 'admin'
    writeData('questions.json', questions)
    res.json({ message: 'Question deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete question' })
  }
})

export default router