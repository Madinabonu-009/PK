import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import rateLimit from 'express-rate-limit'
import { readData, writeData } from '../utils/db.js'
import { authenticateToken } from '../middleware/auth.js'
import { sendEnrollmentAcceptedEmail, sendEnrollmentRejectedEmail } from '../utils/email.js'
import { sendEnrollmentNotification, sendEnrollmentAcceptedNotification } from '../utils/telegram.js'
import { normalizeId, isValidPhone, isValidEmail, isValidName, isValidChildAge, sanitizeString, errorResponse } from '../utils/helpers.js'
import logger from '../utils/logger.js'
import Enrollment from '../models/Enrollment.js'

const router = express.Router()

const VALID_STATUSES = ['pending', 'approved', 'rejected', 'accepted']

const validateEnrollment = (data) => {
  const errors = []
  
  if (!isValidName(data.childName)) {
    errors.push('Bola ismi 2-100 belgi bo\'lishi kerak')
  }
  
  if (!data.birthDate || !isValidChildAge(data.birthDate)) {
    errors.push('Bola yoshi 1-7 orasida bo\'lishi kerak')
  }
  
  if (!isValidName(data.parentName)) {
    errors.push('Ota-ona ismi 2-100 belgi bo\'lishi kerak')
  }
  
  if (!isValidPhone(data.parentPhone)) {
    errors.push('Telefon raqam noto\'g\'ri. Format: +998XXXXXXXXX')
  }
  
  if (!isValidEmail(data.parentEmail)) {
    errors.push('Email formati noto\'g\'ri')
  }
  
  // Shartnoma roziligi tekshiruvi
  if (data.contractAccepted !== true) {
    errors.push('Shartnomaga rozilik berish majburiy')
  }
  
  return errors
}

// GET /api/enrollments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const pageNum = parseInt(page) || 1
    const limitNum = Math.min(parseInt(limit) || 20, 100) // Max 100 per page
    const skip = (pageNum - 1) * limitNum
    
    if (req.app.locals.useDatabase) {
      let query = {}
      if (status && VALID_STATUSES.includes(status)) {
        query.status = status
      }
      
      const [enrollments, total] = await Promise.all([
        Enrollment.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
        Enrollment.countDocuments(query)
      ])
      
      return res.json({
        data: enrollments.map(normalizeId),
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
    
    let enrollments = readData('enrollments.json') || []
    if (status && VALID_STATUSES.includes(status)) {
      enrollments = enrollments.filter(e => e.status === status)
    }
    enrollments.sort((a, b) => new Date(b.submittedAt || b.createdAt) - new Date(a.submittedAt || a.createdAt))
    
    const total = enrollments.length
    const paginated = enrollments.slice(skip, skip + limitNum)
    
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
    logger.error('Enrollments fetch error', { error: error.message, stack: error.stack })
    res.status(500).json(errorResponse('Arizalarni yuklashda xatolik'))
  }
})

// GET /api/enrollments/status/:phone - Telefon raqam bo'yicha ariza holatini tekshirish
// Rate limited endpoint - public access but protected against abuse
const statusCheckLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Maximum 10 requests per 15 minutes per IP
  message: {
    error: 'Juda ko\'p so\'rov yuborildi. Iltimos, 15 daqiqadan keyin qayta urinib ko\'ring.',
    code: 'TOO_MANY_REQUESTS'
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: (req) => {
    // Rate limit by IP and phone number combination
    const phone = decodeURIComponent(req.params.phone || '')
    const ip = (req.ip || req.socket?.remoteAddress || 'unknown').replace(/^::ffff:/, '')
    return `${ip}-${phone.replace(/\D/g, '')}`
  }
})

router.get('/status/:phone', statusCheckLimiter, async (req, res) => {
  try {
    const phone = decodeURIComponent(req.params.phone)
    
    if (!isValidPhone(phone)) {
      return res.status(400).json(errorResponse('Telefon raqam noto\'g\'ri'))
    }
    
    logger.info('Enrollment status check', { phone, ip: req.ip })
    
    if (req.app.locals.useDatabase) {
      const enrollments = await Enrollment.find({ parentPhone: phone })
        .select('childName status createdAt reviewedAt rejectionReason')
        .sort({ createdAt: -1 })
        .limit(5) // Limit to last 5 enrollments for privacy
      if (enrollments.length === 0) {
        return res.status(404).json(errorResponse('Ariza topilmadi'))
      }
      return res.json(enrollments.map(normalizeId))
    }
    
    const enrollments = readData('enrollments.json') || []
    const userEnrollments = enrollments
      .filter(e => e.parentPhone === phone)
      .sort((a, b) => new Date(b.submittedAt || b.createdAt) - new Date(a.submittedAt || a.createdAt))
      .slice(0, 5) // Limit to last 5 enrollments for privacy
    
    if (userEnrollments.length === 0) {
      return res.status(404).json(errorResponse('Ariza topilmadi'))
    }
    
    res.json(userEnrollments.map(e => ({
      id: e.id,
      childName: e.childName,
      status: e.status,
      submittedAt: e.submittedAt || e.createdAt,
      processedAt: e.processedAt,
      rejectionReason: e.rejectionReason
    })))
  } catch (error) {
    logger.error('Enrollment status fetch error', { error: error.message, stack: error.stack, phone: req.params.phone })
    res.status(500).json(errorResponse('Ariza holatini yuklashda xatolik'))
  }
})

// GET /api/enrollments/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.app.locals.useDatabase) {
      const enrollment = await Enrollment.findById(req.params.id)
      if (!enrollment) return res.status(404).json(errorResponse('Ariza topilmadi'))
      return res.json(normalizeId(enrollment))
    }
    
    const enrollments = readData('enrollments.json') || []
    const enrollment = enrollments.find(e => e.id === req.params.id)
    if (!enrollment) return res.status(404).json(errorResponse('Ariza topilmadi'))
    res.json(enrollment)
  } catch (error) {
    logger.error('Enrollment fetch error:', error)
    res.status(500).json(errorResponse('Arizani yuklashda xatolik'))
  }
})

// POST /api/enrollments
router.post('/', async (req, res) => {
  try {
    const validationErrors = validateEnrollment(req.body)
    if (validationErrors.length > 0) {
      return res.status(400).json(errorResponse('Validatsiya xatosi', validationErrors))
    }

    const contractAcceptedAt = new Date().toISOString()

    if (req.app.locals.useDatabase) {
      const enrollment = new Enrollment({
        childName: sanitizeString(req.body.childName),
        childBirthDate: req.body.birthDate,
        parentName: sanitizeString(req.body.parentName),
        parentPhone: sanitizeString(req.body.parentPhone),
        parentEmail: sanitizeString(req.body.parentEmail),
        message: sanitizeString(req.body.notes),
        status: 'pending',
        contractAccepted: true,
        contractAcceptedAt: contractAcceptedAt
      })
      await enrollment.save()
      sendEnrollmentNotification(enrollment).catch(err => logger.error('Telegram notification error:', err))
      return res.status(201).json(normalizeId(enrollment))
    }
    
    const enrollments = readData('enrollments.json') || []
    const newEnrollment = {
      id: uuidv4(),
      childName: sanitizeString(req.body.childName),
      birthDate: req.body.birthDate,
      parentName: sanitizeString(req.body.parentName),
      parentPhone: sanitizeString(req.body.parentPhone),
      parentEmail: sanitizeString(req.body.parentEmail),
      notes: sanitizeString(req.body.notes),
      status: 'pending',
      contractAccepted: true,
      contractAcceptedAt: contractAcceptedAt,
      submittedAt: new Date().toISOString()
    }
    enrollments.push(newEnrollment)
    
    if (!writeData('enrollments.json', enrollments)) {
      return res.status(500).json(errorResponse('Arizani saqlashda xatolik'))
    }
    
    sendEnrollmentNotification(newEnrollment).catch(err => logger.error('Telegram notification error:', err))
    res.status(201).json(newEnrollment)
  } catch (error) {
    logger.error('Enrollment error:', error)
    res.status(500).json(errorResponse('Ariza yuborishda xatolik'))
  }
})

// PUT /api/enrollments/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { status, rejectionReason, groupId } = req.body
    
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json(errorResponse('Noto\'g\'ri status'))
    }
    if (status === 'rejected' && (!rejectionReason || rejectionReason.trim() === '')) {
      return res.status(400).json(errorResponse('Rad etish sababi kiritilishi shart'))
    }

    const finalStatus = (status === 'approved' || status === 'accepted') ? 'accepted' : status

    if (req.app.locals.useDatabase) {
      const updateData = { status: finalStatus }
      if (status === 'rejected') updateData.rejectionReason = rejectionReason.trim()
      if (finalStatus === 'accepted') updateData.reviewedAt = new Date()
      
      const enrollment = await Enrollment.findByIdAndUpdate(req.params.id, updateData, { new: true })
      if (!enrollment) return res.status(404).json(errorResponse('Ariza topilmadi'))
      
      if (finalStatus === 'accepted') {
        const Child = (await import('../models/Child.js')).default
        const existingChild = await Child.findOne({ 
          firstName: enrollment.childName?.split(' ')[0],
          parentPhone: enrollment.parentPhone 
        })
        
        if (!existingChild) {
          const newChild = new Child({
            firstName: enrollment.childName?.split(' ')[0] || enrollment.childName,
            lastName: enrollment.childName?.split(' ').slice(1).join(' ') || '',
            birthDate: enrollment.childBirthDate || enrollment.birthDate,
            parentName: enrollment.parentName,
            parentPhone: enrollment.parentPhone,
            parentEmail: enrollment.parentEmail,
            group: groupId || null,
            isActive: true,
            enrolledAt: new Date()
          })
          await newChild.save()
          logger.info(`New child created from enrollment: ${newChild._id}`)
        }
        sendEnrollmentAcceptedEmail(enrollment).catch(err => logger.error('Email error:', err))
        if (typeof sendEnrollmentAcceptedNotification === 'function') {
          sendEnrollmentAcceptedNotification(enrollment).catch(err => logger.error('Telegram error:', err))
        }
      } else if (status === 'rejected') {
        sendEnrollmentRejectedEmail(enrollment).catch(err => logger.error('Email error:', err))
      }
      return res.json(normalizeId(enrollment))
    }
    
    const enrollments = readData('enrollments.json') || []
    const index = enrollments.findIndex(e => e.id === req.params.id)
    if (index === -1) return res.status(404).json(errorResponse('Ariza topilmadi'))

    const updatedEnrollment = {
      ...enrollments[index],
      status: finalStatus,
      processedAt: new Date().toISOString()
    }
    if (status === 'rejected') updatedEnrollment.rejectionReason = rejectionReason.trim()
    
    enrollments[index] = updatedEnrollment
    
    if (!writeData('enrollments.json', enrollments)) {
      return res.status(500).json(errorResponse('Ma\'lumotlarni saqlashda xatolik'))
    }
    
    if (finalStatus === 'accepted') {
      const children = readData('children.json') || []
      const enrollment = updatedEnrollment
      
      const existingChild = children.find(c => 
        c.firstName === enrollment.childName?.split(' ')[0] && 
        c.parentPhone === enrollment.parentPhone
      )
      
      if (!existingChild) {
        const newChild = {
          id: uuidv4(),
          firstName: enrollment.childName?.split(' ')[0] || enrollment.childName,
          lastName: enrollment.childName?.split(' ').slice(1).join(' ') || '',
          birthDate: enrollment.birthDate,
          parentName: enrollment.parentName,
          parentPhone: enrollment.parentPhone,
          parentEmail: enrollment.parentEmail || '',
          groupId: groupId || null,
          allergies: [],
          notes: enrollment.notes || '',
          points: 0,
          level: 1,
          achievements: [],
          isActive: true,
          enrolledAt: new Date().toISOString()
        }
        children.push(newChild)
        
        if (!writeData('children.json', children)) {
          logger.error('Failed to save new child')
        } else {
          logger.info(`New child created from enrollment: ${newChild.id}`)
        }
      }
      
      sendEnrollmentAcceptedEmail(updatedEnrollment).catch(err => logger.error('Email error:', err))
      if (typeof sendEnrollmentAcceptedNotification === 'function') {
        sendEnrollmentAcceptedNotification(updatedEnrollment).catch(err => logger.error('Telegram error:', err))
      }
    } else if (status === 'rejected') {
      sendEnrollmentRejectedEmail(updatedEnrollment).catch(err => logger.error('Email error:', err))
    }
    
    res.json(updatedEnrollment)
  } catch (error) {
    logger.error('Update enrollment error:', error)
    res.status(500).json(errorResponse('Arizani yangilashda xatolik'))
  }
})

// DELETE /api/enrollments/:id (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.app.locals.useDatabase) {
      // Soft delete for MongoDB
      const enrollment = await Enrollment.findByIdAndUpdate(
        req.params.id,
        {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: req.user?.id || 'unknown'
        },
        { new: true }
      )
      if (!enrollment) return res.status(404).json(errorResponse('Ariza topilmadi'))
      return res.json({ success: true, message: 'Ariza o\'chirildi' })
    }
    
    let enrollments = readData('enrollments.json') || []
    const index = enrollments.findIndex(e => e.id === req.params.id)
    if (index === -1) return res.status(404).json(errorResponse('Ariza topilmadi'))
    
    // Soft delete - mark as deleted instead of removing
    enrollments[index].isDeleted = true
    enrollments[index].deletedAt = new Date().toISOString()
    enrollments[index].deletedBy = req.user?.id || 'unknown'
    
    if (!writeData('enrollments.json', enrollments)) {
      return res.status(500).json(errorResponse('Ma\'lumotlarni saqlashda xatolik'))
    }
    
    res.json({ success: true, message: 'Ariza o\'chirildi' })
  } catch (error) {
    logger.error('Delete enrollment error:', error)
    res.status(500).json(errorResponse('Arizani o\'chirishda xatolik'))
  }
})

export default router
