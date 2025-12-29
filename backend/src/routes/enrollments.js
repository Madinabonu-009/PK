import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import rateLimit from 'express-rate-limit'
import mongoose from 'mongoose'
import { authenticateToken } from '../middleware/auth.js'
import { sendEnrollmentAcceptedEmail, sendEnrollmentRejectedEmail } from '../utils/email.js'
import { sendEnrollmentNotification, sendEnrollmentAcceptedNotification } from '../utils/telegram.js'
import { isValidPhone, isValidEmail, isValidName, isValidChildAge, sanitizeString, errorResponse } from '../utils/helpers.js'
import logger from '../utils/logger.js'

const router = express.Router()

const getCollection = (name) => mongoose.connection.collection(name)

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
  
  if (data.contractAccepted !== true) {
    errors.push('Shartnomaga rozilik berish majburiy')
  }
  
  return errors
}

const normalizeDoc = (doc) => {
  if (!doc) return null
  const { _id, ...rest } = doc
  // Ensure birthDate is always available (fallback to childBirthDate)
  const birthDate = rest.birthDate || rest.childBirthDate
  // Ensure contractAccepted is properly set for old records
  const contractAccepted = rest.contractAccepted === true || !!rest.contractAcceptedAt || rest.status === 'accepted'
  return { 
    id: _id.toString(), 
    ...rest,
    birthDate,
    childBirthDate: birthDate,
    contractAccepted
  }
}

// GET /api/enrollments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const pageNum = parseInt(page) || 1
    const limitNum = Math.min(parseInt(limit) || 20, 100)
    const skip = (pageNum - 1) * limitNum
    
    let query = {}
    if (status && VALID_STATUSES.includes(status)) {
      query.status = status
    }
    
    const [enrollments, total] = await Promise.all([
      getCollection('enrollments').find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).toArray(),
      getCollection('enrollments').countDocuments(query)
    ])
    
    res.json({
      data: enrollments.map(normalizeDoc),
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
    logger.error('Enrollments fetch error', { error: error.message, stack: error.stack })
    res.status(500).json(errorResponse('Arizalarni yuklashda xatolik'))
  }
})

// GET /api/enrollments/status/:phone
const statusCheckLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: 'Juda ko\'p so\'rov yuborildi. Iltimos, 15 daqiqadan keyin qayta urinib ko\'ring.',
    code: 'TOO_MANY_REQUESTS'
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: (req) => {
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
    
    const enrollments = await getCollection('enrollments')
      .find({ parentPhone: phone })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()
    
    if (enrollments.length === 0) {
      return res.status(404).json(errorResponse('Ariza topilmadi'))
    }
    
    res.json(enrollments.map(e => ({
      id: e._id.toString(),
      childName: e.childName,
      status: e.status,
      submittedAt: e.submittedAt || e.createdAt,
      processedAt: e.processedAt,
      rejectionReason: e.rejectionReason
    })))
  } catch (error) {
    logger.error('Enrollment status fetch error', { error: error.message })
    res.status(500).json(errorResponse('Ariza holatini yuklashda xatolik'))
  }
})

// GET /api/enrollments/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    let enrollment
    try {
      enrollment = await getCollection('enrollments').findOne({ _id: new mongoose.Types.ObjectId(req.params.id) })
    } catch {
      enrollment = await getCollection('enrollments').findOne({ id: req.params.id })
    }
    
    if (!enrollment) return res.status(404).json(errorResponse('Ariza topilmadi'))
    res.json(normalizeDoc(enrollment))
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

    const enrollment = {
      id: uuidv4(),
      childName: sanitizeString(req.body.childName),
      childBirthDate: req.body.birthDate,
      birthDate: req.body.birthDate,
      parentName: sanitizeString(req.body.parentName),
      parentPhone: sanitizeString(req.body.parentPhone),
      parentEmail: sanitizeString(req.body.parentEmail),
      message: sanitizeString(req.body.notes),
      notes: sanitizeString(req.body.notes),
      status: 'pending',
      contractAccepted: true,
      contractAcceptedAt: contractAcceptedAt,
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
    
    await getCollection('enrollments').insertOne(enrollment)
    sendEnrollmentNotification(enrollment).catch(err => logger.error('Telegram notification error:', err))
    
    res.status(201).json(normalizeDoc(enrollment))
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

    let filter
    try {
      filter = { _id: new mongoose.Types.ObjectId(req.params.id) }
    } catch {
      filter = { id: req.params.id }
    }

    const updateData = { 
      status: finalStatus,
      processedAt: new Date().toISOString()
    }
    if (status === 'rejected') updateData.rejectionReason = rejectionReason.trim()
    if (finalStatus === 'accepted') updateData.reviewedAt = new Date().toISOString()
    
    const result = await getCollection('enrollments').findOneAndUpdate(
      filter,
      { $set: updateData },
      { returnDocument: 'after' }
    )
    
    // MongoDB 4.x va 5.x uchun moslik
    const enrollment = result?.value || result
    if (!enrollment || !enrollment._id) {
      return res.status(404).json(errorResponse('Ariza topilmadi'))
    }
    
    if (finalStatus === 'accepted') {
      const existingChild = await getCollection('children').findOne({ 
        firstName: enrollment.childName?.split(' ')[0],
        parentPhone: enrollment.parentPhone 
      })
      
      if (!existingChild) {
        const newChild = {
          id: uuidv4(),
          firstName: enrollment.childName?.split(' ')[0] || enrollment.childName,
          lastName: enrollment.childName?.split(' ').slice(1).join(' ') || '',
          birthDate: enrollment.childBirthDate || enrollment.birthDate,
          parentName: enrollment.parentName,
          parentPhone: enrollment.parentPhone,
          parentEmail: enrollment.parentEmail,
          groupId: groupId || null,
          allergies: [],
          notes: enrollment.notes || '',
          points: 0,
          level: 1,
          achievements: [],
          isActive: true,
          enrolledAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }
        await getCollection('children').insertOne(newChild)
        logger.info(`New child created from enrollment: ${newChild.id}`)
      }
      sendEnrollmentAcceptedEmail(enrollment).catch(err => logger.error('Email error:', err))
      if (typeof sendEnrollmentAcceptedNotification === 'function') {
        sendEnrollmentAcceptedNotification(enrollment).catch(err => logger.error('Telegram error:', err))
      }
    } else if (status === 'rejected') {
      sendEnrollmentRejectedEmail(enrollment).catch(err => logger.error('Email error:', err))
    }
    
    res.json(normalizeDoc(enrollment))
  } catch (error) {
    logger.error('Update enrollment error:', error)
    res.status(500).json(errorResponse('Arizani yangilashda xatolik'))
  }
})

// DELETE /api/enrollments/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    let filter
    try {
      filter = { _id: new mongoose.Types.ObjectId(req.params.id) }
    } catch {
      filter = { id: req.params.id }
    }

    const result = await getCollection('enrollments').findOneAndUpdate(
      filter,
      { $set: {
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: req.user?.id || 'unknown'
      }},
      { returnDocument: 'after' }
    )
    
    if (!result.value && !result._id) return res.status(404).json(errorResponse('Ariza topilmadi'))
    res.json({ success: true, message: 'Ariza o\'chirildi' })
  } catch (error) {
    logger.error('Delete enrollment error:', error)
    res.status(500).json(errorResponse('Arizani o\'chirishda xatolik'))
  }
})

export default router
