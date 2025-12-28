import express from 'express'
import bcrypt from 'bcryptjs'
import { generateToken, generateRefreshToken, verifyRefreshToken, authenticateToken } from '../middleware/auth.js'
import { checkAccountLockout, recordFailedLogin, resetLoginAttempts } from '../middleware/bruteForce.js'
import { validatePassword } from '../utils/validation.js'
import logger from '../utils/logger.js'
import User from '../models/User.js'
import Child from '../models/Child.js'
import mongoose from 'mongoose'

const router = express.Router()

// POST /api/auth/login
router.post('/login', checkAccountLockout, async (req, res) => {
  try {
    const { username, password } = req.body

    logger.info('Login attempt', { username, ip: req.ip })

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password required' })
    }

    const dbUser = await User.findOne({ username, isActive: true })
    
    if (!dbUser) {
      recordFailedLogin(username)
      logger.warn('Failed login - user not found', { username, ip: req.ip })
      return res.status(401).json({ success: false, error: 'Invalid credentials' })
    }

    // Password tekshirish
    let validPassword = false
    if (typeof dbUser.comparePassword === 'function') {
      validPassword = await dbUser.comparePassword(password)
    } else {
      validPassword = await bcrypt.compare(password, dbUser.password)
    }
    
    if (!validPassword) {
      recordFailedLogin(username)
      logger.warn('Failed login - invalid password', { username, ip: req.ip })
      return res.status(401).json({ success: false, error: 'Invalid credentials' })
    }

    resetLoginAttempts(username)

    const userObj = dbUser.toObject ? dbUser.toObject() : dbUser
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
    const user = await User.findById(req.user.id).select('-password')
    if (!user) return res.status(404).json({ success: false, error: 'User not found' })
    res.json({ success: true, user })
  } catch (error) {
    logger.error('Get user error', { error: error.message, userId: req.user?.id })
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

    const user = await User.findById(decoded.id)
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' })
    }

    const userObj = user.toObject ? user.toObject() : user
    const newToken = generateToken(userObj)
    res.json({ success: true, token: newToken })
  } catch (error) {
    logger.error('Token refresh error', { error: error.message })
    res.status(500).json({ success: false, error: 'Token refresh failed' })
  }
})

// POST /api/auth/register (admin only)
router.post('/register', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can create users' })
    }
    
    const { username, password, name, role, email, phone } = req.body
    
    if (!username || !password || !name) {
      return res.status(400).json({ error: 'Username, password and name are required' })
    }
    
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message })
    }
    
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' })
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new User({
      username,
      password: hashedPassword,
      name,
      role: role || 'teacher',
      email,
      phone
    })
    await user.save()
    
    logger.info('User created by admin', { username, role, createdBy: req.user.username })
    
    const userObj = user.toObject()
    delete userObj.password
    res.status(201).json(userObj)
  } catch (error) {
    logger.error('Register error', { error: error.message })
    res.status(500).json({ error: 'Failed to create user' })
  }
})

// POST /api/auth/parent/register
router.post('/parent/register', async (req, res) => {
  try {
    const { phone, password, name, childName } = req.body
    
    if (!phone || !password || !name) {
      return res.status(400).json({ error: 'Telefon, parol va ism majburiy' })
    }
    
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message })
    }
    
    const normalizedPhone = phone.replace(/\D/g, '').slice(-9)
    
    const existingUser = await User.findOne({ 
      phone: { $regex: normalizedPhone }, 
      role: 'parent' 
    })
    if (existingUser) {
      return res.status(400).json({ error: 'Bu telefon raqam allaqachon ro\'yxatdan o\'tgan' })
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new User({
      username: `parent_${normalizedPhone}`,
      password: hashedPassword,
      name,
      phone: `+998${normalizedPhone}`,
      role: 'parent',
      childName,
      isActive: true
    })
    await user.save()
    
    logger.info('Parent registered', { phone: `+998${normalizedPhone}`, name, ip: req.ip })
    
    const token = generateToken(user)
    const refreshToken = generateRefreshToken(user)
    
    const userObj = user.toObject()
    delete userObj.password
    res.status(201).json({
      success: true,
      message: 'Ro\'yxatdan o\'tish muvaffaqiyatli',
      token,
      refreshToken,
      user: userObj
    })
  } catch (error) {
    logger.error('Parent register error', { error: error.message, phone: req.body.phone })
    res.status(500).json({ error: 'Ro\'yxatdan o\'tishda xatolik' })
  }
})

// POST /api/auth/parent/login
router.post('/parent/login', checkAccountLockout, async (req, res) => {
  try {
    const { phone, password } = req.body
    
    if (!phone || !password) {
      return res.status(400).json({ error: 'Telefon va parol majburiy' })
    }
    
    const normalizedPhone = phone.replace(/\D/g, '').slice(-9)
    const username = `parent_${normalizedPhone}`
    
    logger.info('Parent login attempt', { phone: `+998${normalizedPhone}`, ip: req.ip })
    
    const user = await User.findOne({ 
      phone: { $regex: normalizedPhone }, 
      role: 'parent',
      isActive: true
    })
    
    if (!user) {
      recordFailedLogin(username)
      return res.status(401).json({ error: 'Telefon yoki parol noto\'g\'ri' })
    }
    
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      recordFailedLogin(username)
      return res.status(401).json({ error: 'Telefon yoki parol noto\'g\'ri' })
    }
    
    resetLoginAttempts(username)
    
    const token = generateToken(user)
    const refreshToken = generateRefreshToken(user)
    
    logger.info('Successful parent login', { phone: `+998${normalizedPhone}`, ip: req.ip })
    
    res.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        childName: user.childName
      }
    })
  } catch (error) {
    logger.error('Parent login error', { error: error.message, phone: req.body.phone })
    res.status(500).json({ error: 'Kirishda xatolik' })
  }
})

// GET /api/auth/parent/profile
router.get('/parent/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'parent') {
      return res.status(403).json({ error: 'Faqat ota-onalar uchun' })
    }
    
    const user = await User.findById(req.user.id).select('-password')
    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' })
    }
    
    // Bolani topish
    const normalizedPhone = user.phone?.replace(/\D/g, '').slice(-9)
    const child = await Child.findOne({
      $or: [
        { parentPhone: { $regex: normalizedPhone } },
        { 'parent.phone': { $regex: normalizedPhone } }
      ]
    })
    
    // Davomat, hisobotlar, to'lovlar - generic collectionlardan
    let attendance = [], reports = [], payments = []
    
    if (child) {
      const db = mongoose.connection
      attendance = await db.collection('attendance').find({ childId: child._id.toString() }).limit(30).toArray()
      reports = await db.collection('dailyreports').find({ childId: child._id.toString() }).limit(10).toArray()
      payments = await db.collection('payments').find({ childId: child._id.toString() }).limit(10).toArray()
    }
    
    res.json({
      success: true,
      user,
      child,
      attendance,
      reports,
      payments
    })
  } catch (error) {
    logger.error('Get parent profile error', { error: error.message, userId: req.user?.id })
    res.status(500).json({ error: 'Profil yuklashda xatolik' })
  }
})

// PUT /api/auth/parent/profile
router.put('/parent/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'parent') {
      return res.status(403).json({ error: 'Faqat ota-onalar uchun' })
    }
    
    const { name, email, address } = req.body
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, address, updatedAt: new Date() },
      { new: true }
    ).select('-password')
    
    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' })
    }
    
    res.json({ success: true, user })
  } catch (error) {
    logger.error('Update parent profile error', { error: error.message, userId: req.user?.id })
    res.status(500).json({ error: 'Profilni yangilashda xatolik' })
  }
})

// POST /api/auth/parent/reset-password
router.post('/parent/reset-password', async (req, res) => {
  try {
    const { phone, newPassword, childName } = req.body
    
    if (!phone || !newPassword) {
      return res.status(400).json({ error: 'Telefon va yangi parol majburiy' })
    }
    
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message })
    }
    
    const normalizedPhone = phone.replace(/\D/g, '').slice(-9)
    
    const user = await User.findOne({ 
      phone: { $regex: normalizedPhone }, 
      role: 'parent' 
    })
    
    if (!user) {
      return res.status(404).json({ error: 'Bu telefon raqam ro\'yxatdan o\'tmagan' })
    }
    
    // Bola ismini tekshirish (xavfsizlik uchun)
    if (childName) {
      const child = await Child.findOne({ parentPhone: { $regex: normalizedPhone } })
      if (child) {
        const childFirstName = child.firstName?.toLowerCase()
        const inputChildName = childName.toLowerCase()
        if (!childFirstName.includes(inputChildName) && !inputChildName.includes(childFirstName)) {
          return res.status(400).json({ error: 'Bola ismi noto\'g\'ri' })
        }
      }
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword
    user.updatedAt = new Date()
    await user.save()
    
    logger.info('Parent password reset', { phone: `+998${normalizedPhone}`, ip: req.ip })
    
    res.json({ success: true, message: 'Parol muvaffaqiyatli yangilandi' })
  } catch (error) {
    logger.error('Reset password error', { error: error.message, phone: req.body.phone })
    res.status(500).json({ error: 'Parolni tiklashda xatolik' })
  }
})

// POST /api/auth/parent/change-password
router.post('/parent/change-password', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'parent') {
      return res.status(403).json({ error: 'Faqat ota-onalar uchun' })
    }
    
    const { currentPassword, newPassword } = req.body
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Joriy va yangi parol majburiy' })
    }
    
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message })
    }
    
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' })
    }
    
    const validPassword = await bcrypt.compare(currentPassword, user.password)
    if (!validPassword) {
      return res.status(400).json({ error: 'Joriy parol noto\'g\'ri' })
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword
    user.updatedAt = new Date()
    await user.save()
    
    logger.info('Parent password changed', { userId: req.user.id, ip: req.ip })
    
    res.json({ success: true, message: 'Parol muvaffaqiyatli o\'zgartirildi' })
  } catch (error) {
    logger.error('Change password error', { error: error.message, userId: req.user?.id })
    res.status(500).json({ error: 'Parolni o\'zgartirishda xatolik' })
  }
})

export default router
