import express from 'express'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import Teacher from '../models/Teacher.js'
import Child from '../models/Child.js'
import Group from '../models/Group.js'
import Gallery from '../models/Gallery.js'
import { readData } from '../utils/db.js'
import logger from '../utils/logger.js'

const router = express.Router()

// GET /api/seed/status - Database status
router.get('/status', async (req, res) => {
  try {
    const counts = {
      users: await User.countDocuments(),
      teachers: await Teacher.countDocuments({ isDeleted: { $ne: true } }),
      children: await Child.countDocuments({ isDeleted: { $ne: true } }),
      groups: await Group.countDocuments({ isDeleted: { $ne: true } }),
      gallery: await Gallery.countDocuments({ isDeleted: { $ne: true } })
    }
    
    res.json({
      database: 'MongoDB',
      connected: mongoose.connection.readyState === 1,
      counts
    })
  } catch (error) {
    logger.error('Seed status error', { error: error.message })
    res.status(500).json({ error: error.message })
  }
})

// POST /api/seed/fix - Ma'lumotlarni tuzatish (category, groupId, etc.)
router.post('/fix', async (req, res) => {
  try {
    const results = {}
    
    // 1. Teachers - category field qo'shish
    const teachersJson = readData('teachers.json') || []
    const teachers = await Teacher.find({})
    
    for (const teacher of teachers) {
      const jsonTeacher = teachersJson.find(t => 
        t.id === teacher.id || 
        t.name === teacher.name ||
        t.name === `${teacher.firstName} ${teacher.lastName}`.trim()
      )
      
      const updateData = {
        category: jsonTeacher?.category || teacher.category || 'teacher',
        group: jsonTeacher?.group || teacher.group || '',
        isActive: true,
        isDeleted: false
      }
      
      await Teacher.updateOne({ _id: teacher._id }, { $set: updateData })
    }
    results.teachersFixed = teachers.length
    
    // 2. Children - groupId va groupName to'g'rilash
    const childrenJson = readData('children.json') || []
    const groupsJson = readData('groups.json') || []
    const children = await Child.find({})
    
    for (const child of children) {
      const jsonChild = childrenJson.find(c => 
        c.id === child.id ||
        (c.firstName === child.firstName && c.lastName === child.lastName)
      )
      
      let groupId = child.groupId || jsonChild?.groupId || 'g1'
      let groupName = child.groupName || jsonChild?.groupName
      
      if (!groupName) {
        const group = groupsJson.find(g => g.id === groupId)
        groupName = group?.name || 'Quyoshlar'
      }
      
      await Child.updateOne({ _id: child._id }, { 
        $set: { 
          groupId, 
          groupName, 
          isActive: true, 
          isDeleted: false 
        } 
      })
    }
    results.childrenFixed = children.length
    
    // 3. Groups - isActive qilish
    await Group.updateMany({}, { $set: { isActive: true, isDeleted: false } })
    results.groupsFixed = await Group.countDocuments()
    
    // 4. Gallery
    await Gallery.updateMany({}, { $set: { published: true, isDeleted: false } })
    results.galleryFixed = await Gallery.countDocuments()
    
    // 5. Users - teacher userlariga assignedGroups qo'shish
    const users = await User.find({ role: 'teacher' })
    for (const user of users) {
      // Username bo'yicha teacher topish
      const teacher = await Teacher.findOne({
        $or: [
          { name: { $regex: user.name, $options: 'i' } },
          { firstName: { $regex: user.name?.split(' ')[0], $options: 'i' } }
        ]
      })
      
      if (teacher && teacher.group) {
        await User.updateOne({ _id: user._id }, { 
          $set: { assignedGroups: [teacher.group] } 
        })
      }
    }
    results.usersFixed = users.length
    
    logger.info('Data fixed', results)
    res.json({ success: true, results })
  } catch (error) {
    logger.error('Fix error', { error: error.message })
    res.status(500).json({ error: error.message })
  }
})

// POST /api/seed/reseed - MongoDB'ni to'liq qayta seed qilish
router.post('/reseed', async (req, res) => {
  try {
    const results = {}
    
    // 1. Groups
    const groupsJson = readData('groups.json') || []
    if (groupsJson.length > 0) {
      await Group.deleteMany({})
      const groups = groupsJson.map(g => ({
        id: g.id,
        name: g.name,
        ageRange: g.ageRange || '',
        capacity: g.capacity || 20,
        teacherId: g.teacherId,
        monthlyFee: g.monthlyFee || 500000,
        isActive: true,
        isDeleted: false
      }))
      await Group.insertMany(groups)
      results.groups = groups.length
    }
    
    // 2. Teachers
    const teachersJson = readData('teachers.json') || []
    if (teachersJson.length > 0) {
      await Teacher.deleteMany({})
      const teachers = teachersJson.map(t => ({
        id: t.id,
        firstName: t.name?.split(' ')[0] || t.firstName || '',
        lastName: t.name?.split(' ').slice(1).join(' ') || t.lastName || '',
        name: t.name,
        position: t.role || t.position,
        role: t.role,
        education: t.education,
        experience: t.experience,
        phone: t.phone || '',
        email: t.email || '',
        photo: t.photo,
        bio: t.bio,
        category: t.category || 'teacher',
        group: t.group || '',
        isActive: true,
        isDeleted: false
      }))
      await Teacher.insertMany(teachers)
      results.teachers = teachers.length
    }
    
    // 3. Children
    const childrenJson = readData('children.json') || []
    if (childrenJson.length > 0) {
      await Child.deleteMany({})
      const children = childrenJson.map(c => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        birthDate: c.birthDate ? new Date(c.birthDate) : new Date(),
        gender: c.gender || 'male',
        groupId: c.groupId || 'g1',
        groupName: c.groupName || 'Quyoshlar',
        parentName: c.parentName || 'Ota-ona',
        parentPhone: c.parentPhone || '+998900000000',
        parentEmail: c.parentEmail,
        allergies: c.allergies || [],
        notes: c.notes,
        photo: c.photo,
        points: c.points || 0,
        level: c.level || 1,
        achievements: c.achievements || [],
        isActive: true,
        isDeleted: false,
        enrolledAt: c.enrolledAt ? new Date(c.enrolledAt) : new Date()
      }))
      await Child.insertMany(children)
      results.children = children.length
    }
    
    // 4. Users - parollarni hash qilish
    const usersJson = readData('users.json') || []
    if (usersJson.length > 0) {
      await User.deleteMany({})
      const users = await Promise.all(usersJson.map(async u => {
        // Parol allaqachon hash qilinganmi tekshirish
        let password = u.password
        if (!password.startsWith('$2')) {
          password = await bcrypt.hash(password, 10)
        }
        
        // Teacher uchun assignedGroups
        let assignedGroups = u.assignedGroups || []
        if (u.role === 'teacher' && assignedGroups.length === 0) {
          // Teacher nomiga mos guruh topish
          const teacher = teachersJson.find(t => 
            t.name?.toLowerCase().includes(u.name?.toLowerCase().split(' ')[0])
          )
          if (teacher?.group) {
            const group = groupsJson.find(g => g.name === teacher.group)
            if (group) {
              assignedGroups = [group.id]
            }
          }
        }
        
        return {
          username: u.username,
          password,
          name: u.name,
          role: u.role,
          email: u.email,
          phone: u.phone,
          assignedGroups,
          isActive: u.isActive !== false
        }
      }))
      await User.insertMany(users)
      results.users = users.length
    }
    
    // 5. Gallery
    const galleryJson = readData('gallery.json') || []
    if (galleryJson.length > 0) {
      await Gallery.deleteMany({})
      const gallery = galleryJson.map(g => ({
        type: g.type || 'image',
        url: g.url,
        thumbnail: g.thumbnail || g.url,
        title: g.title || '',
        description: g.description,
        album: g.album || 'general',
        published: true,
        isDeleted: false
      }))
      await Gallery.insertMany(gallery)
      results.gallery = gallery.length
    }
    
    logger.info('MongoDB reseeded', results)
    res.json({ success: true, message: 'MongoDB qayta to\'ldirildi', results })
  } catch (error) {
    logger.error('Reseed error', { error: error.message })
    res.status(500).json({ error: error.message })
  }
})

// POST /api/seed/users - Faqat userlarni seed qilish
router.post('/users', async (req, res) => {
  try {
    const usersJson = readData('users.json') || []
    
    if (usersJson.length === 0) {
      return res.status(400).json({ error: 'No users in JSON file' })
    }
    
    // Mavjud userlarni o'chirmasdan, yangilarini qo'shish
    for (const u of usersJson) {
      const existing = await User.findOne({ username: u.username })
      if (!existing) {
        let password = u.password
        if (!password.startsWith('$2')) {
          password = await bcrypt.hash(password, 10)
        }
        
        await User.create({
          username: u.username,
          password,
          name: u.name,
          role: u.role,
          email: u.email,
          phone: u.phone,
          assignedGroups: u.assignedGroups || [],
          isActive: true
        })
      }
    }
    
    const count = await User.countDocuments()
    res.json({ success: true, message: 'Users seeded', count })
  } catch (error) {
    logger.error('Seed users error', { error: error.message })
    res.status(500).json({ error: error.message })
  }
})

// POST /api/seed/assign-teacher-groups - Teacher userlariga guruh biriktirish
router.post('/assign-teacher-groups', async (req, res) => {
  try {
    const results = []
    
    // Barcha teacher userlarni olish
    const teacherUsers = await User.find({ role: 'teacher' })
    const groups = await Group.find({})
    const teachers = await Teacher.find({})
    
    for (const user of teacherUsers) {
      // User nomiga mos teacher topish
      const teacher = teachers.find(t => {
        const teacherName = t.name || `${t.firstName} ${t.lastName}`.trim()
        return teacherName.toLowerCase().includes(user.name?.toLowerCase().split(' ')[0]) ||
               user.name?.toLowerCase().includes(teacherName.toLowerCase().split(' ')[0])
      })
      
      if (teacher && teacher.group) {
        // Guruh ID topish
        const group = groups.find(g => g.name === teacher.group || g.id === teacher.group)
        if (group) {
          const groupId = group.id || group._id.toString()
          await User.updateOne({ _id: user._id }, { $set: { assignedGroups: [groupId] } })
          results.push({ user: user.username, group: groupId })
        }
      }
    }
    
    res.json({ success: true, assigned: results })
  } catch (error) {
    logger.error('Assign teacher groups error', { error: error.message })
    res.status(500).json({ error: error.message })
  }
})

export default router
