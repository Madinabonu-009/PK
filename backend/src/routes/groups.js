import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { readData, writeData } from '../utils/db.js'
import { authenticateToken } from '../middleware/auth.js'
import { normalizeId } from '../utils/helpers.js'
import logger from '../utils/logger.js'
import Group from '../models/Group.js'
import Child from '../models/Child.js'

const router = express.Router()

// Helper: Validation
const validateGroup = (data, isUpdate = false) => {
  const errors = []
  
  if (!isUpdate || data.name !== undefined) {
    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      errors.push('Guruh nomi kiritilishi shart')
    }
  }
  
  if (!isUpdate || data.ageRange !== undefined) {
    if (!data.ageRange || typeof data.ageRange !== 'string' || data.ageRange.trim() === '') {
      errors.push('Yosh oralig\'i kiritilishi shart')
    }
  }
  
  if (!isUpdate || data.capacity !== undefined) {
    if (!data.capacity || isNaN(parseInt(data.capacity)) || parseInt(data.capacity) <= 0) {
      errors.push('Sig\'im musbat son bo\'lishi kerak')
    }
  }
  
  return errors
}

// GET /api/groups/public - Ommaviy (autentifikatsiyasiz)
router.get('/public', async (req, res) => {
  try {
    if (req.app.locals.useDatabase) {
      const groups = await Group.find({ isActive: true }).select('name ageRange')
      return res.json(groups.map(normalizeId))
    }
    
    const groups = readData('groups.json') || []
    const publicGroups = groups.map(g => ({ id: g.id, name: g.name, ageRange: g.ageRange }))
    res.json(publicGroups)
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch groups' })
  }
})

// GET /api/groups
router.get('/', async (req, res) => {
  try {
    if (req.app.locals.useDatabase) {
      const groups = await Group.find({ isActive: true }).populate('teacher')
      const groupsWithCounts = await Promise.all(groups.map(async (group) => {
        const childCount = await Child.countDocuments({ group: group._id })
        const normalized = normalizeId(group)
        return { ...normalized, childCount }
      }))
      return res.json(groupsWithCounts)
    }
    
    const groups = readData('groups.json') || []
    const children = readData('children.json') || []
    const groupsWithCounts = groups.map(group => ({
      ...group,
      childCount: children.filter(c => c.groupId === group.id).length
    }))
    res.json(groupsWithCounts)
  } catch (error) {
    logger.error('Groups fetch error', { error: error.message, stack: error.stack })
    res.status(500).json({ success: false, error: 'Failed to fetch groups' })
  }
})

// GET /api/groups/:id
router.get('/:id', async (req, res) => {
  try {
    if (req.app.locals.useDatabase) {
      const group = await Group.findById(req.params.id).populate('teacher')
      if (!group) return res.status(404).json({ success: false, error: 'Group not found' })
      return res.json(normalizeId(group))
    }
    
    const groups = readData('groups.json') || []
    const group = groups.find(g => g.id === req.params.id)
    if (!group) return res.status(404).json({ success: false, error: 'Group not found' })
    res.json(group)
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch group' })
  }
})

// POST /api/groups
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Validation
    const validationErrors = validateGroup(req.body)
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation failed', 
        details: validationErrors 
      })
    }

    if (req.app.locals.useDatabase) {
      const group = new Group(req.body)
      await group.save()
      return res.status(201).json(normalizeId(group))
    }
    
    const groups = readData('groups.json') || []
    const newGroup = {
      id: uuidv4(),
      name: req.body.name?.trim(),
      ageRange: req.body.ageRange?.trim(),
      capacity: parseInt(req.body.capacity),
      teacherId: req.body.teacherId || null,
      monthlyFee: req.body.monthlyFee || 1500000,
      isActive: true
    }
    groups.push(newGroup)
    
    if (!writeData('groups.json', groups)) {
      return res.status(500).json({ success: false, error: 'Failed to save data' })
    }
    
    res.status(201).json(newGroup)
  } catch (error) {
    logger.error('Create group error', { error: error.message, stack: error.stack, groupData: req.body })
    res.status(500).json({ success: false, error: 'Failed to create group' })
  }
})

// PUT /api/groups/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // Validation
    const validationErrors = validateGroup(req.body, true)
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation failed', 
        details: validationErrors 
      })
    }

    if (req.app.locals.useDatabase) {
      const group = await Group.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      if (!group) return res.status(404).json({ success: false, error: 'Group not found' })
      return res.json(normalizeId(group))
    }
    
    const groups = readData('groups.json') || []
    const index = groups.findIndex(g => g.id === req.params.id)
    if (index === -1) return res.status(404).json({ success: false, error: 'Group not found' })
    
    const updatedGroup = { 
      ...groups[index], 
      ...req.body,
      capacity: req.body.capacity ? parseInt(req.body.capacity) : groups[index].capacity,
      updatedAt: new Date().toISOString()
    }
    groups[index] = updatedGroup
    
    if (!writeData('groups.json', groups)) {
      return res.status(500).json({ success: false, error: 'Failed to save data' })
    }
    
    res.json(updatedGroup)
  } catch (error) {
    logger.error('Update group error', { error: error.message, stack: error.stack, groupId: req.params.id })
    res.status(500).json({ success: false, error: 'Failed to update group' })
  }
})

// DELETE /api/groups/:id (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.app.locals.useDatabase) {
      const group = await Group.findByIdAndUpdate(
        req.params.id,
        {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: req.user?.id || 'unknown'
        },
        { new: true }
      )
      if (!group) return res.status(404).json({ success: false, error: 'Group not found' })
      return res.json({ success: true, message: 'Group deleted successfully' })
    }
    
    let groups = readData('groups.json') || []
    const index = groups.findIndex(g => g.id === req.params.id)
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Group not found' })
    }
    
    // Soft delete
    groups[index].isDeleted = true
    groups[index].deletedAt = new Date().toISOString()
    groups[index].deletedBy = req.user?.id || 'unknown'
    
    if (!writeData('groups.json', groups)) {
      return res.status(500).json({ success: false, error: 'Failed to save data' })
    }
    
    res.json({ success: true, message: 'Group deleted successfully' })
  } catch (error) {
    logger.error('Delete group error', { error: error.message, stack: error.stack, groupId: req.params.id })
    res.status(500).json({ success: false, error: 'Failed to delete group' })
  }
})

export default router
