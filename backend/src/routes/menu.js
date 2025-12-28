import express from 'express'
import { readData, writeData } from '../utils/db.js'
import { authenticateToken } from '../middleware/auth.js'
import logger from '../utils/logger.js'
import Menu from '../models/Menu.js'

const router = express.Router()

const REQUIRED_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const REQUIRED_MEALS = ['breakfast', 'lunch', 'snack']

const isValidMeal = (meal) => {
  if (!meal || typeof meal !== 'object') return false
  if (typeof meal.name !== 'string' || meal.name.trim().length === 0) return false
  return true
}

export const validateMenu = (menu) => {
  const errors = []
  if (!menu || typeof menu !== 'object') {
    return { valid: false, errors: ['Menu must be an object'] }
  }
  for (const day of REQUIRED_DAYS) {
    if (!menu[day]) {
      errors.push(`Missing menu for ${day}`)
      continue
    }
    for (const meal of REQUIRED_MEALS) {
      if (!menu[day][meal]) {
        errors.push(`Missing ${meal} for ${day}`)
      } else if (!isValidMeal(menu[day][meal])) {
        errors.push(`Invalid ${meal} format for ${day}`)
      }
    }
  }
  return { valid: errors.length === 0, errors }
}

// GET /api/menu
router.get('/', async (req, res) => {
  try {
    if (req.app.locals.useDatabase) {
      const menu = await Menu.findOne({ isActive: true }).sort({ createdAt: -1 })
      if (menu) {
        return res.json(menu.days || menu)
      }
      // MongoDB da topilmasa JSON fayldan o'qish
    }
    
    const menu = readData('menu.json')
    if (!menu) return res.status(404).json({ success: false, error: 'Menu not found' })
    res.json(menu)
  } catch (error) {
    logger.error('Menu fetch error', { error: error.message, stack: error.stack })
    res.status(500).json({ success: false, error: 'Failed to fetch menu' })
  }
})

// GET /api/menu/week/:weekNumber
router.get('/week/:weekNumber', async (req, res) => {
  try {
    const { weekNumber } = req.params
    const year = req.query.year || new Date().getFullYear()
    
    if (req.app.locals.useDatabase) {
      const menu = await Menu.findOne({ weekNumber: parseInt(weekNumber), year: parseInt(year) })
      if (!menu) return res.status(404).json({ error: 'Menu not found for this week' })
      return res.json(menu)
    }
    
    // JSON fayl uchun hozirgi menyu qaytariladi
    const menu = readData('menu.json')
    res.json(menu)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu' })
  }
})

// PUT /api/menu
router.put('/', authenticateToken, async (req, res) => {
  try {
    const validation = validateMenu(req.body)
    if (!validation.valid) {
      return res.status(400).json({ success: false, error: 'Invalid menu data', details: validation.errors })
    }

    if (req.app.locals.useDatabase) {
      // Hozirgi hafta uchun menyu yangilash yoki yaratish
      const now = new Date()
      const weekNumber = Math.ceil((now - new Date(now.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000))
      
      const menu = await Menu.findOneAndUpdate(
        { weekNumber, year: now.getFullYear() },
        { days: req.body, isActive: true },
        { new: true, upsert: true }
      )
      return res.json(menu.days)
    }

    const success = writeData('menu.json', req.body)
    if (!success) return res.status(500).json({ success: false, error: 'Failed to save menu' })
    res.json(req.body)
  } catch (error) {
    console.error('Menu update error:', error)
    res.status(500).json({ success: false, error: 'Failed to update menu' })
  }
})

// POST /api/menu - Yangi haftalik menyu yaratish
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { weekNumber, year, days } = req.body
    
    if (!weekNumber || !days) {
      return res.status(400).json({ error: 'weekNumber and days are required' })
    }
    
    if (req.app.locals.useDatabase) {
      const menu = new Menu({
        weekNumber,
        year: year || new Date().getFullYear(),
        days,
        isActive: true
      })
      await menu.save()
      return res.status(201).json(menu)
    }
    
    // JSON fayl uchun oddiy saqlash
    writeData('menu.json', days)
    res.status(201).json(days)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create menu' })
  }
})

export default router
