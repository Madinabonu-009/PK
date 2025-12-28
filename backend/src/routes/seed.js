import express from 'express'
import bcrypt from 'bcryptjs'
import Teacher from '../models/Teacher.js'
import Child from '../models/Child.js'
import User from '../models/User.js'
import { readData } from '../utils/db.js'

const router = express.Router()

// Barcha ma'lumotlarni JSON'dan MongoDB'ga ko'chirish
router.post('/all', async (req, res) => {
  try {
    if (!req.app.locals.useDatabase) {
      return res.status(400).json({ error: 'MongoDB ulanmagan' })
    }

    const results = {}

    // 1. Users
    const usersJson = readData('users.json') || []
    if (usersJson.length > 0) {
      await User.deleteMany({})
      const users = usersJson.map(u => ({
        username: u.username,
        password: u.password, // Already hashed
        name: u.name,
        role: u.role,
        email: u.email,
        phone: u.phone,
        groupId: u.groupId,
        isActive: u.isActive !== false
      }))
      await User.insertMany(users)
      results.users = users.length
    }

    // 2. Children
    const childrenJson = readData('children.json') || []
    if (childrenJson.length > 0) {
      await Child.deleteMany({})
      const children = childrenJson.map(c => ({
        firstName: c.firstName,
        lastName: c.lastName,
        birthDate: c.birthDate,
        gender: c.gender,
        groupId: c.groupId,
        groupName: c.groupName,
        parentName: c.parentName,
        parentPhone: c.parentPhone,
        parentEmail: c.parentEmail,
        allergies: c.allergies || [],
        notes: c.notes,
        points: c.points || 0,
        level: c.level || 1,
        achievements: c.achievements || [],
        isActive: c.isActive !== false,
        isDeleted: c.isDeleted || false,
        enrolledAt: c.enrolledAt
      }))
      await Child.insertMany(children)
      results.children = children.length
    }

    // 3. Teachers
    const teachersJson = readData('teachers.json') || []
    if (teachersJson.length > 0) {
      await Teacher.deleteMany({})
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
      results.teachers = teachers.length
    }

    console.log('✅ MongoDB seeded:', results)
    res.json({ 
      success: true,
      message: 'Barcha ma\'lumotlar MongoDB\'ga ko\'chirildi', 
      results 
    })
  } catch (error) {
    console.error('Seed error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Seed teachers from JSON to MongoDB
router.post('/teachers', async (req, res) => {
  try {
    if (!req.app.locals.useDatabase) {
      return res.status(400).json({ error: 'MongoDB not connected' })
    }

    const teachersJson = readData('teachers.json') || []
    if (teachersJson.length === 0) {
      return res.status(400).json({ error: 'No teachers in JSON file' })
    }

    await Teacher.deleteMany({})
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

    res.json({ message: 'Teachers seeded', count: teachers.length })
  } catch (error) {
    console.error('Seed error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Seed children
router.post('/children', async (req, res) => {
  try {
    if (!req.app.locals.useDatabase) {
      return res.status(400).json({ error: 'MongoDB not connected' })
    }

    const childrenJson = readData('children.json') || []
    if (childrenJson.length === 0) {
      return res.status(400).json({ error: 'No children in JSON file' })
    }

    await Child.deleteMany({})
    await Child.insertMany(childrenJson)

    res.json({ message: 'Children seeded', count: childrenJson.length })
  } catch (error) {
    console.error('Seed error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Seed users
router.post('/users', async (req, res) => {
  try {
    if (!req.app.locals.useDatabase) {
      return res.status(400).json({ error: 'MongoDB not connected' })
    }

    const usersJson = readData('users.json') || []
    if (usersJson.length === 0) {
      return res.status(400).json({ error: 'No users in JSON file' })
    }

    await User.deleteMany({})
    await User.insertMany(usersJson)

    res.json({ message: 'Users seeded', count: usersJson.length })
  } catch (error) {
    console.error('Seed error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get seed status
router.get('/status', async (req, res) => {
  try {
    const useDatabase = req.app.locals.useDatabase
    let counts = { users: 0, children: 0, teachers: 0 }
    
    if (useDatabase) {
      counts.users = await User.countDocuments()
      counts.children = await Child.countDocuments()
      counts.teachers = await Teacher.countDocuments()
    } else {
      counts.users = (readData('users.json') || []).length
      counts.children = (readData('children.json') || []).length
      counts.teachers = (readData('teachers.json') || []).length
    }

    res.json({
      database: useDatabase ? 'MongoDB' : 'JSON',
      counts
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
