import express from 'express'
import mongoose from 'mongoose'
import { sendTelegramMessage, formatContactMessage, isTelegramConfigured } from '../utils/telegram.js'
import { authenticateToken } from '../middleware/auth.js'
import logger from '../utils/logger.js'
import rateLimit from 'express-rate-limit'

const router = express.Router()
const getCollection = (name) => mongoose.connection.collection(name)

// Rate limiter for contact forms
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message: { error: 'Juda ko\'p so\'rov. 15 daqiqadan keyin qayta urinib ko\'ring.' },
  validate: false
})

// GET /api/contact - Admin uchun barcha xabarlarni olish
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    let query = { isDeleted: { $ne: true } }
    if (status) query.status = status
    
    const [messages, total] = await Promise.all([
      getCollection('contacts').find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).toArray(),
      getCollection('contacts').countDocuments(query)
    ])
    
    res.json({
      data: messages.map(m => ({
        id: m._id.toString(),
        ...m
      })),
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    })
  } catch (error) {
    logger.error('Contact messages fetch error', { error: error.message })
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

// POST /api/contact
router.post('/', contactLimiter, async (req, res) => {
  try {
    const { name, phone, email, message } = req.body

    if (!name || !message) {
      return res.status(400).json({ error: 'Name and message are required' })
    }

    // MongoDB ga saqlash
    const contactMessage = {
      name,
      phone: phone || '',
      email: email || '',
      message,
      status: 'new',
      createdAt: new Date(),
      isDeleted: false
    }
    
    await getCollection('contacts').insertOne(contactMessage)
    logger.info('Contact message saved', { name, phone })

    // Format and send message to Telegram
    const telegramMessage = formatContactMessage({ name, phone, email, message })
    const sent = await sendTelegramMessage(telegramMessage)

    if (!sent && isTelegramConfigured()) {
      logger.warn('Telegram notification failed but message saved')
    }

    res.json({ 
      success: true,
      message: 'Message sent successfully' 
    })
  } catch (error) {
    logger.error('Contact form error', { error: error.message, stack: error.stack })
    res.status(500).json({ error: 'Failed to send message' })
  }
})

// PUT /api/contact/:id - Xabar statusini yangilash
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { status, adminNotes } = req.body
    
    const filter = { _id: new mongoose.Types.ObjectId(req.params.id) }
    const updateData = { updatedAt: new Date() }
    
    if (status) updateData.status = status
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes
    
    const result = await getCollection('contacts').findOneAndUpdate(
      filter,
      { $set: updateData },
      { returnDocument: 'after' }
    )
    
    if (!result?.value && !result?._id) {
      return res.status(404).json({ error: 'Message not found' })
    }
    
    res.json({ success: true, message: 'Updated' })
  } catch (error) {
    logger.error('Contact update error', { error: error.message })
    res.status(500).json({ error: 'Failed to update message' })
  }
})

// DELETE /api/contact/:id - Xabarni o'chirish
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const filter = { _id: new mongoose.Types.ObjectId(req.params.id) }
    
    await getCollection('contacts').updateOne(filter, { 
      $set: { isDeleted: true, deletedAt: new Date() } 
    })
    
    res.json({ success: true, message: 'Deleted' })
  } catch (error) {
    logger.error('Contact delete error', { error: error.message })
    res.status(500).json({ error: 'Failed to delete message' })
  }
})

// POST /api/contact/telegram - Landing page uchun
router.post('/telegram', contactLimiter, async (req, res) => {
  try {
    const { name, phone, childAge, message } = req.body

    if (!name || !phone) {
      return res.status(400).json({ error: 'Ism va telefon raqam majburiy' })
    }

    // MongoDB ga saqlash
    const contactMessage = {
      name,
      phone,
      childAge: childAge || '',
      message: message || '',
      source: 'landing',
      status: 'new',
      createdAt: new Date(),
      isDeleted: false
    }
    
    await getCollection('contacts').insertOne(contactMessage)

    const text = `🔔 <b>Yangi ariza!</b>

👤 <b>Ism:</b> ${name}
📞 <b>Telefon:</b> ${phone}
👶 <b>Bola yoshi:</b> ${childAge || 'Ko\'rsatilmagan'}
💬 <b>Xabar:</b> ${message || 'Yo\'q'}

📅 <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}
🌐 <b>Manba:</b> playkids.uz`

    const sent = await sendTelegramMessage(text)

    if (!sent && isTelegramConfigured()) {
      logger.warn('Telegram notification failed but message saved')
    }

    res.json({ 
      success: true,
      message: 'Arizangiz qabul qilindi!' 
    })
  } catch (error) {
    logger.error('Telegram contact error', { error: error.message })
    res.status(500).json({ error: 'Xabar yuborishda xatolik' })
  }
})

// Export for testing
export { sendTelegramMessage, formatContactMessage }
export default router
