import express from 'express'
import bcrypt from 'bcryptjs'
import { readData, writeData } from '../utils/db.js'
import { authenticateToken, requireRole } from '../middleware/auth.js'
import logger from '../utils/logger.js'

const router = express.Router()

// GET /api/users - Barcha foydalanuvchilarni olish (admin only)
router.get('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const users = readData('users.json') || []
    
    // Parollarni olib tashlash
    const safeUsers = users.map(({ password, ...user }) => user)
    
    res.json({ data: safeUsers })
  } catch (error) {
    logger.error('Get users error:', error)
    res.status(500).json({ error: 'Foydalanuvchilarni yuklashda xatolik' })
  }
})

// GET /api/users/:id - Bitta foydalanuvchini olish
router.get('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const users = readData('users.json') || []
    const user = users.find(u => u.id === req.params.id)
    
    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' })
    }
    
    const { password, ...safeUser } = user
    res.json(safeUser)
  } catch (error) {
    logger.error('Get user error:', error)
    res.status(500).json({ error: 'Foydalanuvchini yuklashda xatolik' })
  }
})

// POST /api/users - Yangi foydalanuvchi yaratish (admin only)
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, phone, role, password, isActive } = req.body
    
    if (!email) {
      return res.status(400).json({ error: 'Email majburiy' })
    }
    
    const users = readData('users.json') || []
    
    // Email mavjudligini tekshirish
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Bu email allaqachon mavjud' })
    }
    
    // Username yaratish (email'dan)
    const username = email.split('@')[0].toLowerCase()
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ error: 'Bu username allaqachon mavjud' })
    }
    
    // Parolni hash qilish
    const hashedPassword = await bcrypt.hash(password || 'password123', 10)
    
    const newUser = {
      id: `user_${Date.now()}`,
      username,
      name: name || '',
      email,
      phone: phone || '',
      role: role || 'teacher',
      password: hashedPassword,
      isActive: isActive !== false,
      createdAt: new Date().toISOString()
    }
    
    users.push(newUser)
    
    if (!writeData('users.json', users)) {
      return res.status(500).json({ error: 'Ma\'lumotlarni saqlashda xatolik' })
    }
    
    logger.info('User created', { email, role, createdBy: req.user.username })
    
    const { password: _, ...safeUser } = newUser
    res.status(201).json(safeUser)
  } catch (error) {
    logger.error('Create user error:', error)
    res.status(500).json({ error: 'Foydalanuvchi yaratishda xatolik' })
  }
})

// PUT /api/users/:id - Foydalanuvchini yangilash (admin only)
router.put('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, phone, role, password, isActive } = req.body
    
    const users = readData('users.json') || []
    const index = users.findIndex(u => u.id === req.params.id)
    
    if (index === -1) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' })
    }
    
    // Email o'zgartirilsa, boshqa foydalanuvchida mavjudligini tekshirish
    if (email && email !== users[index].email) {
      if (users.find(u => u.email === email && u.id !== req.params.id)) {
        return res.status(400).json({ error: 'Bu email allaqachon mavjud' })
      }
    }
    
    // Ma'lumotlarni yangilash
    if (name !== undefined) users[index].name = name
    if (email !== undefined) users[index].email = email
    if (phone !== undefined) users[index].phone = phone
    if (role !== undefined) users[index].role = role
    if (isActive !== undefined) users[index].isActive = isActive
    users[index].updatedAt = new Date().toISOString()
    
    // Parol yangilanayotgan bo'lsa
    if (password) {
      users[index].password = await bcrypt.hash(password, 10)
    }
    
    if (!writeData('users.json', users)) {
      return res.status(500).json({ error: 'Ma\'lumotlarni saqlashda xatolik' })
    }
    
    logger.info('User updated', { userId: req.params.id, updatedBy: req.user.username })
    
    const { password: _, ...safeUser } = users[index]
    res.json(safeUser)
  } catch (error) {
    logger.error('Update user error:', error)
    res.status(500).json({ error: 'Foydalanuvchini yangilashda xatolik' })
  }
})

// DELETE /api/users/:id - Foydalanuvchini o'chirish (admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const users = readData('users.json') || []
    const index = users.findIndex(u => u.id === req.params.id)
    
    if (index === -1) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' })
    }
    
    // O'zini o'chirmaslik
    if (users[index].id === req.user.id) {
      return res.status(400).json({ error: 'O\'zingizni o\'chira olmaysiz' })
    }
    
    const deletedUser = users.splice(index, 1)[0]
    
    if (!writeData('users.json', users)) {
      return res.status(500).json({ error: 'Ma\'lumotlarni saqlashda xatolik' })
    }
    
    logger.info('User deleted', { userId: req.params.id, deletedBy: req.user.username })
    
    res.json({ message: 'Foydalanuvchi o\'chirildi', id: deletedUser.id })
  } catch (error) {
    logger.error('Delete user error:', error)
    res.status(500).json({ error: 'Foydalanuvchini o\'chirishda xatolik' })
  }
})

// PUT /api/users/profile - O'z profilini yangilash
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone } = req.body
    
    const users = readData('users.json') || []
    const index = users.findIndex(u => u.id === req.user.id)
    
    if (index === -1) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' })
    }
    
    if (name !== undefined) users[index].name = name
    if (phone !== undefined) users[index].phone = phone
    users[index].updatedAt = new Date().toISOString()
    
    if (!writeData('users.json', users)) {
      return res.status(500).json({ error: 'Ma\'lumotlarni saqlashda xatolik' })
    }
    
    const { password: _, ...safeUser } = users[index]
    res.json(safeUser)
  } catch (error) {
    logger.error('Update profile error:', error)
    res.status(500).json({ error: 'Profilni yangilashda xatolik' })
  }
})

// PUT /api/users/password - Parolni o'zgartirish
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Joriy va yangi parol majburiy' })
    }
    
    const users = readData('users.json') || []
    const index = users.findIndex(u => u.id === req.user.id)
    
    if (index === -1) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' })
    }
    
    // Joriy parolni tekshirish
    const validPassword = await bcrypt.compare(currentPassword, users[index].password)
    if (!validPassword) {
      return res.status(400).json({ error: 'Joriy parol noto\'g\'ri' })
    }
    
    // Yangi parolni saqlash
    users[index].password = await bcrypt.hash(newPassword, 10)
    users[index].updatedAt = new Date().toISOString()
    
    if (!writeData('users.json', users)) {
      return res.status(500).json({ error: 'Ma\'lumotlarni saqlashda xatolik' })
    }
    
    res.json({ message: 'Parol muvaffaqiyatli o\'zgartirildi' })
  } catch (error) {
    logger.error('Change password error:', error)
    res.status(500).json({ error: 'Parolni o\'zgartirishda xatolik' })
  }
})

export default router
