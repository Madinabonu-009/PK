import express from 'express'
import mongoose from 'mongoose'
import Teacher from '../models/Teacher.js'
import Group from '../models/Group.js'
import { authenticateToken, requireRole } from '../middleware/auth.js'
import logger from '../utils/logger.js'

const router = express.Router()

// Helper: ID bo'yicha teacher topish (ObjectId yoki string id)
const findTeacherById = async (id) => {
  // ObjectId formatmi?
  if (mongoose.Types.ObjectId.isValid(id)) {
    const teacher = await Teacher.findById(id)
    if (teacher) return teacher
  }
  // String id bo'yicha qidirish (t1, t2, etc)
  return await Teacher.findOne({ $or: [{ id: id }, { _id: id }] })
}

// GET /api/teachers - Barcha teacherlar (public)
router.get('/', async (req, res) => {
  try {
    const { category, groupId } = req.query
    
    let query = { isActive: true, isDeleted: { $ne: true } }
    
    if (category && category !== 'all') {
      query.category = category
    }
    
    if (groupId) {
      query.group = groupId
    }
    
    const teachers = await Teacher.find(query).sort({ createdAt: -1 })
    
    logger.info('Teachers fetched', { count: teachers.length, category, groupId })
    
    // Frontend kutgan formatda qaytarish
    const result = teachers.map(t => ({
      id: t._id.toString(),
      _id: t._id,
      name: t.name || `${t.firstName} ${t.lastName}`.trim(),
      firstName: t.firstName,
      lastName: t.lastName,
      role: t.role || t.position,
      position: t.position,
      education: t.education,
      experience: t.experience,
      phone: t.phone,
      email: t.email,
      photo: t.photo,
      bio: t.bio,
      category: t.category || 'teacher',
      group: t.group,
      specializations: t.specializations,
      isActive: t.isActive
    }))
    
    res.json(result)
  } catch (error) {
    logger.error('Teachers fetch error', { error: error.message })
    res.status(500).json({ error: 'Failed to fetch teachers', details: error.message })
  }
})

// GET /api/teachers/:id - Bitta teacher
router.get('/:id', async (req, res) => {
  try {
    const teacher = await findTeacherById(req.params.id)
    
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' })
    }
    
    res.json({
      id: teacher._id.toString(),
      _id: teacher._id,
      name: teacher.name || `${teacher.firstName} ${teacher.lastName}`.trim(),
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      role: teacher.role || teacher.position,
      position: teacher.position,
      education: teacher.education,
      experience: teacher.experience,
      phone: teacher.phone,
      email: teacher.email,
      photo: teacher.photo,
      bio: teacher.bio,
      category: teacher.category || 'teacher',
      group: teacher.group,
      specializations: teacher.specializations,
      isActive: teacher.isActive
    })
  } catch (error) {
    logger.error('Teacher fetch error', { error: error.message, id: req.params.id })
    res.status(500).json({ error: 'Failed to fetch teacher' })
  }
})

// POST /api/teachers - Yangi teacher yaratish (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Admin tekshirish
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can create teachers' })
    }
    
    const { name, firstName, lastName, position, role, education, experience, 
            phone, email, photo, bio, category, group, specializations } = req.body
    
    // Validation
    const teacherFirstName = firstName || (name ? name.split(' ')[0] : '')
    const teacherLastName = lastName || (name ? name.split(' ').slice(1).join(' ') : '')
    
    if (!teacherFirstName) {
      return res.status(400).json({ error: 'First name is required' })
    }
    
    if (!position && !role) {
      return res.status(400).json({ error: 'Position is required' })
    }
    
    const teacher = new Teacher({
      firstName: teacherFirstName,
      lastName: teacherLastName,
      name: name || `${teacherFirstName} ${teacherLastName}`.trim(),
      position: position || role,
      role: role || position,
      education,
      experience,
      phone,
      email,
      photo,
      bio,
      category: category || 'teacher',
      group: group || '',
      specializations: specializations || [],
      isActive: true,
      isDeleted: false
    })
    
    await teacher.save()
    
    logger.info('Teacher created', { id: teacher._id, name: teacher.name, createdBy: req.user.username })
    
    res.status(201).json({
      id: teacher._id.toString(),
      _id: teacher._id,
      ...teacher.toObject()
    })
  } catch (error) {
    logger.error('Teacher create error', { error: error.message })
    res.status(500).json({ error: 'Failed to create teacher', details: error.message })
  }
})

// PUT /api/teachers/:id - Teacher yangilash (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can update teachers' })
    }
    
    const teacher = await findTeacherById(req.params.id)
    
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' })
    }
    
    const { name, firstName, lastName, position, role, education, experience,
            phone, email, photo, bio, category, group, specializations, isActive } = req.body
    
    // Update fields
    if (firstName !== undefined) teacher.firstName = firstName
    if (lastName !== undefined) teacher.lastName = lastName
    if (name !== undefined) teacher.name = name
    if (position !== undefined) teacher.position = position
    if (role !== undefined) teacher.role = role
    if (education !== undefined) teacher.education = education
    if (experience !== undefined) teacher.experience = experience
    if (phone !== undefined) teacher.phone = phone
    if (email !== undefined) teacher.email = email
    if (photo !== undefined) teacher.photo = photo
    if (bio !== undefined) teacher.bio = bio
    if (category !== undefined) teacher.category = category
    if (group !== undefined) teacher.group = group
    if (specializations !== undefined) teacher.specializations = specializations
    if (isActive !== undefined) teacher.isActive = isActive
    
    await teacher.save()
    
    logger.info('Teacher updated', { id: teacher._id, updatedBy: req.user.username })
    
    res.json({
      id: teacher._id.toString(),
      _id: teacher._id,
      ...teacher.toObject()
    })
  } catch (error) {
    logger.error('Teacher update error', { error: error.message, id: req.params.id })
    res.status(500).json({ error: 'Failed to update teacher' })
  }
})

// DELETE /api/teachers/:id - Teacher o'chirish (soft delete, admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can delete teachers' })
    }
    
    const teacher = await findTeacherById(req.params.id)
    
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' })
    }
    
    // Soft delete
    teacher.isActive = false
    teacher.isDeleted = true
    await teacher.save()
    
    logger.info('Teacher deleted', { id: teacher._id, deletedBy: req.user.username })
    
    res.json({ success: true, message: 'Teacher deleted successfully' })
  } catch (error) {
    logger.error('Teacher delete error', { error: error.message, id: req.params.id })
    res.status(500).json({ error: 'Failed to delete teacher' })
  }
})

// POST /api/teachers/:id/assign-group - Teacherga guruh biriktirish
router.post('/:id/assign-group', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can assign groups' })
    }
    
    const { groupId } = req.body
    
    const teacher = await findTeacherById(req.params.id)
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' })
    }
    
    teacher.group = groupId
    await teacher.save()
    
    // Guruhni ham yangilash
    if (groupId) {
      await Group.updateOne(
        { $or: [{ id: groupId }, { _id: groupId }] },
        { $set: { teacherId: teacher._id.toString(), teacherName: teacher.name } }
      )
    }
    
    logger.info('Teacher assigned to group', { teacherId: teacher._id, groupId })
    
    res.json({ success: true, teacher })
  } catch (error) {
    logger.error('Assign group error', { error: error.message })
    res.status(500).json({ error: 'Failed to assign group' })
  }
})

export default router
