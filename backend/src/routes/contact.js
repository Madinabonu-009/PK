import express from 'express'
import { sendTelegramMessage, formatContactMessage, isTelegramConfigured } from '../utils/telegram.js'
import logger from '../utils/logger.js'
import rateLimit from 'express-rate-limit'

const router = express.Router()

// Rate limiter for contact forms
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message: { error: 'Juda ko\'p so\'rov. 15 daqiqadan keyin qayta urinib ko\'ring.' },
  validate: false
})

// POST /api/contact
router.post('/', contactLimiter, async (req, res) => {
  try {
    const { name, phone, email, message } = req.body

    if (!name || !message) {
      return res.status(400).json({ error: 'Name and message are required' })
    }

    // Format and send message to Telegram
    const telegramMessage = formatContactMessage({ name, phone, email, message })
    const sent = await sendTelegramMessage(telegramMessage)

    if (!sent && isTelegramConfigured()) {
      // Only fail if Telegram is configured but sending failed
      return res.status(500).json({ error: 'Failed to send message to admin' })
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

// POST /api/contact/telegram - Landing page uchun
router.post('/telegram', contactLimiter, async (req, res) => {
  try {
    const { name, phone, childAge, message } = req.body

    if (!name || !phone) {
      return res.status(400).json({ error: 'Ism va telefon raqam majburiy' })
    }

    const text = `🔔 *Yangi ariza!*

👤 *Ism:* ${name}
📞 *Telefon:* ${phone}
👶 *Bola yoshi:* ${childAge || 'Ko\'rsatilmagan'}
💬 *Xabar:* ${message || 'Yo\'q'}

📅 *Vaqt:* ${new Date().toLocaleString('uz-UZ')}
🌐 *Manba:* playkids.uz`

    const sent = await sendTelegramMessage(text)

    if (!sent && isTelegramConfigured()) {
      return res.status(500).json({ error: 'Xabar yuborishda xatolik' })
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
