import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import Teacher from '../models/Teacher.js'

const router = express.Router()

// GET /api/teachers
router.get('/', async (req, res) => {
  try {
    const teachers = await Teacher.find({ isActive: true })
    res.json(teachers)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teachers' })
  }
})

// GET /api/teachers/:id
router.get('/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' })
    res.json(teacher)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teacher' })
  }
})

// POST /api/teachers
router.post('/', authenticateToken, async (req, res) => {
  try {
    const teacher = new Teacher(req.body)
    await teacher.save()
    res.status(201).json(teacher)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create teacher' })
  }
})

// PUT /api/teachers/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id, 
      { ...req.body, updatedAt: new Date() }, 
      { new: true }
    )
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' })
    res.json(teacher)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update teacher' })
  }
})

// DELETE /api/teachers/:id (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { isActive: false, deletedAt: new Date() },
      { new: true }
    )
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' })
    res.json({ message: 'Teacher deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete teacher' })
  }
})

export default router
