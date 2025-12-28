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

// GET /api/questions
router.get('/', async (req, res) => {
  try {
    const { phone } = req.query
    let query = { isDeleted: { $ne: true } }
    
    if (phone) query.parentPhone = phone
    
    const questions = await getCollection('questions')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()
    
    res.json(questions.map(normalizeDoc))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' })
  }
})

// GET /api/questions/all
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const { status, includeDeleted } = req.query
    let query = {}
    
    if (includeDeleted !== 'true') query.isDeleted = { $ne: true }
    if (status) query.status = status
    
    const questions = await getCollection('questions')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()
    
    res.json(questions.map(normalizeDoc))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' })
  }
})


// POST /api/questions
router.post('/', async (req, res) => {
  try {
    const { question, parentName, parentPhone, childId } = req.body
    
    if (!question || !parentName || !parentPhone) {
      return res.status(400).json({ error: 'Question, name and phone are required' })
    }
    
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
    
    await getCollection('questions').insertOne(newQuestion)
    
    res.status(201).json({
      message: 'Savolingiz qabul qilindi. Tez orada javob beramiz.',
      question: normalizeDoc(newQuestion)
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit question' })
  }
})

// PUT /api/questions/:id/answer
router.put('/:id/answer', authenticateToken, async (req, res) => {
  try {
    const { answerText } = req.body
    if (!answerText) return res.status(400).json({ error: 'Answer text is required' })
    
    let filter
    try {
      filter = { _id: new mongoose.Types.ObjectId(req.params.id) }
    } catch {
      filter = { id: req.params.id }
    }

    const result = await getCollection('questions').findOneAndUpdate(
      filter,
      { $set: {
        answerText,
        status: 'answered',
        answeredAt: new Date().toISOString(),
        answeredBy: req.user.username || 'admin',
        seen: false
      }},
      { returnDocument: 'after' }
    )
    
    const question = result.value || result
    if (!question) return res.status(404).json({ error: 'Question not found' })
    res.json(normalizeDoc(question))
  } catch (error) {
    res.status(500).json({ error: 'Failed to answer question' })
  }
})

// PUT /api/questions/:id/seen
router.put('/:id/seen', async (req, res) => {
  try {
    let filter
    try {
      filter = { _id: new mongoose.Types.ObjectId(req.params.id) }
    } catch {
      filter = { id: req.params.id }
    }

    const result = await getCollection('questions').findOneAndUpdate(
      filter,
      { $set: { seen: true } },
      { returnDocument: 'after' }
    )
    
    const question = result.value || result
    if (!question) return res.status(404).json({ error: 'Question not found' })
    res.json(normalizeDoc(question))
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as seen' })
  }
})

// DELETE /api/questions/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    let filter
    try {
      filter = { _id: new mongoose.Types.ObjectId(req.params.id) }
    } catch {
      filter = { id: req.params.id }
    }

    const result = await getCollection('questions').findOneAndUpdate(
      filter,
      { $set: {
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: req.user?.username || 'admin'
      }},
      { returnDocument: 'after' }
    )
    
    if (!result.value && !result._id) return res.status(404).json({ error: 'Question not found' })
    res.json({ message: 'Question deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete question' })
  }
})

export default router
