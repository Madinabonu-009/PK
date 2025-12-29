import express from 'express'
import mongoose from 'mongoose'
import Group from '../models/Group.js'
import Child from '../models/Child.js'
import Teacher from '../models/Teacher.js'
import User from '../models/User.js'
import { authenticateToken } from '../middleware/auth.js'
import logger from '../utils/logger.js'

const router = express.Router()

// Helper: ID bo'yicha group topish (string id yoki ObjectId)
const findGroupById = async (id) => {
  try {
    // Avval string id bo'yicha qidirish (g1, g2, etc.)
    let group = await Group.findOne({ id: id, isDeleted: { $ne: true } })
    if (group) return group
    
    // Keyin ObjectId bo'yicha qidirish
    if (mongoose.Types.ObjectId.isValid(id)) {
      group = await Group.findOne({ _id: new mongoose.Types.ObjectId(id), isDeleted: { $ne: true } })
      if (group) return group
    }
    
    return null
  } catch (error) {
    logger.error('findGroupById error', { error: error.message, id })
    return null
  }
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
    
    const userId = req.user.id || req.user._id
    const assignedGroups = req.user.assignedGroups || []
    
    logger.info('Fetching teacher groups', { userId, assignedGroups })
    
    // 1. Avval assignedGroups bo'yicha qidirish
    let groups = []
    
    if (assignedGroups.length > 0) {
      groups = await Group.find({
        $or: [
          { id: { $in: assignedGroups } },
          { _id: { $in: assignedGroups.filter(id => mongoose.Types.ObjectId.isValid(id)).map(id => new mongoose.Types.ObjectId(id)) } }
        ],
        isDeleted: { $ne: true }
      })
    }
    
    // 2. Agar assignedGroups bo'sh bo'lsa, teacherId bo'yicha qidirish
    if (groups.length === 0) {
      // User bilan bog'langan Teacher ni topish
      const user = await User.findById(userId)
      
      if (user?.teacherId) {
        // teacherId orqali guruhlarni topish
        groups = await Group.find({
          teacherId: user.teacherId.toString(),
          isDeleted: { $ne: true }
        })
      }
      
      // Agar hali ham topilmasa, username bo'yicha Teacher ni qidirish
      if (groups.length === 0) {
        const teacher = await Teacher.findOne({
          $or: [
            { userId: userId },
            { phone: user?.phone },
            { email: user?.email }
          ],
          isDeleted: { $ne: true }
        })
        
        if (teacher) {
          // Teacher ID bo'yicha guruhlarni topish
          groups = await Group.find({
            $or: [
              { teacherId: teacher._id.toString() },
              { teacherId: teacher.id }
            ],
            isDeleted: { $ne: true }
          })
          
          // User.assignedGroups ni yangilash
          if (groups.length > 0) {
            const groupIds = groups.map(g => g.id || g._id.toString())
            await User.findByIdAndUpdate(userId, {
              $set: { 
                assignedGroups: groupIds,
                teacherId: teacher._id
              }
            })
            logger.info('Updated user assignedGroups', { userId, groupIds })
          }
        }
      }
    }
    
    if (groups.length === 0) {
      logger.warn('No groups found for teacher', { userId })
      return res.json({
        groups: [],
        message: 'No groups assigned to this teacher'
      })
    }
    
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
    
    logger.info('Teacher groups fetched', { userId, count: result.length })
    
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
      let teacher = null
      
      // 1. String id bo'yicha
      teacher = await Teacher.findOne({ id: teacherId, isDeleted: { $ne: true } })
      
      // 2. ObjectId bo'yicha
      if (!teacher && mongoose.Types.ObjectId.isValid(teacherId)) {
        teacher = await Teacher.findOne({ _id: new mongoose.Types.ObjectId(teacherId), isDeleted: { $ne: true } })
      }
      
      if (teacher) {
        teacherName = teacher.name || teacher.fullName || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim()
      }
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
    const groupId = group.id || group._id.toString()
    const oldTeacherId = group.teacherId
    
    if (name !== undefined) group.name = name
    if (ageRange !== undefined) group.ageRange = ageRange
    if (capacity !== undefined) group.capacity = capacity
    if (monthlyFee !== undefined) group.monthlyFee = monthlyFee
    if (isActive !== undefined) group.isActive = isActive
    
    // Teacher yangilash
    if (teacherId !== undefined) {
      // Eski teacher'dan guruhni olib tashlash
      if (oldTeacherId && oldTeacherId !== teacherId) {
        // Eski teacher'ning User record'ini topish va assignedGroups'dan olib tashlash
        const oldTeacher = await Teacher.findOne({
          $or: [
            { _id: mongoose.Types.ObjectId.isValid(oldTeacherId) ? new mongoose.Types.ObjectId(oldTeacherId) : null },
            { id: oldTeacherId }
          ]
        })
        
        if (oldTeacher?.userId) {
          await User.findByIdAndUpdate(oldTeacher.userId, {
            $pull: { assignedGroups: groupId }
          })
          logger.info('Removed group from old teacher', { teacherId: oldTeacherId, groupId })
        }
        
        // Username bo'yicha ham qidirish
        const oldTeacherUser = await User.findOne({
          teacherId: oldTeacher?._id,
          role: 'teacher'
        })
        if (oldTeacherUser) {
          await User.findByIdAndUpdate(oldTeacherUser._id, {
            $pull: { assignedGroups: groupId }
          })
        }
      }
      
      group.teacherId = teacherId
      
      if (teacherId) {
        // Teacher ni turli usullar bilan qidirish
        let teacher = null
        
        // 1. String id bo'yicha
        teacher = await Teacher.findOne({ id: teacherId, isDeleted: { $ne: true } })
        
        // 2. ObjectId bo'yicha
        if (!teacher && mongoose.Types.ObjectId.isValid(teacherId)) {
          teacher = await Teacher.findOne({ _id: new mongoose.Types.ObjectId(teacherId), isDeleted: { $ne: true } })
        }
        
        // 3. userId bo'yicha
        if (!teacher && mongoose.Types.ObjectId.isValid(teacherId)) {
          teacher = await Teacher.findOne({ userId: new mongoose.Types.ObjectId(teacherId), isDeleted: { $ne: true } })
        }
        
        if (teacher) {
          group.teacherName = teacher.name || teacher.fullName || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim()
          
          // Teacher'ning group field'ini yangilash
          teacher.group = groupId
          await teacher.save()
          
          // MUHIM: User modelini yangilash - assignedGroups ga qo'shish
          // 1. Teacher.userId orqali
          if (teacher.userId) {
            await User.findByIdAndUpdate(teacher.userId, {
              $addToSet: { assignedGroups: groupId },
              $set: { teacherId: teacher._id }
            })
            logger.info('Updated user assignedGroups via teacherId', { userId: teacher.userId, groupId })
          }
          
          // 2. Teacher ismi bo'yicha User topish
          const teacherUser = await User.findOne({
            $or: [
              { teacherId: teacher._id },
              { name: teacher.name, role: 'teacher' },
              { phone: teacher.phone, role: 'teacher' },
              { email: teacher.email, role: 'teacher' }
            ]
          })
          
          if (teacherUser) {
            await User.findByIdAndUpdate(teacherUser._id, {
              $addToSet: { assignedGroups: groupId },
              $set: { teacherId: teacher._id }
            })
            logger.info('Updated user assignedGroups via name/phone/email match', { userId: teacherUser._id, groupId })
          }
        } else {
          logger.warn('Teacher not found for group update', { teacherId })
          group.teacherName = null
        }
      } else {
        group.teacherName = null
      }
    }
    
    await group.save()
    
    logger.info('Group updated', { id: group._id, teacherId, updatedBy: req.user.username })
    
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
    
    const groupId = group.id || group._id.toString()
    const oldTeacherId = group.teacherId
    
    // Eski teacher'dan guruhni olib tashlash
    if (oldTeacherId && oldTeacherId !== teacherId) {
      const oldTeacher = await Teacher.findOne({
        $or: [
          { _id: mongoose.Types.ObjectId.isValid(oldTeacherId) ? new mongoose.Types.ObjectId(oldTeacherId) : null },
          { id: oldTeacherId }
        ]
      })
      
      if (oldTeacher) {
        // User record'ini yangilash
        const oldTeacherUser = await User.findOne({
          $or: [
            { teacherId: oldTeacher._id },
            { name: oldTeacher.name, role: 'teacher' }
          ]
        })
        
        if (oldTeacherUser) {
          await User.findByIdAndUpdate(oldTeacherUser._id, {
            $pull: { assignedGroups: groupId }
          })
          logger.info('Removed group from old teacher user', { userId: oldTeacherUser._id, groupId })
        }
      }
    }
    
    if (teacherId) {
      let teacher = null
      
      // 1. String id bo'yicha
      teacher = await Teacher.findOne({ id: teacherId, isDeleted: { $ne: true } })
      
      // 2. ObjectId bo'yicha
      if (!teacher && mongoose.Types.ObjectId.isValid(teacherId)) {
        teacher = await Teacher.findOne({ _id: new mongoose.Types.ObjectId(teacherId), isDeleted: { $ne: true } })
      }
      
      if (!teacher) {
        return res.status(404).json({ error: 'Teacher not found' })
      }
      
      group.teacherId = teacherId
      group.teacherName = teacher.name || teacher.fullName || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim()
      
      // Teacher'ning group field'ini ham yangilash
      teacher.group = groupId
      await teacher.save()
      
      // MUHIM: User modelini yangilash
      // 1. Teacher.userId orqali
      if (teacher.userId) {
        await User.findByIdAndUpdate(teacher.userId, {
          $addToSet: { assignedGroups: groupId },
          $set: { teacherId: teacher._id }
        })
        logger.info('Updated user assignedGroups via teacherId', { userId: teacher.userId, groupId })
      }
      
      // 2. Teacher ismi/telefoni bo'yicha User topish
      const teacherUser = await User.findOne({
        $or: [
          { teacherId: teacher._id },
          { name: teacher.name, role: 'teacher' },
          { phone: teacher.phone, role: 'teacher' },
          { email: teacher.email, role: 'teacher' }
        ]
      })
      
      if (teacherUser) {
        await User.findByIdAndUpdate(teacherUser._id, {
          $addToSet: { assignedGroups: groupId },
          $set: { teacherId: teacher._id }
        })
        logger.info('Updated user assignedGroups via name/phone match', { userId: teacherUser._id, groupId })
      }
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

// POST /api/groups/sync-teachers - Barcha guruhlar uchun tarbiyachilarni sinxronlash
router.post('/sync-teachers', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can sync teachers' })
    }
    
    const groups = await Group.find({ isDeleted: { $ne: true } })
    const teachers = await Teacher.find({ isDeleted: { $ne: true } })
    const users = await User.find({ role: 'teacher' })
    
    let synced = 0
    const results = []
    
    for (const group of groups) {
      const groupId = group.id || group._id.toString()
      
      // Agar guruhda teacher tayinlangan bo'lsa
      if (group.teacherId) {
        // Teacher ni topish
        let teacher = teachers.find(t => 
          t._id.toString() === group.teacherId || 
          t.id === group.teacherId
        )
        
        if (teacher) {
          // Teacher nomini yangilash
          const teacherName = teacher.name || teacher.fullName || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim()
          if (group.teacherName !== teacherName) {
            group.teacherName = teacherName
            await group.save()
          }
          
          // User ni topish va assignedGroups ni yangilash
          let teacherUser = users.find(u => 
            u.teacherId?.toString() === teacher._id.toString() ||
            u.name === teacher.name ||
            u.phone === teacher.phone
          )
          
          if (teacherUser) {
            const currentGroups = teacherUser.assignedGroups || []
            if (!currentGroups.includes(groupId)) {
              await User.findByIdAndUpdate(teacherUser._id, {
                $addToSet: { assignedGroups: groupId },
                $set: { teacherId: teacher._id }
              })
              synced++
              results.push({
                group: group.name,
                teacher: teacherName,
                user: teacherUser.username,
                action: 'assigned'
              })
            }
          }
        }
      } else {
        // Guruhda teacher yo'q - "Tayinlanmagan" holati
        if (group.teacherName) {
          group.teacherName = null
          await group.save()
        }
      }
    }
    
    logger.info('Teachers synced', { synced, total: groups.length })
    
    res.json({ 
      success: true, 
      synced, 
      total: groups.length,
      results 
    })
  } catch (error) {
    logger.error('Sync teachers error', { error: error.message })
    res.status(500).json({ error: 'Failed to sync teachers' })
  }
})

export default router
