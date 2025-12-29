import express from 'express'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { authenticateToken, requireRole } from '../middleware/auth.js'
import logger from '../utils/logger.js'

const router = express.Router()

const getCollection = (name) => mongoose.connection.collection(name)

const normalizeDoc = (doc) => {
  if (!doc) return null
  const { _id, password, ...rest } = doc
  // Include plainPassword for admin display (demo purposes only)
  return { 
    id: _id.toString(), 
    ...rest,
    plainPassword: rest.plainPassword || null
  }
}

// GET /api/users
router.get('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const users = await getCollection('users').find({}).toArray()
    res.json({ data: users.map(normalizeDoc) })
  } catch (error) {
    logger.error('Get users error:', error)
    res.status(500).json({ error: 'Foydalanuvchilarni yuklashda xatolik' })
  }
})

// GET /api/users/:id
router.get('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    let user
    try {
      user = await getCollection('users').findOne({ _id: new mongoose.Types.ObjectId(req.params.id) })
    } catch {
      user = await getCollection('users').findOne({ id: req.params.id })
    }
    
    if (!user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' })
    res.json(normalizeDoc(user))
  } catch (error) {
    logger.error('Get user error:', error)
    res.status(500).json({ error: 'Foydalanuvchini yuklashda xatolik' })
  }
})

// POST /api/users
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, phone, role, password, isActive, assignedGroups, username: providedUsername } = req.body
    
    if (!email) return res.status(400).json({ error: 'Email majburiy' })

    const existingEmail = await getCollection('users').findOne({ email })
    if (existingEmail) return res.status(400).json({ error: 'Bu email allaqachon mavjud' })
    
    // Username: agar berilgan bo'lsa ishlatish, aks holda emaildan olish
    const username = providedUsername || email.split('@')[0].toLowerCase()
    const existingUsername = await getCollection('users').findOne({ username })
    if (existingUsername) return res.status(400).json({ error: 'Bu username allaqachon mavjud' })
    
    const plainPass = password || 'password123'
    const hashedPassword = await bcrypt.hash(plainPass, 10)
    
    const newUser = {
      id: `user_${Date.now()}`,
      username,
      name: name || '',
      email,
      phone: phone || '',
      role: role || 'parent',
      password: hashedPassword,
      plainPassword: plainPass,
      assignedGroups: assignedGroups || [],
      isActive: isActive !== false,
      createdAt: new Date().toISOString()
    }
    
    await getCollection('users').insertOne(newUser)
    logger.info('User created', { username, email, role, assignedGroups, createdBy: req.user.username })
    
    res.status(201).json(normalizeDoc(newUser))
  } catch (error) {
    logger.error('Create user error:', error)
    res.status(500).json({ error: 'Foydalanuvchi yaratishda xatolik', details: error.message })
  }
})

// PUT /api/users/:id
router.put('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, phone, role, password, isActive, assignedGroups } = req.body
    
    let filter
    try {
      filter = { _id: new mongoose.Types.ObjectId(req.params.id) }
    } catch {
      filter = { id: req.params.id }
    }

    const user = await getCollection('users').findOne(filter)
    if (!user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' })
    
    if (email && email !== user.email) {
      const existingEmail = await getCollection('users').findOne({ email, _id: { $ne: user._id } })
      if (existingEmail) return res.status(400).json({ error: 'Bu email allaqachon mavjud' })
    }
    
    const updateData = { updatedAt: new Date().toISOString() }
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (role !== undefined) updateData.role = role
    if (isActive !== undefined) updateData.isActive = isActive
    if (assignedGroups !== undefined) updateData.assignedGroups = assignedGroups
    if (password) updateData.password = await bcrypt.hash(password, 10)

    const result = await getCollection('users').findOneAndUpdate(
      filter,
      { $set: updateData },
      { returnDocument: 'after' }
    )
    
    logger.info('User updated', { userId: req.params.id, assignedGroups, updatedBy: req.user.username })
    res.json(normalizeDoc(result.value || result))
  } catch (error) {
    logger.error('Update user error:', error)
    res.status(500).json({ error: 'Foydalanuvchini yangilashda xatolik' })
  }
})

// DELETE /api/users/:id
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    let filter
    try {
      filter = { _id: new mongoose.Types.ObjectId(req.params.id) }
    } catch {
      filter = { id: req.params.id }
    }

    const user = await getCollection('users').findOne(filter)
    if (!user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' })
    
    if (user.id === req.user.id || user._id?.toString() === req.user.id) {
      return res.status(400).json({ error: 'O\'zingizni o\'chira olmaysiz' })
    }
    
    await getCollection('users').deleteOne(filter)
    logger.info('User deleted', { userId: req.params.id, deletedBy: req.user.username })
    
    res.json({ message: 'Foydalanuvchi o\'chirildi', id: req.params.id })
  } catch (error) {
    logger.error('Delete user error:', error)
    res.status(500).json({ error: 'Foydalanuvchini o\'chirishda xatolik' })
  }
})

// PUT /api/users/:id/password
router.put('/:id/password', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { password } = req.body
    if (!password) return res.status(400).json({ error: 'Yangi parol majburiy' })
    
    let filter
    try {
      filter = { _id: new mongoose.Types.ObjectId(req.params.id) }
    } catch {
      filter = { id: req.params.id }
    }

    const result = await getCollection('users').findOneAndUpdate(
      filter,
      { $set: { 
        password: await bcrypt.hash(password, 10),
        plainPassword: password,
        updatedAt: new Date().toISOString()
      }},
      { returnDocument: 'after' }
    )
    
    if (!result.value && !result._id) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' })
    
    logger.info('User password changed by admin', { userId: req.params.id, changedBy: req.user.username })
    res.json({ message: 'Parol muvaffaqiyatli o\'zgartirildi' })
  } catch (error) {
    logger.error('Admin change password error:', error)
    res.status(500).json({ error: 'Parolni o\'zgartirishda xatolik' })
  }
})

// PUT /api/users/profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone } = req.body
    
    let filter
    try {
      filter = { _id: new mongoose.Types.ObjectId(req.user.id) }
    } catch {
      filter = { id: req.user.id }
    }

    const updateData = { updatedAt: new Date().toISOString() }
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone

    const result = await getCollection('users').findOneAndUpdate(
      filter,
      { $set: updateData },
      { returnDocument: 'after' }
    )
    
    if (!result.value && !result._id) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' })
    res.json(normalizeDoc(result.value || result))
  } catch (error) {
    logger.error('Update profile error:', error)
    res.status(500).json({ error: 'Profilni yangilashda xatolik' })
  }
})

// PUT /api/users/password
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Joriy va yangi parol majburiy' })
    }
    
    let filter
    try {
      filter = { _id: new mongoose.Types.ObjectId(req.user.id) }
    } catch {
      filter = { id: req.user.id }
    }

    const user = await getCollection('users').findOne(filter)
    if (!user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' })
    
    const validPassword = await bcrypt.compare(currentPassword, user.password)
    if (!validPassword) return res.status(400).json({ error: 'Joriy parol noto\'g\'ri' })
    
    await getCollection('users').updateOne(
      filter,
      { $set: { 
        password: await bcrypt.hash(newPassword, 10),
        updatedAt: new Date().toISOString()
      }}
    )
    
    res.json({ message: 'Parol muvaffaqiyatli o\'zgartirildi' })
  } catch (error) {
    logger.error('Change password error:', error)
    res.status(500).json({ error: 'Parolni o\'zgartirishda xatolik' })
  }
})

// POST /api/users/fix-passwords - Mavjud userlar uchun plainPassword qo'shish
router.post('/fix-passwords', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const defaultPasswords = {
      'itsme': 'admin123',
      'nilufar': 'teacher123',
      'madina': 'teacher123',
      'dilnoza': 'teacher123'
    }
    
    const users = await getCollection('users').find({ plainPassword: { $exists: false } }).toArray()
    let fixedCount = 0
    
    for (const user of users) {
      const plainPass = defaultPasswords[user.username] || 'password123'
      await getCollection('users').updateOne(
        { _id: user._id },
        { $set: { plainPassword: plainPass } }
      )
      fixedCount++
    }
    
    res.json({ success: true, message: `${fixedCount} ta foydalanuvchi paroli tiklandi`, fixedCount })
  } catch (error) {
    logger.error('Fix passwords error:', error)
    res.status(500).json({ error: 'Parollarni tiklashda xatolik' })
  }
})

// POST /api/users/sync-teacher-groups - Teacher userlarni guruhlar bilan sinxronlash
router.post('/sync-teacher-groups', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const teachers = await getCollection('teachers').find({ isDeleted: { $ne: true } }).toArray()
    const groups = await getCollection('groups').find({ isDeleted: { $ne: true } }).toArray()
    const users = await getCollection('users').find({ role: 'teacher' }).toArray()
    
    let syncedCount = 0
    const syncResults = []
    
    for (const user of users) {
      // Teacher ni topish (ism bo'yicha - keng qidiruv)
      const userName = user.name?.toLowerCase() || ''
      const matchingTeacher = teachers.find(t => {
        const teacherName = (typeof t.name === 'string' ? t.name : t.name?.uz || '').toLowerCase()
        return teacherName === userName || 
               teacherName.includes(userName) || 
               userName.includes(teacherName) ||
               (t.email && t.email === user.email)
      })
      
      if (matchingTeacher) {
        // Bu teacher'ga biriktirilgan guruhlarni topish
        const teacherGroupName = typeof matchingTeacher.group === 'string' 
          ? matchingTeacher.group 
          : matchingTeacher.group?.uz || matchingTeacher.group || ''
        
        const teacherGroups = groups.filter(g => {
          // teacherId bo'yicha
          if (g.teacherId === matchingTeacher._id?.toString() || g.teacherId === matchingTeacher.id) {
            return true
          }
          // group nomi bo'yicha
          if (teacherGroupName && g.name?.toLowerCase() === teacherGroupName.toLowerCase()) {
            return true
          }
          return false
        })
        
        const groupIds = teacherGroups.map(g => g.id || g._id.toString())
        
        // Agar guruh topilmasa ham, teacher bilan bog'lash
        await getCollection('users').updateOne(
          { _id: user._id },
          { 
            $set: { 
              assignedGroups: groupIds,
              teacherId: matchingTeacher._id,
              teacherName: typeof matchingTeacher.name === 'string' ? matchingTeacher.name : matchingTeacher.name?.uz,
              updatedAt: new Date().toISOString()
            }
          }
        )
        
        syncedCount++
        syncResults.push({
          username: user.username,
          name: user.name,
          groups: groupIds,
          teacherName: typeof matchingTeacher.name === 'string' ? matchingTeacher.name : matchingTeacher.name?.uz
        })
      }
    }
    
    logger.info('Teacher-group sync completed', { syncedCount, syncedBy: req.user.username })
    
    res.json({
      success: true,
      message: `${syncedCount} ta teacher sinxronlandi`,
      syncedCount,
      results: syncResults
    })
  } catch (error) {
    logger.error('Sync teacher groups error:', error)
    res.status(500).json({ error: 'Sinxronlashda xatolik', details: error.message })
  }
})

export default router
