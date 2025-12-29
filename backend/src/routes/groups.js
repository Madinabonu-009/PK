import express from 'express'
import mongoose from 'mongoose'
import Group from '../models/Group.js'
import Child from '../models/Child.js'
import Teacher from '../models/Teacher.js'
import { authenticateToken } from '../middleware/auth.js'
import logger from '../utils/logger.js'

const router = express.Router()

// Helper: ID bo'yicha group topish
const findGroupById = async (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    const group = await Group.findById(id)
    if (group) return group
  }
  return await Group.findOne({ $or: [{ id: id }, { _id: id }] })
}

// GET /api/groups/public - Public endpoint
router.get('/public', async (req, res) => {
  try {
    const groups = await Group.find({ isActive: true, isDeleted: { $ne: true } })
      .select('id name ageRange capacity')
    
    res.json(groups.map(g => ({
      id: g.id || g._id.toString(),
      _id: g._id,
      name: g.name,
      ageRange: g.ageRange
    })))
  } catch (error) {
    logger.error('Public groups fetch error', { error: error.message })
    res.status(500).json({ error: 'Failed to fetch groups' })
  }
})

// GET /api/groups - Barcha guruhlar (with child count)
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find({ isDeleted: { $ne: true } })
    
    // Har bir guruh uchun bolalar sonini hisoblash
    const result = await Promise.all(groups.map(async (g) => {
      const groupId = g.id || g._id.toString()
      const childCount = await Child.countDocuments({ 
        groupId: groupId, 
        isDeleted: { $ne: true } 
      })
      
      return {
        id: groupId,
        _id: g._id,
        name: g.name,
        ageRange: g.ageRange,
        capacity: g.capacity,
        teacherId: g.teacherId,
        teacherName: g.teacherName,
        monthlyFee: g.monthlyFee,
        isActive: g.isActive,
        childCount
      }
    }))
    
    logger.info('Groups fetched', { count: result.length })
    
    res.json(result)
  } catch (error) {
    logger.error('Groups fetch error', { error: error.message })
    res.status(500).json({ error: 'Failed to fetch groups' })
  }
})

// GET /api/groups/my - Teacher uchun o'z guruhlari
router.get('/my', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can access this endpoint' })
    }
    
    const assignedGroups = req.user.assignedGroups || []
    
    if (assignedGroups.length === 0) {
      return res.json({
        groups: [],
        message: 'No groups assigned to this teacher'
      })
    }
    
    const groups = await Group.find({
      $or: [
        { id: { $in: assignedGroups } },
        { _id: { $in: assignedGroups.filter(id => mongoose.Types.ObjectId.isValid(id)) } }
      ],
      isDeleted: { $ne: true }
    })
    
    const result = await Promise.all(groups.map(async (g) => {
      const groupId = g.id || g._id.toString()
      const childCount = await Child.countDocuments({ 
        groupId: groupId, 
        isDeleted: { $ne: true } 
      })
      
      return {
        id: groupId,
        _id: g._id,
        name: g.name,
        ageRange: g.ageRange,
        capacity: g.capacity,
        childCount
      }
    }))
    
    res.json({ groups: result })
  } catch (error) {
    logger.error('My groups fetch error', { error: error.message, userId: req.user?.id })
    res.status(500).json({ error: 'Failed to fetch groups' })
  }
})

// GET /api/groups/:id - Bitta guruh
router.get('/:id', async (req, res) => {
  try {
    const group = await findGroupById(req.params.id)
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' })
    }
    
    const groupId = group.id || group._id.toString()
    const childCount = await Child.countDocuments({ 
      groupId: groupId, 
      isDeleted: { $ne: true } 
    })
    
    res.json({
      id: groupId,
      _id: group._id,
      name: group.name,
      ageRange: group.ageRange,
      capacity: group.capacity,
      teacherId: group.teacherId,
      teacherName: group.teacherName,
      monthlyFee: group.monthlyFee,
      isActive: group.isActive,
      childCount
    })
  } catch (error) {
    logger.error('Group fetch error', { error: error.message, id: req.params.id })
    res.status(500).json({ error: 'Failed to fetch group' })
  }
})

// GET /api/groups/:id/children - Guruhdagi bolalar
router.get('/:id/children', authenticateToken, async (req, res) => {
  try {
    const group = await findGroupById(req.params.id)
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' })
    }
    
    const groupId = group.id || group._id.toString()
    
    // Teacher faqat o'z guruhini ko'radi
    if (req.user.role === 'teacher') {
      const assignedGroups = req.user.assignedGroups || []
      if (!assignedGroups.includes(groupId)) {
        return res.status(403).json({ error: 'You are not assigned to this group' })
      }
    }
    
    const children = await Child.find({ 
      groupId: groupId, 
      isDeleted: { $ne: true } 
    }).sort({ firstName: 1 })
    
    res.json({
      group: {
        id: groupId,
        name: group.name
      },
      children: children.map(c => ({
        id: c._id.toString(),
        _id: c._id,
        firstName: c.firstName,
        lastName: c.lastName,
        birthDate: c.birthDate,
        gender: c.gender,
        parentName: c.parentName,
        parentPhone: c.parentPhone,
        photo: c.photo,
        points: c.points || 0,
        level: c.level || 1
      }))
    })
  } catch (error) {
    logger.error('Group children fetch error', { error: error.message, id: req.params.id })
    res.status(500).json({ error: 'Failed to fetch children' })
  }
})

// POST /api/groups - Yangi guruh yaratish (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can create groups' })
    }
    
    const { id, name, ageRange, capacity, teacherId, monthlyFee } = req.body
    
    if (!name) {
      return res.status(400).json({ error: 'Group name is required' })
    }
    
    // Nom unique bo'lishi kerak
    const existingGroup = await Group.findOne({ name })
    if (existingGroup) {
      return res.status(400).json({ error: 'Group with this name already exists' })
    }
    
    // Teacher nomini olish
    let teacherName = null
    if (teacherId) {
      const teacher = await Teacher.findOne({ $or: [{ id: teacherId }, { _id: teacherId }] })
      teacherName = teacher?.name || `${teacher?.firstName} ${teacher?.lastName}`.trim()
    }
    
    const group = new Group({
      id: id || `g${Date.now()}`,
      name,
      ageRange: ageRange || '',
      capacity: capacity || 20,
      teacherId,
      teacherName,
      monthlyFee: monthlyFee || 500000,
      isActive: true,
      isDeleted: false
    })
    
    await group.save()
    
    logger.info('Group created', { id: group._id, name, createdBy: req.user.username })
    
    res.status(201).json({
      id: group.id || group._id.toString(),
      _id: group._id,
      ...group.toObject()
    })
  } catch (error) {
    logger.error('Group create error', { error: error.message })
    res.status(500).json({ error: 'Failed to create group', details: error.message })
  }
})

// PUT /api/groups/:id - Guruhni yangilash (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can update groups' })
    }
    
    const group = await findGroupById(req.params.id)
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' })
    }
    
    const { name, ageRange, capacity, teacherId, monthlyFee, isActive } = req.body
    
    if (name !== undefined) group.name = name
    if (ageRange !== undefined) group.ageRange = ageRange
    if (capacity !== undefined) group.capacity = capacity
    if (monthlyFee !== undefined) group.monthlyFee = monthlyFee
    if (isActive !== undefined) group.isActive = isActive
    
    // Teacher yangilash
    if (teacherId !== undefined) {
      group.teacherId = teacherId
      if (teacherId) {
        const teacher = await Teacher.findOne({ $or: [{ id: teacherId }, { _id: teacherId }] })
        group.teacherName = teacher?.name || `${teacher?.firstName} ${teacher?.lastName}`.trim()
      } else {
        group.teacherName = null
      }
    }
    
    await group.save()
    
    logger.info('Group updated', { id: group._id, updatedBy: req.user.username })
    
    res.json({
      id: group.id || group._id.toString(),
      _id: group._id,
      ...group.toObject()
    })
  } catch (error) {
    logger.error('Group update error', { error: error.message, id: req.params.id })
    res.status(500).json({ error: 'Failed to update group' })
  }
})

// DELETE /api/groups/:id - Guruhni o'chirish (soft delete, admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can delete groups' })
    }
    
    const group = await findGroupById(req.params.id)
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' })
    }
    
    // Guruhda bolalar bormi tekshirish
    const groupId = group.id || group._id.toString()
    const childCount = await Child.countDocuments({ 
      groupId: groupId, 
      isDeleted: { $ne: true } 
    })
    
    if (childCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete group with children', 
        childCount 
      })
    }
    
    // Soft delete
    group.isActive = false
    group.isDeleted = true
    await group.save()
    
    logger.info('Group deleted', { id: group._id, deletedBy: req.user.username })
    
    res.json({ success: true, message: 'Group deleted successfully' })
  } catch (error) {
    logger.error('Group delete error', { error: error.message, id: req.params.id })
    res.status(500).json({ error: 'Failed to delete group' })
  }
})

// POST /api/groups/:id/assign-teacher - Guruhga teacher biriktirish
router.post('/:id/assign-teacher', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can assign teachers' })
    }
    
    const { teacherId } = req.body
    
    const group = await findGroupById(req.params.id)
    if (!group) {
      return res.status(404).json({ error: 'Group not found' })
    }
    
    if (teacherId) {
      const teacher = await Teacher.findOne({ $or: [{ id: teacherId }, { _id: teacherId }] })
      if (!teacher) {
        return res.status(404).json({ error: 'Teacher not found' })
      }
      
      group.teacherId = teacherId
      group.teacherName = teacher.name || `${teacher.firstName} ${teacher.lastName}`.trim()
      
      // Teacher'ning group field'ini ham yangilash
      teacher.group = group.id || group._id.toString()
      await teacher.save()
    } else {
      group.teacherId = null
      group.teacherName = null
    }
    
    await group.save()
    
    logger.info('Teacher assigned to group', { groupId: group._id, teacherId })
    
    res.json({ success: true, group })
  } catch (error) {
    logger.error('Assign teacher error', { error: error.message })
    res.status(500).json({ error: 'Failed to assign teacher' })
  }
})

export default router
