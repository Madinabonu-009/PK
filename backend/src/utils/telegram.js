/**
 * Telegram utility for sending notifications
 */

// Telegram Bot configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

/**
 * Check if Telegram is configured
 */
export function isTelegramConfigured() {
  return !!(
    TELEGRAM_BOT_TOKEN && 
    TELEGRAM_BOT_TOKEN !== 'your_bot_token_here' &&
    TELEGRAM_CHAT_ID && 
    TELEGRAM_CHAT_ID !== 'your_chat_id_here'
  )
}

/**
 * Send message to Telegram
 * @param {string} text - Message text to send
 * @param {string} chatId - Optional chat ID (defaults to TELEGRAM_CHAT_ID)
 * @returns {Promise<boolean>} - Success status
 */
export async function sendTelegramMessage(text, chatId = null) {
  const targetChatId = chatId || TELEGRAM_CHAT_ID
  
  // Token yoki chat ID yo'q bo'lsa, xato chiqarmasdan true qaytarish
  if (!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN === 'your_bot_token_here') {
    console.log('⚠️ Telegram bot token sozlanmagan. Xabar yuborilmadi.')
    return true // Xato chiqarmaslik uchun true qaytaramiz
  }
  
  if (!targetChatId || targetChatId === 'your_chat_id_here') {
    console.log('⚠️ Telegram chat ID sozlanmagan. Xabar yuborilmadi.')
    return true
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: targetChatId,
        text: text,
        parse_mode: 'HTML'
      })
    })

    const data = await response.json()
    
    if (!data.ok) {
      console.error('Telegram xabar yuborishda xatolik:', data)
      return false
    }

    console.log('✅ Telegram xabar yuborildi')
    return true
  } catch (error) {
    console.error('Telegram xabar yuborishda xatolik:', error.message)
    return false
  }
}

/**
 * Send new enrollment notification to admin
 */
export async function sendEnrollmentNotification(enrollment) {
  const { childName, birthDate, parentName, parentPhone, parentEmail, notes } = enrollment
  
  const message = `🏫 <b>Yangi ariza - Play Kids</b>

👶 <b>Bola ismi:</b> ${childName}
🎂 <b>Tug'ilgan sana:</b> ${birthDate}

👤 <b>Ota-ona:</b> ${parentName}
📞 <b>Telefon:</b> ${parentPhone}
📧 <b>Email:</b> ${parentEmail || 'Ko\'rsatilmagan'}

📝 <b>Izoh:</b> ${notes || 'Yo\'q'}

⏰ <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}

🔗 Admin panelda ko'rish: /admin/enrollments`

  return sendTelegramMessage(message)
}

/**
 * Format contact form data for Telegram message
 */
export function formatContactMessage(data) {
  const { name, phone, email, message } = data
  return `📩 <b>Yangi xabar - Play Kids</b>

👤 <b>Ism:</b> ${name}
📞 <b>Telefon:</b> ${phone || 'Ko\'rsatilmagan'}
📧 <b>Email:</b> ${email || 'Ko\'rsatilmagan'}

💬 <b>Xabar:</b>
${message}`
}

/**
 * Send enrollment accepted notification
 */
export async function sendEnrollmentAcceptedNotification(enrollment) {
  const { childName, parentName, parentPhone } = enrollment
  
  const message = `✅ <b>Ariza qabul qilindi - Play Kids</b>

👶 <b>Bola ismi:</b> ${childName}
👤 <b>Ota-ona:</b> ${parentName}
📞 <b>Telefon:</b> ${parentPhone}

🎉 Bola muvaffaqiyatli ro'yxatga olindi!

⏰ <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}`

  return sendTelegramMessage(message)
}

export default {
  sendTelegramMessage,
  sendEnrollmentNotification,
  sendEnrollmentAcceptedNotification,
  formatContactMessage,
  isTelegramConfigured
}
