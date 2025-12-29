import express from 'express'
import mongoose from 'mongoose'
import Child from '../models/Child.js'
import Group from '../models/Group.js'
import { authenticateToken, requireRole } from '../middleware/auth.js'
import logger from '../utils/logger.js'

const router = express.Router()

// Helper: ID bo'yicha child topish
const findChildById = async (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    const child = await Child.findById(id)
    if (child) return child
  }
  return await Child.findOne({ $or: [{ id: id }, { _id: id }] })
}

// GET /api/children/public - Public endpoint (limited data)
router.get('/public', async (req, res) => {
  try {
    const { groupId } = req.query
    
    let query = { isActive: true, isDeleted: { $ne: true } }
    
    if (groupId) {
      query.groupId = groupId
    }
    
    const children = await Child.find(query)
      .select('firstName lastName birthDate groupId groupName photo points level achievements gender')
      .sort({ firstName: 1 })
    
    logger.info('Public children fetched', { count: children.length, groupId })
    
    res.json(children.map(c => ({
      id: c._id.toString(),
      _id: c._id,
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
    logger.error('Public children fetch error', { error: error.message })
    res.status(500).json({ error: 'Failed to fetch children' })
  }
})

// GET /api/children - Admin/Teacher endpoint (full data)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, groupId, page = 1, limit = 50 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    let query = { isDeleted: { $ne: true } }
    
    // Teacher faqat o'z guruhidagi bolalarni ko'radi
    if (req.user.role === 'teacher') {
      const assignedGroups = req.user.assignedGroups || []
      if (assignedGroups.length === 0) {
        return res.json({
          data: [],
          pagination: { page: parseInt(page), limit: parseInt(limit), total: 0 },
          message: 'No groups assigned to this teacher'
        })
      }
      query.groupId = { $in: assignedGroups }
    } else if (groupId) {
      query.groupId = groupId
    }
    
    // Search
    if (search) {
      const searchRegex = new RegExp(search, 'i')
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { parentName: searchRegex }
      ]
    }
    
    const total = await Child.countDocuments(query)
    const children = await Child.find(query)
      .sort({ firstName: 1 })
      .skip(skip)
      .limit(parseInt(limit))
    
    logger.info('Children fetched', { 
      count: children.length, 
      total, 
      groupId, 
      role: req.user.role 
    })
    
    res.json({
      data: children.map(c => ({
        id: c._id.toString(),
        _id: c._id,
        firstName: c.firstName,
        lastName: c.lastName,
        birthDate: c.birthDate,
        gender: c.gender,
        groupId: c.groupId,
        groupName: c.groupName,
        parentName: c.parentName,
        parentPhone: c.parentPhone,
        parentEmail: c.parentEmail,
        address: c.address,
        photo: c.photo,
        allergies: c.allergies || [],
        notes: c.notes,
        points: c.points || 0,
        level: c.level || 1,
        achievements: c.achievements || [],
        isActive: c.isActive,
        enrolledAt: c.enrolledAt || c.enrollmentDate,
        createdAt: c.createdAt
      })),
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    })
  } catch (error) {
    logger.error('Children fetch error', { error: error.message })
    res.status(500).json({ error: 'Failed to fetch children' })
  }
})

// GET /api/children/by-group/:groupId - Guruh bo'yicha bolalar
router.get('/by-group/:groupId', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params
    
    // Teacher faqat o'z guruhini ko'radi
    if (req.user.role === 'teacher') {
      const assignedGroups = req.user.assignedGroups || []
      if (!assignedGroups.includes(groupId)) {
        return res.status(403).json({ error: 'You are not assigned to this group' })
      }
    }
    
    const children = await Child.find({ 
      groupId, 
      isDeleted: { $ne: true } 
    }).sort({ firstName: 1 })
    
    res.json(children.map(c => ({
      id: c._id.toString(),
      _id: c._id,
      firstName: c.firstName,
      lastName: c.lastName,
      birthDate: c.birthDate,
      gender: c.gender,
      groupId: c.groupId,
      groupName: c.groupName,
      parentName: c.parentName,
      parentPhone: c.parentPhone,
      photo: c.photo,
      points: c.points || 0,
      level: c.level || 1
    })))
  } catch (error) {
    logger.error('Children by group error', { error: error.message, groupId: req.params.groupId })
    res.status(500).json({ error: 'Failed to fetch children' })
  }
})

// GET /api/children/:id - Bitta bola
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const child = await findChildById(req.params.id)
    
    if (!child) {
      return res.status(404).json({ error: 'Child not found' })
    }
    
    // Teacher faqat o'z guruhidagi bolani ko'radi
    if (req.user.role === 'teacher') {
      const assignedGroups = req.user.assignedGroups || []
      if (!assignedGroups.includes(child.groupId)) {
        return res.status(403).json({ error: 'You are not assigned to this child\'s group' })
      }
    }
    
    res.json({
      id: child._id.toString(),
      _id: child._id,
      firstName: child.firstName,
      lastName: child.lastName,
      birthDate: child.birthDate,
      gender: child.gender,
      groupId: child.groupId,
      groupName: child.groupName,
      parentName: child.parentName,
      parentPhone: child.parentPhone,
      parentEmail: child.parentEmail,
      address: child.address,
      photo: child.photo,
      allergies: child.allergies || [],
      notes: child.notes,
      medicalInfo: child.medicalInfo,
      points: child.points || 0,
      level: child.level || 1,
      achievements: child.achievements || [],
      isActive: child.isActive,
      enrolledAt: child.enrolledAt || child.enrollmentDate,
      createdAt: child.createdAt
    })
  } catch (error) {
    logger.error('Child fetch error', { error: error.message, id: req.params.id })
    res.status(500).json({ error: 'Failed to fetch child' })
  }
})

// POST /api/children - Yangi bola qo'shish (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can add children' })
    }
    
    const { firstName, lastName, birthDate, gender, groupId, groupName,
            parentName, parentPhone, parentEmail, address, photo, 
            allergies, notes, medicalInfo } = req.body
    
    // Validation
    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'First name and last name are required' })
    }
    if (!birthDate) {
      return res.status(400).json({ error: 'Birth date is required' })
    }
    if (!gender) {
      return res.status(400).json({ error: 'Gender is required' })
    }
    if (!groupId) {
      return res.status(400).json({ error: 'Group is required' })
    }
    if (!parentName || !parentPhone) {
      return res.status(400).json({ error: 'Parent name and phone are required' })
    }
    
    // Guruh nomini olish
    let finalGroupName = groupName
    if (!finalGroupName) {
      let group = null
      // String id bo'yicha qidirish
      group = await Group.findOne({ id: groupId, isDeleted: { $ne: true } })
      // ObjectId bo'yicha qidirish
      if (!group && mongoose.Types.ObjectId.isValid(groupId)) {
        group = await Group.findOne({ _id: new mongoose.Types.ObjectId(groupId), isDeleted: { $ne: true } })
      }
      finalGroupName = group?.name || 'Unknown'
    }
    
    const child = new Child({
      firstName,
      lastName,
      birthDate: new Date(birthDate),
      gender,
      groupId,
      groupName: finalGroupName,
      parentName,
      parentPhone,
      parentEmail,
      address,
      photo,
      allergies: allergies || [],
      notes,
      medicalInfo,
      points: 0,
      level: 1,
      achievements: [],
      isActive: true,
      isDeleted: false,
      enrolledAt: new Date()
    })
    
    await child.save()
    
    logger.info('Child created', { id: child._id, name: `${firstName} ${lastName}`, createdBy: req.user.username })
    
    res.status(201).json({
      id: child._id.toString(),
      _id: child._id,
      ...child.toObject()
    })
  } catch (error) {
    logger.error('Child create error', { error: error.message })
    res.status(500).json({ error: 'Failed to create child', details: error.message })
  }
})

// PUT /api/children/:id - Bola ma'lumotlarini yangilash
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const child = await findChildById(req.params.id)
    
    if (!child) {
      return res.status(404).json({ error: 'Child not found' })
    }
    
    // Teacher faqat o'z guruhidagi bolani yangilaydi
    if (req.user.role === 'teacher') {
      const assignedGroups = req.user.assignedGroups || []
      if (!assignedGroups.includes(child.groupId)) {
        return res.status(403).json({ error: 'You are not assigned to this child\'s group' })
      }
    }
    
    const { firstName, lastName, birthDate, gender, groupId, groupName,
            parentName, parentPhone, parentEmail, address, photo,
            allergies, notes, medicalInfo, isActive } = req.body
    
    // Update fields
    if (firstName !== undefined) child.firstName = firstName
    if (lastName !== undefined) child.lastName = lastName
    if (birthDate !== undefined) child.birthDate = new Date(birthDate)
    if (gender !== undefined) child.gender = gender
    if (groupId !== undefined) {
      child.groupId = groupId
      // Guruh nomini yangilash
      if (!groupName) {
        let group = null
        // String id bo'yicha qidirish
        group = await Group.findOne({ id: groupId, isDeleted: { $ne: true } })
        // ObjectId bo'yicha qidirish
        if (!group && mongoose.Types.ObjectId.isValid(groupId)) {
          group = await Group.findOne({ _id: new mongoose.Types.ObjectId(groupId), isDeleted: { $ne: true } })
        }
        child.groupName = group?.name || child.groupName
      }
    }
    if (groupName !== undefined) child.groupName = groupName
    if (parentName !== undefined) child.parentName = parentName
    if (parentPhone !== undefined) child.parentPhone = parentPhone
    if (parentEmail !== undefined) child.parentEmail = parentEmail
    if (address !== undefined) child.address = address
    if (photo !== undefined) child.photo = photo
    if (allergies !== undefined) child.allergies = allergies
    if (notes !== undefined) child.notes = notes
    if (medicalInfo !== undefined) child.medicalInfo = medicalInfo
    if (isActive !== undefined) child.isActive = isActive
    
    await child.save()
    
    logger.info('Child updated', { id: child._id, updatedBy: req.user.username })
    
    res.json({
      id: child._id.toString(),
      _id: child._id,
      ...child.toObject()
    })
  } catch (error) {
    logger.error('Child update error', { error: error.message, id: req.params.id })
    res.status(500).json({ error: 'Failed to update child' })
  }
})

// DELETE /api/children/:id - Bolani o'chirish (soft delete, admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can delete children' })
    }
    
    const child = await findChildById(req.params.id)
    
    if (!child) {
      return res.status(404).json({ error: 'Child not found' })
    }
    
    // Soft delete
    child.isActive = false
    child.isDeleted = true
    await child.save()
    
    logger.info('Child deleted', { id: child._id, deletedBy: req.user.username })
    
    res.json({ success: true, message: 'Child deleted successfully' })
  } catch (error) {
    logger.error('Child delete error', { error: error.message, id: req.params.id })
    res.status(500).json({ error: 'Failed to delete child' })
  }
})

// POST /api/children/:id/points - Ball qo'shish
router.post('/:id/points', authenticateToken, async (req, res) => {
  try {
    const { points, reason } = req.body
    
    if (typeof points !== 'number') {
      return res.status(400).json({ error: 'Points must be a number' })
    }
    
    const child = await findChildById(req.params.id)
    
    if (!child) {
      return res.status(404).json({ error: 'Child not found' })
    }
    
    // Teacher faqat o'z guruhidagi bolaga ball qo'shadi
    if (req.user.role === 'teacher') {
      const assignedGroups = req.user.assignedGroups || []
      if (!assignedGroups.includes(child.groupId)) {
        return res.status(403).json({ error: 'You are not assigned to this child\'s group' })
      }
    }
    
    const newPoints = (child.points || 0) + points
    const newLevel = Math.floor(newPoints / 100) + 1
    
    child.points = newPoints
    child.level = newLevel
    await child.save()
    
    logger.info('Points added', { childId: child._id, points, newTotal: newPoints, addedBy: req.user.username })
    
    res.json({
      id: child._id.toString(),
      points: newPoints,
      level: newLevel,
      message: `${points} ball qo'shildi`
    })
  } catch (error) {
    logger.error('Add points error', { error: error.message, id: req.params.id })
    res.status(500).json({ error: 'Failed to add points' })
  }
})

// POST /api/children/:id/achievements - Yutuq qo'shish
router.post('/:id/achievements', authenticateToken, async (req, res) => {
  try {
    const { achievementId } = req.body
    
    if (!achievementId) {
      return res.status(400).json({ error: 'Achievement ID is required' })
    }
    
    const child = await findChildById(req.params.id)
    
    if (!child) {
      return res.status(404).json({ error: 'Child not found' })
    }
    
    // Teacher faqat o'z guruhidagi bolaga yutuq qo'shadi
    if (req.user.role === 'teacher') {
      const assignedGroups = req.user.assignedGroups || []
      if (!assignedGroups.includes(child.groupId)) {
        return res.status(403).json({ error: 'You are not assigned to this child\'s group' })
      }
    }
    
    // Yutuq allaqachon bormi tekshirish
    const hasAchievement = child.achievements?.some(a => a.achievementId === achievementId)
    if (hasAchievement) {
      return res.status(400).json({ error: 'Child already has this achievement' })
    }
    
    child.achievements = child.achievements || []
    child.achievements.push({
      achievementId,
      earnedAt: new Date(),
      awardedBy: req.user.username
    })
    
    // Yutuq uchun ball qo'shish
    child.points = (child.points || 0) + 10
    child.level = Math.floor(child.points / 100) + 1
    
    await child.save()
    
    logger.info('Achievement added', { childId: child._id, achievementId, awardedBy: req.user.username })
    
    res.json({
      id: child._id.toString(),
      achievements: child.achievements,
      points: child.points,
      level: child.level
    })
  } catch (error) {
    logger.error('Add achievement error', { error: error.message, id: req.params.id })
    res.status(500).json({ error: 'Failed to add achievement' })
  }
})

export default router
