import express from 'express'
import mongoose from 'mongoose'
import { readData } from '../utils/db.js'

const router = express.Router()

const getCollection = (name) => mongoose.connection.collection(name)

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
      await getCollection('users').deleteMany({})
      await getCollection('users').insertMany(usersJson.map(u => ({
        ...u,
        isActive: u.isActive !== false,
        createdAt: u.createdAt || new Date().toISOString()
      })))
      results.users = usersJson.length
    }

    // 2. Children
    const childrenJson = readData('children.json') || []
    if (childrenJson.length > 0) {
      await getCollection('children').deleteMany({})
      await getCollection('children').insertMany(childrenJson.map(c => ({
        ...c,
        gender: c.gender || 'male',
        isActive: c.isActive !== false,
        createdAt: c.createdAt || new Date().toISOString()
      })))
      results.children = childrenJson.length
    }

    // 3. Teachers
    const teachersJson = readData('teachers.json') || []
    if (teachersJson.length > 0) {
      await getCollection('teachers').deleteMany({})
      await getCollection('teachers').insertMany(teachersJson.map(t => ({
        ...t,
        firstName: t.name?.split(' ')[0] || t.name,
        lastName: t.name?.split(' ').slice(1).join(' ') || '',
        position: t.role || t.position,
        isActive: t.isDeleted !== true,
        createdAt: t.createdAt || new Date().toISOString()
      })))
      results.teachers = teachersJson.length
    }


    // 4. Gallery
    const galleryJson = readData('gallery.json') || []
    if (galleryJson.length > 0) {
      await getCollection('galleries').deleteMany({})
      await getCollection('galleries').insertMany(galleryJson.map(g => ({
        ...g,
        published: g.published !== false,
        createdAt: g.createdAt || new Date().toISOString()
      })))
      results.gallery = galleryJson.length
    }

    // 5. Groups
    const groupsJson = readData('groups.json') || []
    if (groupsJson.length > 0) {
      await getCollection('groups').deleteMany({})
      await getCollection('groups').insertMany(groupsJson)
      results.groups = groupsJson.length
    }

    // 6. Other collections
    const otherCollections = [
      'menu', 'events', 'attendance', 'payments', 'dailyReports',
      'debts', 'achievements', 'progress', 'enrollments', 'feedback',
      'questions', 'journal', 'blog', 'stories'
    ]

    for (const name of otherCollections) {
      const data = readData(`${name}.json`) || []
      if (Array.isArray(data) && data.length > 0) {
        await getCollection(name.toLowerCase()).deleteMany({})
        await getCollection(name.toLowerCase()).insertMany(data)
        results[name] = data.length
      }
    }

    // 7. Settings (single document)
    const settingsJson = readData('settings.json')
    if (settingsJson && Object.keys(settingsJson).length > 0) {
      await getCollection('settings').deleteMany({})
      await getCollection('settings').insertOne(settingsJson)
      results.settings = 1
    }

    // 8. Curriculum (single document)
    const curriculumJson = readData('curriculum.json')
    if (curriculumJson && Object.keys(curriculumJson).length > 0) {
      await getCollection('curriculum').deleteMany({})
      await getCollection('curriculum').insertOne(curriculumJson)
      results.curriculum = 1
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

    await getCollection('teachers').deleteMany({})
    await getCollection('teachers').insertMany(teachersJson.map(t => ({
      ...t,
      firstName: t.name?.split(' ')[0] || t.name,
      lastName: t.name?.split(' ').slice(1).join(' ') || '',
      position: t.role || t.position,
      isActive: t.isDeleted !== true,
      createdAt: t.createdAt || new Date().toISOString()
    })))

    res.json({ message: 'Teachers seeded', count: teachersJson.length })
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

    await getCollection('children').deleteMany({})
    await getCollection('children').insertMany(childrenJson.map(c => ({
      ...c,
      gender: c.gender || 'male',
      isActive: c.isActive !== false,
      createdAt: c.createdAt || new Date().toISOString()
    })))

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

    await getCollection('users').deleteMany({})
    await getCollection('users').insertMany(usersJson)

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
    let counts = { users: 0, children: 0, teachers: 0, gallery: 0, groups: 0 }
    
    if (useDatabase) {
      counts.users = await getCollection('users').countDocuments()
      counts.children = await getCollection('children').countDocuments()
      counts.teachers = await getCollection('teachers').countDocuments()
      counts.gallery = await getCollection('galleries').countDocuments()
      counts.groups = await getCollection('groups').countDocuments()
    } else {
      counts.users = (readData('users.json') || []).length
      counts.children = (readData('children.json') || []).length
      counts.teachers = (readData('teachers.json') || []).length
      counts.gallery = (readData('gallery.json') || []).length
      counts.groups = (readData('groups.json') || []).length
    }

    res.json({
      database: useDatabase ? 'MongoDB' : 'JSON',
      counts
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/seed/fix - Ma'lumotlarni tuzatish
router.post('/fix', async (req, res) => {
  try {
    const results = {}
    
    // Teachers - isActive: true, isDeleted: false qilish
    const teachersResult = await getCollection('teachers').updateMany(
      {},
      { $set: { isActive: true, isDeleted: false } }
    )
    results.teachersFixed = teachersResult.modifiedCount
    
    // Children - isActive: true, isDeleted: false qilish
    const childrenResult = await getCollection('children').updateMany(
      {},
      { $set: { isActive: true, isDeleted: false } }
    )
    results.childrenFixed = childrenResult.modifiedCount
    
    // Gallery - published: true, isDeleted: false qilish
    const galleryResult = await getCollection('galleries').updateMany(
      {},
      { $set: { published: true, isDeleted: false } }
    )
    results.galleryFixed = galleryResult.modifiedCount
    
    // Groups - isActive: true qilish
    const groupsResult = await getCollection('groups').updateMany(
      {},
      { $set: { isActive: true } }
    )
    results.groupsFixed = groupsResult.modifiedCount
    
    console.log('✅ Data fixed:', results)
    res.json({ success: true, results })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
