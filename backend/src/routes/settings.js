import express from 'express'
import mongoose from 'mongoose'
import { authenticateToken, requireRole } from '../middleware/auth.js'

const router = express.Router()

const getCollection = (name) => mongoose.connection.collection(name)

// Get public settings (no auth required)
router.get('/public', async (req, res) => {
  try {
    const settings = await getCollection('settings').findOne({}) || {}
    
    const publicSettings = {
      general: {
        siteName: settings.general?.siteName || 'Play Kids',
        siteDescription: settings.general?.siteDescription || '',
        contactEmail: settings.general?.contactEmail || '',
        contactPhone: settings.general?.contactPhone || '',
        address: settings.general?.address || '',
        workingHours: settings.general?.workingHours || '',
        yearsExperience: settings.general?.yearsExperience || 5
      }
    }
    res.json(publicSettings)
  } catch (error) {
    console.error('Get public settings error:', error)
    res.status(500).json({ error: 'Sozlamalarni olishda xatolik' })
  }
})

// Get all settings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const settings = await getCollection('settings').findOne({}) || {}
    const { _id, ...rest } = settings
    res.json(rest)
  } catch (error) {
    console.error('Get settings error:', error)
    res.status(500).json({ error: 'Sozlamalarni olishda xatolik' })
  }
})

// Get specific setting
router.get('/:key', authenticateToken, async (req, res) => {
  try {
    const settings = await getCollection('settings').findOne({}) || {}
    const value = settings[req.params.key]
    if (value === undefined) {
      return res.status(404).json({ error: 'Sozlama topilmadi' })
    }
    res.json({ key: req.params.key, value })
  } catch (error) {
    console.error('Get setting error:', error)
    res.status(500).json({ error: 'Sozlamani olishda xatolik' })
  }
})


// Update settings
router.put('/', authenticateToken, async (req, res) => {
  try {
    const settings = req.body
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin'
    
    if (!isAdmin) {
      const allowedKeys = ['notifications']
      const requestedKeys = Object.keys(settings)
      const hasDisallowedKeys = requestedKeys.some(key => !allowedKeys.includes(key))
      
      if (hasDisallowedKeys) {
        return res.status(403).json({ error: 'Ruxsat yo\'q. Faqat bildirishnoma sozlamalarini o\'zgartira olasiz.' })
      }
    }
    
    const existingSettings = await getCollection('settings').findOne({}) || {}
    const updatedSettings = { ...existingSettings, ...settings, updatedAt: new Date().toISOString() }
    
    if (existingSettings._id) {
      await getCollection('settings').updateOne(
        { _id: existingSettings._id },
        { $set: updatedSettings }
      )
    } else {
      await getCollection('settings').insertOne(updatedSettings)
    }
    
    res.json({ message: 'Sozlamalar saqlandi', settings: updatedSettings })
  } catch (error) {
    console.error('Update settings error:', error)
    res.status(500).json({ error: 'Sozlamalarni saqlashda xatolik' })
  }
})

// Update specific setting
router.put('/:key', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { value } = req.body
    const existingSettings = await getCollection('settings').findOne({}) || {}
    
    const updatedSettings = { 
      ...existingSettings, 
      [req.params.key]: value,
      updatedAt: new Date().toISOString()
    }
    
    if (existingSettings._id) {
      await getCollection('settings').updateOne(
        { _id: existingSettings._id },
        { $set: updatedSettings }
      )
    } else {
      await getCollection('settings').insertOne(updatedSettings)
    }
    
    res.json({ message: 'Sozlama saqlandi', key: req.params.key, value })
  } catch (error) {
    console.error('Update setting error:', error)
    res.status(500).json({ error: 'Sozlamani saqlashda xatolik' })
  }
})

// Delete setting
router.delete('/:key', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const existingSettings = await getCollection('settings').findOne({})
    
    if (existingSettings) {
      await getCollection('settings').updateOne(
        { _id: existingSettings._id },
        { $unset: { [req.params.key]: '' } }
      )
    }
    
    res.json({ message: 'Sozlama o\'chirildi' })
  } catch (error) {
    console.error('Delete setting error:', error)
    res.status(500).json({ error: 'Sozlamani o\'chirishda xatolik' })
  }
})

export default router
