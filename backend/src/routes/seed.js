import express from 'express'
import Teacher from '../models/Teacher.js'
import { readData } from '../utils/db.js'

const router = express.Router()

// Seed teachers from JSON to MongoDB
router.post('/teachers', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (!req.app.locals.useDatabase) {
      return res.status(400).json({ error: 'MongoDB not connected' })
    }

    // Read from JSON file
    const teachersJson = readData('teachers.json') || []
    
    if (teachersJson.length === 0) {
      return res.status(400).json({ error: 'No teachers in JSON file' })
    }

    // Clear existing teachers
    await Teacher.deleteMany({})

    // Transform and insert teachers
    const teachers = teachersJson.map(t => ({
      name: t.name,
      firstName: t.name?.split(' ')[0] || t.name,
      lastName: t.name?.split(' ').slice(1).join(' ') || '',
      position: t.role,
      role: t.role,
      education: t.education,
      experience: t.experience,
      phone: t.phone || '',
      email: t.email || '',
      photo: t.photo,
      bio: t.bio,
      category: t.category,
      group: t.group,
      isActive: !t.isDeleted
    }))

    await Teacher.insertMany(teachers)

    res.json({ 
      message: 'Teachers seeded successfully', 
      count: teachers.length 
    })
  } catch (error) {
    console.error('Seed error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get seed status
router.get('/status', async (req, res) => {
  try {
    const useDatabase = req.app.locals.useDatabase
    let teacherCount = 0
    
    if (useDatabase) {
      teacherCount = await Teacher.countDocuments()
    } else {
      const teachers = readData('teachers.json') || []
      teacherCount = teachers.length
    }

    res.json({
      database: useDatabase ? 'MongoDB' : 'JSON',
      teachers: teacherCount
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
