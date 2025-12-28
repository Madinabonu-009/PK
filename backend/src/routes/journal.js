import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { readData, writeData } from '../utils/db.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// GET /api/journal - Barcha jurnal yozuvlarini olish
router.get('/', async (req, res) => {
  try {
    const { type, groupId, limit } = req.query
    
    let journal = readData('journal.json') || []
    
    // Filter out soft-deleted entries
    journal = journal.filter(j => !j.isDeleted)
    
    // Faqat public yozuvlar
    journal = journal.filter(j => j.isPublic !== false)
    
    if (type) {
      journal = journal.filter(j => j.type === type)
    }
    
    if (groupId) {
      journal = journal.filter(j => j.groupId === groupId)
    }
    
    // Eng yangilarini birinchi
    journal.sort((a, b) => new Date(b.date) - new Date(a.date))
    
    if (limit) {
      journal = journal.slice(0, parseInt(limit))
    }
    
    res.json(journal)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch journal' })
  }
})

// GET /api/journal/:id
router.get('/:id', async (req, res) => {
  try {
    const journal = readData('journal.json') || []
    const entry = journal.find(j => j.id === req.params.id && !j.isDeleted)
    
    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' })
    }
    
    res.json(entry)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch journal entry' })
  }
})

// POST /api/journal - Yangi yozuv qo'shish (admin/teacher)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, type, mediaUrl, groupId, groupName, date, tags } = req.body
    
    if (!title || !mediaUrl) {
      return res.status(400).json({ error: 'Title and mediaUrl are required' })
    }
    
    const journal = readData('journal.json') || []
    
    const newEntry = {
      id: uuidv4(),
      title,
      description: description || '',
      type: type || 'photo',
      mediaUrl,
      thumbnailUrl: type === 'video' ? mediaUrl.replace('.mp4', '_thumb.jpg') : mediaUrl,
      groupId,
      groupName,
      date: date || new Date().toISOString(),
      uploadedBy: req.user.username,
      isPublic: true,
      tags: tags || [],
      createdAt: new Date().toISOString()
    }
    
    journal.push(newEntry)
    writeData('journal.json', journal)
    
    res.status(201).json(newEntry)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create journal entry' })
  }
})

// PUT /api/journal/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const journal = readData('journal.json') || []
    const index = journal.findIndex(j => j.id === req.params.id)
    
    if (index === -1) {
      return res.status(404).json({ error: 'Journal entry not found' })
    }
    
    journal[index] = {
      ...journal[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    }
    
    writeData('journal.json', journal)
    res.json(journal[index])
  } catch (error) {
    res.status(500).json({ error: 'Failed to update journal entry' })
  }
})

// DELETE /api/journal/:id (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const journal = readData('journal.json') || []
    const index = journal.findIndex(j => j.id === req.params.id)
    
    if (index === -1) {
      return res.status(404).json({ error: 'Journal entry not found' })
    }
    
    // Soft delete
    journal[index].isDeleted = true
    journal[index].deletedAt = new Date().toISOString()
    journal[index].deletedBy = req.user?.username || 'admin'
    writeData('journal.json', journal)
    
    res.json({ message: 'Journal entry deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete journal entry' })
  }
})

export default router
