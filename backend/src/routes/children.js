import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import { normalizeId, isValidName, isValidPhone, errorResponse } from '../utils/helpers.js'
import logger from '../utils/logger.js'
import Child from '../models/Child.js'

const router = express.Router()

const validateChild = (data, isUpdate = false) => {
  const errors = []
  
  if (!isUpdate || data.firstName !== undefined) {
    if (!isValidName(data.firstName)) errors.push('Ism kiritilishi shart')
  }
  
  if (!isUpdate || data.lastName !== undefined) {
    if (!isValidName(data.lastName)) errors.push('Familiya kiritilishi shart')
  }
  
  if (!isUpdate || data.birthDate !== undefined) {
    if (!data.birthDate) errors.push('Tug\'ilgan sana kiritilishi shart')
  }
  
  if (data.parentPhone && !isValidPhone(data.parentPhone)) {
    errors.push('Telefon raqam noto\'g\'ri formatda')
  }
  
  return errors
}

// GET /api/children/public - Ommaviy (autentifikatsiyasiz)
router.get('/public', async (req, res) => {
  try {
    const children = await Child.find({ isActive: true, isDeleted: { $ne: true } })
      .select('firstName lastName birthDate groupName groupId photo points level achievements gender')
    
    res.json(children.map(c => ({
      id: c._id,
      firstName: c.firstName,
      lastName: c.lastName,
      birthDate: c.birthDate,
      groupId: c.groupId,
      groupName: c.groupName,
      photo: c.photo,
      points: c.points || 0,
      level: c.level || 1,
      achievements: c.achievements || [],
      gender: c.gender
    })))
  } catch (error) {
    logger.error('Public children fetch error:', error)
    res.status(500).json(errorResponse('Bolalar ro\'yxatini yuklashda xatolik'))
  }
})

// GET /api/children
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, groupId, page = 1, limit = 20, includeDeleted } = req.query
    const pageNum = parseInt(page) || 1
    const limitNum = Math.min(parseInt(limit) || 20, 100)
    const skip = (pageNum - 1) * limitNum
    
    let query = { isDeleted: { $ne: true } }
    if (includeDeleted === 'true' && req.user?.role === 'admin') {
      delete query.isDeleted
    }
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ]
    }
    if (groupId) query.groupId = groupId
    
    const [children, total] = await Promise.all([
      Child.find(query).skip(skip).limit(limitNum).sort({ createdAt: -1 }),
      Child.countDocuments(query)
    ])
    
    res.json({
      data: children.map(normalizeId),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasNext: pageNum * limitNum < total,
        hasPrev: pageNum > 1
      }
    })
  } catch (error) {
    logger.error('Children fetch error:', error)
    res.status(500).json(errorResponse('Bolalar ro\'yxatini yuklashda xatolik'))
  }
})

// GET /api/children/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const child = await Child.findById(req.params.id)
    if (!child) return res.status(404).json(errorResponse('Bola topilmadi'))
    res.json(normalizeId(child))
  } catch (error) {
    logger.error('Child fetch error:', error)
    res.status(500).json(errorResponse('Bola ma\'lumotlarini yuklashda xatolik'))
  }
})

// POST /api/children
router.post('/', authenticateToken, async (req, res) => {
  try {
    const validationErrors = validateChild(req.body)
    if (validationErrors.length > 0) {
      return res.status(400).json(errorResponse('Validatsiya xatosi', validationErrors))
    }

    const child = new Child({
      ...req.body,
      points: 0,
      level: 1,
      achievements: [],
      isActive: true,
      enrolledAt: new Date()
    })
    await child.save()
    res.status(201).json(normalizeId(child))
  } catch (error) {
    logger.error('Create child error:', error)
    res.status(500).json(errorResponse('Bola qo\'shishda xatolik'))
  }
})

// PUT /api/children/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const validationErrors = validateChild(req.body, true)
    if (validationErrors.length > 0) {
      return res.status(400).json(errorResponse('Validatsiya xatosi', validationErrors))
    }
    
    const child = await Child.findByIdAndUpdate(
      req.params.id, 
      { ...req.body, updatedAt: new Date() }, 
      { new: true, runValidators: true }
    )
    if (!child) return res.status(404).json(errorResponse('Bola topilmadi'))
    res.json(normalizeId(child))
  } catch (error) {
    logger.error('Update child error:', error)
    res.status(500).json(errorResponse('Bola ma\'lumotlarini yangilashda xatolik'))
  }
})

// DELETE /api/children/:id (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const child = await Child.findByIdAndUpdate(
      req.params.id,
      { 
        isDeleted: true, 
        deletedAt: new Date(),
        deletedBy: req.user?.id || 'unknown'
      },
      { new: true }
    )
    if (!child) return res.status(404).json(errorResponse('Bola topilmadi'))
    res.json({ success: true, message: 'Bola o\'chirildi' })
  } catch (error) {
    logger.error('Delete child error:', error)
    res.status(500).json(errorResponse('Bolani o\'chirishda xatolik'))
  }
})

// POST /api/children/:id/points - Ball qo'shish
router.post('/:id/points', authenticateToken, async (req, res) => {
  try {
    const { points } = req.body
    
    if (typeof points !== 'number' || isNaN(points)) {
      return res.status(400).json(errorResponse('Ball raqam bo\'lishi kerak'))
    }
    
    const child = await Child.findByIdAndUpdate(
      req.params.id, 
      { $inc: { points } }, 
      { new: true }
    )
    if (!child) return res.status(404).json(errorResponse('Bola topilmadi'))
    
    const newLevel = Math.floor(child.points / 100) + 1
    if (newLevel !== child.level) {
      child.level = newLevel
      await child.save()
    }
    res.json(normalizeId(child))
  } catch (error) {
    logger.error('Add points error:', error)
    res.status(500).json(errorResponse('Ball qo\'shishda xatolik'))
  }
})

export default router
