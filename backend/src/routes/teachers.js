import express from 'express'
import mongoose from 'mongoose'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

const getCollection = (name) => mongoose.connection.collection(name)

// GET /api/teachers
router.get('/', async (req, res) => {
  try {
    // Barcha teacherlarni olish (isDeleted: true bo'lmaganlarini)
    const teachers = await getCollection('teachers').find({ 
      isDeleted: { $ne: true }
    }).toArray()
    res.json(teachers.map(t => ({ ...t, id: t._id || t.id })))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teachers' })
  }
})

// GET /api/teachers/:id
router.get('/:id', async (req, res) => {
  try {
    const teachers = await getCollection('teachers').find({}).toArray()
    const teacher = teachers.find(t => (t._id?.toString() || t.id) === req.params.id)
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' })
    res.json({ ...teacher, id: teacher._id || teacher.id })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teacher' })
  }
})

// POST /api/teachers
router.post('/', authenticateToken, async (req, res) => {
  try {
    const newTeacher = {
      ...req.body,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    const result = await getCollection('teachers').insertOne(newTeacher)
    res.status(201).json({ ...newTeacher, id: result.insertedId })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create teacher' })
  }
})

// PUT /api/teachers/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const teachers = await getCollection('teachers').find({}).toArray()
    const teacher = teachers.find(t => (t._id?.toString() || t.id) === req.params.id)
    
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' })
    
    const updateData = { ...req.body, updatedAt: new Date() }
    
    if (teacher._id) {
      await getCollection('teachers').updateOne({ _id: teacher._id }, { $set: updateData })
    } else {
      await getCollection('teachers').updateOne({ id: teacher.id }, { $set: updateData })
    }
    
    res.json({ ...teacher, ...updateData, id: teacher._id || teacher.id })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update teacher' })
  }
})

// DELETE /api/teachers/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const teachers = await getCollection('teachers').find({}).toArray()
    const teacher = teachers.find(t => (t._id?.toString() || t.id) === req.params.id)
    
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' })
    
    if (teacher._id) {
      await getCollection('teachers').updateOne({ _id: teacher._id }, { $set: { isActive: false, deletedAt: new Date() } })
    } else {
      await getCollection('teachers').updateOne({ id: teacher.id }, { $set: { isActive: false, deletedAt: new Date() } })
    }
    
    res.json({ message: 'Teacher deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete teacher' })
  }
})

export default router
