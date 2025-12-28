import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { readData, writeData } from '../utils/db.js'
import { authenticateToken } from '../middleware/auth.js'
import Teacher from '../models/Teacher.js'

const router = express.Router()

export function validateTeacherProfile(teacher) {
  const errors = []
  if (!teacher || typeof teacher !== 'object') {
    return { valid: false, errors: ['Teacher must be a valid object'] }
  }
  const requiredFields = ['name', 'role', 'experience', 'photo']
  for (const field of requiredFields) {
    if (!teacher[field]) {
      errors.push(`Missing required field: ${field}`)
    }
  }
  return { valid: errors.length === 0, errors }
}

// GET /api/teachers
router.get('/', async (req, res) => {
  try {
    if (req.app.locals.useDatabase) {
      const teachers = await Teacher.find({ isActive: true })
      return res.json(teachers)
    }
    
    const teachers = readData('teachers.json') || []
    // Filter out soft-deleted teachers
    const activeTeachers = teachers.filter(t => !t.isDeleted)
    res.json(activeTeachers)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teachers' })
  }
})

// GET /api/teachers/:id
router.get('/:id', async (req, res) => {
  try {
    if (req.app.locals.useDatabase) {
      const teacher = await Teacher.findById(req.params.id)
      if (!teacher) return res.status(404).json({ error: 'Teacher not found' })
      return res.json(teacher)
    }
    
    const teachers = readData('teachers.json') || []
    const teacher = teachers.find(t => t.id === req.params.id && !t.isDeleted)
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' })
    res.json(teacher)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teacher' })
  }
})

// POST /api/teachers
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.app.locals.useDatabase) {
      const teacher = new Teacher(req.body)
      await teacher.save()
      return res.status(201).json(teacher)
    }
    
    const teachers = readData('teachers.json') || []
    const newTeacher = {
      id: uuidv4(),
      ...req.body
    }
    teachers.push(newTeacher)
    writeData('teachers.json', teachers)
    res.status(201).json(newTeacher)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create teacher' })
  }
})

// PUT /api/teachers/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.app.locals.useDatabase) {
      const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true })
      if (!teacher) return res.status(404).json({ error: 'Teacher not found' })
      return res.json(teacher)
    }
    
    const teachers = readData('teachers.json') || []
    const index = teachers.findIndex(t => t.id === req.params.id)
    if (index === -1) return res.status(404).json({ error: 'Teacher not found' })
    
    teachers[index] = { ...teachers[index], ...req.body }
    writeData('teachers.json', teachers)
    res.json(teachers[index])
  } catch (error) {
    res.status(500).json({ error: 'Failed to update teacher' })
  }
})

// DELETE /api/teachers/:id (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.app.locals.useDatabase) {
      const teacher = await Teacher.findByIdAndUpdate(
        req.params.id,
        { isActive: false, deletedAt: new Date() },
        { new: true }
      )
      if (!teacher) return res.status(404).json({ error: 'Teacher not found' })
      return res.json({ message: 'Teacher deleted' })
    }
    
    const teachers = readData('teachers.json') || []
    const index = teachers.findIndex(t => t.id === req.params.id)
    if (index === -1) return res.status(404).json({ error: 'Teacher not found' })
    
    // Soft delete
    teachers[index].isDeleted = true
    teachers[index].deletedAt = new Date().toISOString()
    writeData('teachers.json', teachers)
    res.json({ message: 'Teacher deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete teacher' })
  }
})

export default router
