import express from 'express'
import bcrypt from 'bcryptjs'
import { readData } from '../utils/db.js'
import { generateToken, generateRefreshToken, verifyRefreshToken, authenticateToken } from '../middleware/auth.js'
import { checkAccountLockout, recordFailedLogin, resetLoginAttempts } from '../middleware/bruteForce.js'
import { validatePassword } from '../utils/validation.js'
import logger from '../utils/logger.js'
import User from '../models/User.js'

const router = express.Router()

// POST /api/auth/login
router.post('/login', checkAccountLockout, async (req, res) => {
  try {
    const { username, password } = req.body

    logger.info('Login attempt', { username, ip: req.ip })

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password required' })
    }

    let user = null
    
    // MongoDB ishlatilsa
    if (req.app.locals.useDatabase) {
      user = await User.findOne({ username, isActive: true })
      if (user) {
        const validPassword = await user.comparePassword(password)
        if (!validPassword) {
          recordFailedLogin(username)
          user = null
        }
      } else {
        recordFailedLogin(username)
      }
    } else {
      // JSON fayl ishlatilsa
      const users = readData('users.json')
      const foundUser = users?.find(u => u.username === username)
      if (foundUser) {
        const validPassword = await bcrypt.compare(password, foundUser.password)
        if (validPassword) {
          user = foundUser
        } else {
          recordFailedLogin(username)
        }
      } else {
        recordFailedLogin(username)
      }
    }

    if (!user) {
      logger.warn('Failed login attempt', { username, ip: req.ip })
      return res.status(401).json({ success: false, error: 'Invalid credentials' })
    }

    // Muvaffaqiyatli login - attempt'larni reset qilish
    resetLoginAttempts(username)

    const userObj = user.toObject ? user.toObject() : user
    const token = generateToken(userObj)
    const refreshToken = generateRefreshToken(userObj)
    
    logger.info('Successful login', { username, role: userObj.role, ip: req.ip })
    
    res.json({ 
      success: true,
      token, 
      refreshToken,
      user: { 
        id: userObj._id || userObj.id, 
        username: userObj.username, 
        role: userObj.role,
        name: userObj.name
      } 
    })
  } catch (error) {
    logger.error('Login error', { error: error.message, stack: error.stack, username: req.body.username })
    res.status(500).json({ success: false, error: 'Login failed' })
  }
})

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' })
})

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    if (req.app.locals.useDatabase) {
      const user = await User.findById(req.user.id).select('-password')
      if (!user) return res.status(404).json({ success: false, error: 'User not found' })
      return res.json({ success: true, user })
    }
    res.json({ success: true, user: req.user })
  } catch (error) {
    logger.error('Get user error', { error: error.message, stack: error.stack, userId: req.user?.id })
    res.status(500).json({ success: false, error: 'Failed to get user' })
  }
})

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ success: false, error: 'Refresh token required' })
    }

    const decoded = verifyRefreshToken(refreshToken)
    if (!decoded) {
      return res.status(401).json({ success: false, error: 'Invalid refresh token', code: 'INVALID_REFRESH_TOKEN' })
    }

    let user = null
    
    if (req.app.locals.useDatabase) {
      user = await User.findById(decoded.id)
    } else {
      const users = readData('users.json')
      user = users?.find(u => u.id === decoded.id)
    }

    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' })
    }

    const userObj = user.toObject ? user.toObject() : user
    const newToken = generateToken(userObj)
    res.json({ success: true, token: newToken })
  } catch (error) {
    logger.error('Token refresh error', { error: error.message, stack: error.stack })
    res.status(500).json({ success: false, error: 'Token refresh failed' })
  }
})

// POST /api/auth/register (admin only - yangi foydalanuvchi yaratish)
router.post('/register', authenticateToken, async (req, res) => {
  try {
    // Faqat admin yaratishi mumkin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can create users' })
    }
    
    const { username, password, name, role, email, phone } = req.body
    
    if (!username || !password || !name) {
      return res.status(400).json({ error: 'Username, password and name are required' })
    }
    
    // Password validation
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message })
    }
    
    if (req.app.locals.useDatabase) {
      const existingUser = await User.findOne({ username })
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' })
      }
      
      const user = new User({
        username,
        password,
        name,
        role: role || 'teacher',
        email,
        phone
      })
      await user.save()
      
      logger.info('User created by admin', { username, role, createdBy: req.user.username })
      
      const userObj = user.toObject()
      delete userObj.password
      return res.status(201).json(userObj)
    }
    
    // JSON fayl uchun
    const users = readData('users.json') || []
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ error: 'Username already exists' })
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = {
      id: `user_${Date.now()}`,
      username,
      password: hashedPassword,
      name,
      role: role || 'teacher',
      email,
      phone
    }
    users.push(newUser)
    
    const { writeData } = await import('../utils/db.js')
    writeData('users.json', users)
    
    logger.info('User created by admin', { username, role, createdBy: req.user.username })
    
    const { password: _, ...userWithoutPassword } = newUser
    res.status(201).json(userWithoutPassword)
  } catch (error) {
    logger.error('Register error', { error: error.message, stack: error.stack })
    res.status(500).json({ error: 'Failed to create user' })
  }
})

// POST /api/auth/parent/register - Ota-onalar uchun ro'yxatdan o'tish
router.post('/parent/register', async (req, res) => {
  try {
    const { phone, password, name, childName } = req.body
    
    if (!phone || !password || !name) {
      return res.status(400).json({ error: 'Telefon, parol va ism majburiy' })
    }
    
    // Password validation
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message })
    }
    
    // Telefon raqamni normalizatsiya qilish
    const normalizedPhone = phone.replace(/\D/g, '').slice(-9)
    
    const { writeData } = await import('../utils/db.js')
    const users = readData('users.json') || []
    
    // Telefon raqam mavjudligini tekshirish
    if (users.find(u => u.phone?.replace(/\D/g, '').slice(-9) === normalizedPhone && u.role === 'parent')) {
      return res.status(400).json({ error: 'Bu telefon raqam allaqachon ro\'yxatdan o\'tgan' })
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = {
      id: `parent_${Date.now()}`,
      username: `parent_${normalizedPhone}`,
      password: hashedPassword,
      name,
      phone: `+998${normalizedPhone}`,
      role: 'parent',
      childName,
      createdAt: new Date().toISOString(),
      isActive: true
    }
    
    users.push(newUser)
    writeData('users.json', users)
    
    logger.info('Parent registered', { phone: `+998${normalizedPhone}`, name, ip: req.ip })
    
    // Token yaratish
    const token = generateToken(newUser)
    const refreshToken = generateRefreshToken(newUser)
    
    const { password: _, ...userWithoutPassword } = newUser
    res.status(201).json({
      success: true,
      message: 'Ro\'yxatdan o\'tish muvaffaqiyatli',
      token,
      refreshToken,
      user: userWithoutPassword
    })
  } catch (error) {
    logger.error('Parent register error', { error: error.message, stack: error.stack, phone: req.body.phone })
    res.status(500).json({ error: 'Ro\'yxatdan o\'tishda xatolik' })
  }
})

// POST /api/auth/parent/login - Ota-onalar uchun kirish
router.post('/parent/login', checkAccountLockout, async (req, res) => {
  try {
    const { phone, password } = req.body
    
    if (!phone || !password) {
      return res.status(400).json({ error: 'Telefon va parol majburiy' })
    }
    
    const normalizedPhone = phone.replace(/\D/g, '').slice(-9)
    const username = `parent_${normalizedPhone}`
    
    logger.info('Parent login attempt', { phone: `+998${normalizedPhone}`, ip: req.ip })
    
    const users = readData('users.json') || []
    
    const user = users.find(u => 
      u.phone?.replace(/\D/g, '').slice(-9) === normalizedPhone && 
      u.role === 'parent' &&
      u.isActive !== false
    )
    
    if (!user) {
      recordFailedLogin(username)
      logger.warn('Failed parent login - user not found', { phone: `+998${normalizedPhone}`, ip: req.ip })
      return res.status(401).json({ error: 'Telefon yoki parol noto\'g\'ri' })
    }
    
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      recordFailedLogin(username)
      logger.warn('Failed parent login - invalid password', { phone: `+998${normalizedPhone}`, ip: req.ip })
      return res.status(401).json({ error: 'Telefon yoki parol noto\'g\'ri' })
    }
    
    // Muvaffaqiyatli login - attempt'larni reset qilish
    resetLoginAttempts(username)
    
    const token = generateToken(user)
    const refreshToken = generateRefreshToken(user)
    
    logger.info('Successful parent login', { phone: `+998${normalizedPhone}`, ip: req.ip })
    
    res.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        childName: user.childName
      }
    })
  } catch (error) {
    logger.error('Parent login error', { error: error.message, stack: error.stack, phone: req.body.phone })
    res.status(500).json({ error: 'Kirishda xatolik' })
  }
})

// GET /api/auth/parent/profile - Ota-ona profili
router.get('/parent/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'parent') {
      return res.status(403).json({ error: 'Faqat ota-onalar uchun' })
    }
    
    const users = readData('users.json') || []
    const user = users.find(u => u.id === req.user.id)
    
    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' })
    }
    
    // Bolani topish
    const children = readData('children.json') || []
    const normalizedPhone = user.phone?.replace(/\D/g, '').slice(-9)
    const child = children.find(c => 
      c.parentPhone?.replace(/\D/g, '').slice(-9) === normalizedPhone ||
      c.parent?.phone?.replace(/\D/g, '').slice(-9) === normalizedPhone
    )
    
    // Davomat ma'lumotlari
    const attendance = readData('attendance.json') || []
    const childAttendance = child ? attendance.filter(a => a.childId === child.id).slice(-30) : []
    
    // Kunlik hisobotlar
    const dailyReports = readData('dailyReports.json') || []
    const childReports = child ? dailyReports.filter(r => r.childId === child.id).slice(-10) : []
    
    // To'lovlar
    const payments = readData('payments.json') || []
    const childPayments = child ? payments.filter(p => p.childId === child.id).slice(-10) : []
    
    const { password: _, ...userWithoutPassword } = user
    
    res.json({
      success: true,
      user: userWithoutPassword,
      child,
      attendance: childAttendance,
      reports: childReports,
      payments: childPayments
    })
  } catch (error) {
    logger.error('Get parent profile error', { error: error.message, stack: error.stack, userId: req.user?.id })
    res.status(500).json({ error: 'Profil yuklashda xatolik' })
  }
})

// PUT /api/auth/parent/profile - Profilni yangilash
router.put('/parent/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'parent') {
      return res.status(403).json({ error: 'Faqat ota-onalar uchun' })
    }
    
    const { name, email, address } = req.body
    const { writeData } = await import('../utils/db.js')
    const users = readData('users.json') || []
    
    const userIndex = users.findIndex(u => u.id === req.user.id)
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' })
    }
    
    if (name) users[userIndex].name = name
    if (email) users[userIndex].email = email
    if (address) users[userIndex].address = address
    users[userIndex].updatedAt = new Date().toISOString()
    
    writeData('users.json', users)
    
    const { password: _, ...userWithoutPassword } = users[userIndex]
    res.json({ success: true, user: userWithoutPassword })
  } catch (error) {
    logger.error('Update parent profile error', { error: error.message, stack: error.stack, userId: req.user?.id })
    res.status(500).json({ error: 'Profilni yangilashda xatolik' })
  }
})

// POST /api/auth/parent/reset-password - Parolni tiklash (telefon orqali)
router.post('/parent/reset-password', async (req, res) => {
  try {
    const { phone, newPassword, childName } = req.body
    
    if (!phone || !newPassword) {
      return res.status(400).json({ error: 'Telefon va yangi parol majburiy' })
    }
    
    // Password validation
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message })
    }
    
    const normalizedPhone = phone.replace(/\D/g, '').slice(-9)
    const { writeData } = await import('../utils/db.js')
    const users = readData('users.json') || []
    
    const userIndex = users.findIndex(u => 
      u.phone?.replace(/\D/g, '').slice(-9) === normalizedPhone && 
      u.role === 'parent'
    )
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Bu telefon raqam ro\'yxatdan o\'tmagan' })
    }
    
    // Bola ismini tekshirish (xavfsizlik uchun)
    const children = readData('children.json') || []
    const child = children.find(c => 
      c.parentPhone?.replace(/\D/g, '').slice(-9) === normalizedPhone
    )
    
    if (child && childName) {
      const childFirstName = child.firstName?.toLowerCase()
      const inputChildName = childName.toLowerCase()
      if (!childFirstName.includes(inputChildName) && !inputChildName.includes(childFirstName)) {
        return res.status(400).json({ error: 'Bola ismi noto\'g\'ri' })
      }
    }
    
    // Parolni yangilash
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    users[userIndex].password = hashedPassword
    users[userIndex].updatedAt = new Date().toISOString()
    
    writeData('users.json', users)
    
    logger.info('Parent password reset', { phone: `+998${normalizedPhone}`, ip: req.ip })
    
    res.json({ success: true, message: 'Parol muvaffaqiyatli yangilandi' })
  } catch (error) {
    logger.error('Reset password error', { error: error.message, stack: error.stack, phone: req.body.phone })
    res.status(500).json({ error: 'Parolni tiklashda xatolik' })
  }
})

// POST /api/auth/parent/change-password - Parolni o'zgartirish (kirgan foydalanuvchi)
router.post('/parent/change-password', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'parent') {
      return res.status(403).json({ error: 'Faqat ota-onalar uchun' })
    }
    
    const { currentPassword, newPassword } = req.body
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Joriy va yangi parol majburiy' })
    }
    
    // Password validation
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message })
    }
    
    const { writeData } = await import('../utils/db.js')
    const users = readData('users.json') || []
    
    const userIndex = users.findIndex(u => u.id === req.user.id)
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' })
    }
    
    // Joriy parolni tekshirish
    const validPassword = await bcrypt.compare(currentPassword, users[userIndex].password)
    if (!validPassword) {
      return res.status(400).json({ error: 'Joriy parol noto\'g\'ri' })
    }
    
    // Yangi parolni saqlash
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    users[userIndex].password = hashedPassword
    users[userIndex].updatedAt = new Date().toISOString()
    
    writeData('users.json', users)
    
    logger.info('Parent password changed', { userId: req.user.id, ip: req.ip })
    
    res.json({ success: true, message: 'Parol muvaffaqiyatli o\'zgartirildi' })
  } catch (error) {
    logger.error('Change password error', { error: error.message, stack: error.stack, userId: req.user?.id })
    res.status(500).json({ error: 'Parolni o\'zgartirishda xatolik' })
  }
})

export default router
