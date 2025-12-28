import express from 'express'
import Settings from '../models/Settings.js'
import { authenticateToken, requireRole } from '../middleware/auth.js'

const router = express.Router()

// Get all settings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const settings = await Settings.getAll()
    res.json(settings)
  } catch (error) {
    console.error('Get settings error:', error)
    res.status(500).json({ error: 'Sozlamalarni olishda xatolik' })
  }
})

// Get specific setting
router.get('/:key', authenticateToken, async (req, res) => {
  try {
    const value = await Settings.get(req.params.key)
    if (value === null) {
      return res.status(404).json({ error: 'Sozlama topilmadi' })
    }
    res.json({ key: req.params.key, value })
  } catch (error) {
    console.error('Get setting error:', error)
    res.status(500).json({ error: 'Sozlamani olishda xatolik' })
  }
})

// Update settings (admin only)
router.put('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const settings = req.body
    await Settings.setMultiple(settings)
    res.json({ message: 'Sozlamalar saqlandi', settings })
  } catch (error) {
    console.error('Update settings error:', error)
    res.status(500).json({ error: 'Sozlamalarni saqlashda xatolik' })
  }
})

// Update specific setting (admin only)
router.put('/:key', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { value } = req.body
    await Settings.set(req.params.key, value)
    res.json({ message: 'Sozlama saqlandi', key: req.params.key, value })
  } catch (error) {
    console.error('Update setting error:', error)
    res.status(500).json({ error: 'Sozlamani saqlashda xatolik' })
  }
})

// Delete setting (admin only)
router.delete('/:key', authenticateToken, requireRole(['admin']), async (_req, res) => {
  try {
    await Settings.delete(_req.params.key)
    res.json({ message: 'Sozlama o\'chirildi' })
  } catch (error) {
    console.error('Delete setting error:', error)
    res.status(500).json({ error: 'Sozlamani o\'chirishda xatolik' })
  }
})

export default router