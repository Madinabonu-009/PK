import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { readData, writeData } from '../utils/db.js'
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
    console.log('[Children Public] Fetching public children...')
    
    if (req.app.locals.useDatabase) {
      const children = await Child.find({ isActive: true })
        .select('firstName lastName birthDate groupName group photo points level achievements gender')
        .populate('group', 'name')
      console.log('[Children Public] MongoDB children count:', children.length)
      return res.json(children.map(normalizeId))
    }
    
    const allChildren = readData('children.json') || []
    console.log('[Children Public] Total children in file:', allChildren.length)
    
    // Faqat aktiv va o'chirilmagan bolalarni olish
    const activeChildren = allChildren.filter(c => {
      const isActive = c.isActive !== false
      const notDeleted = !c.isDeleted
      console.log(`[Children Public] ${c.firstName}: isActive=${c.isActive}, isDeleted=${c.isDeleted}, pass=${isActive && notDeleted}`)
      return isActive && notDeleted
    })
    
    console.log('[Children Public] Active children count:', activeChildren.length)
    
    // Sodda format - faqat kerakli fieldlarni qaytarish
    const result = activeChildren.map(c => ({
      id: c.id,
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
    }))
    
    console.log('[Children Public] Returning', result.length, 'children')
    res.json(result)
  } catch (error) {
    console.error('[Children Public] Error:', error)
    logger.error('Public children fetch error:', error)
    res.status(500).json(errorResponse('Bolalar ro\'yxatini yuklashda xatolik'))
  }
})

// GET /api/children
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, groupId, page = 1, limit = 20, includeDeleted } = req.query
    const pageNum = parseInt(page) || 1
    const limitNum = Math.min(parseInt(limit) || 20, 100) // Max 100 per page
    const skip = (pageNum - 1) * limitNum
    
    if (req.app.locals.useDatabase) {
      let query = { isDeleted: { $ne: true } } // Exclude soft-deleted by default
      if (includeDeleted === 'true' && req.user?.role === 'admin') {
        delete query.isDeleted
      }
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } }
        ]
      }
      if (groupId) query.group = groupId
      
      const [children, total] = await Promise.all([
        Child.find(query).populate('group').skip(skip).limit(limitNum).sort({ createdAt: -1 }),
        Child.countDocuments(query)
      ])
      
      return res.json({
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
    }
    
    let children = readData('children.json') || []
    
    // Filter out soft-deleted children by default
    if (!(includeDeleted === 'true' && req.user?.role === 'admin')) {
      children = children.filter(c => !c.isDeleted)
    }
    
    if (search) {
      const searchLower = search.toLowerCase()
      children = children.filter(c => 
        c.firstName?.toLowerCase().includes(searchLower) ||
        c.lastName?.toLowerCase().includes(searchLower)
      )
    }
    if (groupId) {
      children = children.filter(c => c.groupId === groupId)
    }
    
    const total = children.length
    const paginated = children.slice(skip, skip + limitNum)
    
    res.json({
      data: paginated,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasNext: skip + limitNum < total,
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
    if (req.app.locals.useDatabase) {
      const child = await Child.findById(req.params.id).populate('group')
      if (!child) return res.status(404).json(errorResponse('Bola topilmadi'))
      return res.json(normalizeId(child))
    }
    
    const children = readData('children.json') || []
    const child = children.find(c => c.id === req.params.id)
    if (!child) return res.status(404).json(errorResponse('Bola topilmadi'))
    res.json(child)
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

    if (req.app.locals.useDatabase) {
      const child = new Child(req.body)
      await child.save()
      return res.status(201).json(normalizeId(child))
    }
    
    const children = readData('children.json') || []
    const newChild = {
      id: uuidv4(),
      firstName: req.body.firstName?.trim(),
      lastName: req.body.lastName?.trim(),
      birthDate: req.body.birthDate,
      groupId: req.body.groupId,
      parentName: req.body.parentName?.trim(),
      parentPhone: req.body.parentPhone?.trim(),
      allergies: req.body.allergies || [],
      notes: req.body.notes?.trim() || '',
      points: 0,
      level: 1,
      achievements: [],
      isActive: true,
      enrolledAt: new Date().toISOString()
    }
    children.push(newChild)
    
    if (!writeData('children.json', children)) {
      return res.status(500).json(errorResponse('Ma\'lumotlarni saqlashda xatolik'))
    }
    
    res.status(201).json(newChild)
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
    
    if (req.app.locals.useDatabase) {
      const child = await Child.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      if (!child) return res.status(404).json(errorResponse('Bola topilmadi'))
      return res.json(normalizeId(child))
    }
    
    const children = readData('children.json') || []
    const index = children.findIndex(c => c.id === req.params.id)
    if (index === -1) return res.status(404).json(errorResponse('Bola topilmadi'))
    
    const updatedChild = { ...children[index], ...req.body, updatedAt: new Date().toISOString() }
    children[index] = updatedChild
    
    if (!writeData('children.json', children)) {
      return res.status(500).json(errorResponse('Ma\'lumotlarni saqlashda xatolik'))
    }
    
    res.json(updatedChild)
  } catch (error) {
    logger.error('Update child error:', error)
    res.status(500).json(errorResponse('Bola ma\'lumotlarini yangilashda xatolik'))
  }
})

// DELETE /api/children/:id (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.app.locals.useDatabase) {
      // Soft delete for MongoDB
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
      return res.json({ success: true, message: 'Bola o\'chirildi' })
    }
    
    let children = readData('children.json') || []
    const index = children.findIndex(c => c.id === req.params.id)
    if (index === -1) return res.status(404).json(errorResponse('Bola topilmadi'))
    
    // Soft delete - mark as deleted instead of removing
    children[index].isDeleted = true
    children[index].deletedAt = new Date().toISOString()
    children[index].deletedBy = req.user?.id || 'unknown'
    
    if (!writeData('children.json', children)) {
      return res.status(500).json(errorResponse('Ma\'lumotlarni saqlashda xatolik'))
    }
    
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
    
    if (req.app.locals.useDatabase) {
      const child = await Child.findByIdAndUpdate(req.params.id, { $inc: { points } }, { new: true })
      if (!child) return res.status(404).json(errorResponse('Bola topilmadi'))
      
      const newLevel = Math.floor(child.points / 100) + 1
      if (newLevel !== child.level) {
        child.level = newLevel
        await child.save()
      }
      return res.json(normalizeId(child))
    }
    
    const children = readData('children.json') || []
    const index = children.findIndex(c => c.id === req.params.id)
    if (index === -1) return res.status(404).json(errorResponse('Bola topilmadi'))
    
    children[index].points = (children[index].points || 0) + points
    children[index].level = Math.floor(children[index].points / 100) + 1
    
    if (!writeData('children.json', children)) {
      return res.status(500).json(errorResponse('Ma\'lumotlarni saqlashda xatolik'))
    }
    
    res.json(children[index])
  } catch (error) {
    logger.error('Add points error:', error)
    res.status(500).json(errorResponse('Ball qo\'shishda xatolik'))
  }
})

export default router
