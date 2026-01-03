import express from 'express'
import mongoose from 'mongoose'
import { authenticateToken } from '../middleware/auth.js'
import axios from 'axios'

const router = express.Router()
const getCollection = (name) => mongoose.connection.collection(name)

// Telegram xabar yuborish funksiyasi
const sendTelegramMessage = async (chatId, message) => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || '8046634314:AAGdOOkGMG_V0wuYa1TQYmu2_xrOYdxkZ_M'
  try {
    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML'
    })
    return true
  } catch (error) {
    console.error('Telegram send error:', error.message)
    return false
  }
}

// GET /api/debts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, month, groupId, childId } = req.query
    const debts = await getCollection('debts').find({}).toArray()
    const children = await getCollection('children').find({}).toArray()
    const groups = await getCollection('groups').find({}).toArray()
    
    console.log('[Debts] Children count:', children.length)
    console.log('[Debts] Sample children:', children.slice(0, 2).map(c => ({
      _id: c._id?.toString(),
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      name: c.name
    })))
    
    let filtered = debts
    if (status) filtered = filtered.filter(d => d.status === status)
    if (month) filtered = filtered.filter(d => d.month === month)
    if (childId) filtered = filtered.filter(d => d.childId === childId)
    if (groupId) {
      const groupChildIds = children.filter(c => c.groupId === groupId).map(c => c._id?.toString() || c.id)
      filtered = filtered.filter(d => groupChildIds.includes(d.childId))
    }
    
    const result = filtered.map(debt => {
      const debtChildId = debt.childId?.toString() || debt.childId
      
      // Child ni turli usullar bilan topish
      let child = null
      
      // 1. _id.toString() === childId
      child = children.find(c => c._id?.toString() === debtChildId)
      
      // 2. id === childId
      if (!child) {
        child = children.find(c => c.id === debtChildId)
      }
      
      // 3. _id === childId (ObjectId comparison)
      if (!child) {
        child = children.find(c => String(c._id) === String(debtChildId))
      }
      
      // 4. Partial match - childId ichida _id bor yoki aksincha
      if (!child && debtChildId) {
        child = children.find(c => {
          const cId = c._id?.toString() || c.id || ''
          return cId.includes(debtChildId) || debtChildId.includes(cId)
        })
      }
      
      const group = child ? groups.find(g => (g._id?.toString() || g.id) === child.groupId) : null
      let daysOverdue = 0
      if (debt.status !== 'paid' && debt.dueDate) {
        daysOverdue = Math.max(0, Math.floor((new Date() - new Date(debt.dueDate)) / (1000 * 60 * 60 * 24)))
      }
      
      // Child name ni to'g'ri olish
      let childName = 'Noma\'lum'
      if (child) {
        if (child.firstName && child.lastName) {
          childName = `${child.firstName} ${child.lastName}`
        } else if (child.firstName) {
          childName = child.firstName
        } else if (child.name) {
          childName = child.name
        } else if (child.fullName) {
          childName = child.fullName
        }
      } else {
        console.log('[Debts] Child not found for debt:', { debtChildId, debtId: debt._id?.toString() })
      }
      
      return {
        ...debt,
        id: debt._id?.toString() || debt.id,
        childId: debt.childId,
        childName,
        groupName: group?.name || '-',
        parentPhone: child?.parentPhone || child?.parent?.phone,
        daysOverdue,
        remainingAmount: debt.amount - (debt.paidAmount || 0)
      }
    })
    res.json(result.sort((a, b) => b.daysOverdue - a.daysOverdue))
  } catch (error) {
    console.error('Debts fetch error:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/debts/stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { month } = req.query
    let debts = await getCollection('debts').find({}).toArray()
    const children = await getCollection('children').find({}).toArray()
    
    if (month) debts = debts.filter(d => d.month === month)
    
    const totalAmount = debts.reduce((sum, d) => sum + (d.amount || 0), 0)
    const paidAmount = debts.reduce((sum, d) => sum + (d.paidAmount || 0), 0)
    
    res.json({
      totalChildren: children.length,
      totalAmount,
      paidAmount,
      pendingAmount: totalAmount - paidAmount,
      paidCount: debts.filter(d => d.status === 'paid').length,
      pendingCount: debts.filter(d => d.status === 'pending').length,
      collectionRate: totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/debts/generate
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { month, dueDate } = req.body
    const debts = await getCollection('debts').find({}).toArray()
    const children = await getCollection('children').find({ isActive: { $ne: false } }).toArray()
    const groups = await getCollection('groups').find({}).toArray()
    
    const newDebts = []
    for (const child of children) {
      const childId = child._id?.toString() || child.id
      const existing = debts.find(d => d.childId === childId && d.month === month)
      if (existing) continue
      
      const group = groups.find(g => (g._id?.toString() || g.id) === child.groupId)
      const monthlyFee = group?.monthlyFee || 500000
      
      newDebts.push({
        childId,
        amount: monthlyFee,
        month,
        dueDate: dueDate || `${month}-05`,
        status: 'pending',
        paidAmount: 0,
        createdAt: new Date()
      })
    }
    
    if (newDebts.length > 0) {
      await getCollection('debts').insertMany(newDebts)
    }
    res.json({ success: true, created: newDebts.length })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/debts/:id/pay
router.post('/:id/pay', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body
    const debts = await getCollection('debts').find({}).toArray()
    const debt = debts.find(d => (d._id?.toString() || d.id) === req.params.id)
    
    if (!debt) return res.status(404).json({ error: 'Qarzdorlik topilmadi' })
    
    const newPaidAmount = (debt.paidAmount || 0) + amount
    const remaining = debt.amount - newPaidAmount
    const newStatus = remaining <= 0 ? 'paid' : 'partial'
    
    if (debt._id) {
      await getCollection('debts').updateOne({ _id: debt._id }, { $set: { paidAmount: newPaidAmount, status: newStatus, paidAt: new Date() } })
    } else {
      await getCollection('debts').updateOne({ id: debt.id }, { $set: { paidAmount: newPaidAmount, status: newStatus, paidAt: new Date() } })
    }
    
    res.json({ ...debt, paidAmount: newPaidAmount, status: newStatus })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/debts/regenerate - Eski debts ni o'chirib, yangi children ID lari bilan qayta yaratish
router.post('/regenerate', authenticateToken, async (req, res) => {
  try {
    const { month, dueDate, keepPaid } = req.body
    const targetMonth = month || new Date().toISOString().slice(0, 7) // 2025-12
    
    // Barcha children ni olish
    const children = await getCollection('children').find({ isActive: { $ne: false } }).toArray()
    const groups = await getCollection('groups').find({}).toArray()
    
    // Eski debts ni olish (agar keepPaid true bo'lsa, paid larni saqlaymiz)
    const oldDebts = await getCollection('debts').find({ month: targetMonth }).toArray()
    
    // Eski debts ni o'chirish
    if (!keepPaid) {
      await getCollection('debts').deleteMany({ month: targetMonth })
    } else {
      // Faqat pending va partial larni o'chirish
      await getCollection('debts').deleteMany({ month: targetMonth, status: { $ne: 'paid' } })
    }
    
    // Yangi debts yaratish
    const newDebts = []
    for (const child of children) {
      const childId = child._id.toString()
      
      // Agar keepPaid va bu child uchun paid debt bor bo'lsa, skip
      if (keepPaid) {
        const existingPaid = oldDebts.find(d => 
          (d.childId === childId || d.childId === child.id) && d.status === 'paid'
        )
        if (existingPaid) continue
      }
      
      // Guruh narxini olish
      const group = groups.find(g => (g._id?.toString() || g.id) === child.groupId)
      const monthlyFee = group?.monthlyFee || 500000
      
      newDebts.push({
        childId: childId, // Yangi MongoDB ObjectId
        amount: monthlyFee,
        month: targetMonth,
        dueDate: dueDate || `${targetMonth}-05`,
        status: 'pending',
        paidAmount: 0,
        createdAt: new Date()
      })
    }
    
    if (newDebts.length > 0) {
      await getCollection('debts').insertMany(newDebts)
    }
    
    console.log(`[Debts] Regenerated ${newDebts.length} debts for ${targetMonth}`)
    
    res.json({ 
      success: true, 
      message: `${newDebts.length} ta qarzdorlik qayta yaratildi`,
      created: newDebts.length,
      month: targetMonth
    })
  } catch (error) {
    console.error('Debts regenerate error:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/debts/:id/remind - Bitta qarzdorga eslatma yuborish
router.post('/:id/remind', authenticateToken, async (req, res) => {
  try {
    const debts = await getCollection('debts').find({}).toArray()
    const debt = debts.find(d => (d._id?.toString() || d.id) === req.params.id)
    
    if (!debt) return res.status(404).json({ error: 'Qarzdorlik topilmadi' })
    
    const children = await getCollection('children').find({}).toArray()
    const child = children.find(c => 
      c._id?.toString() === debt.childId || 
      c.id === debt.childId ||
      String(c._id) === String(debt.childId)
    )
    
    if (!child) return res.status(404).json({ error: 'Bola topilmadi' })
    
    const parentPhone = child.parentPhone || child.parent?.phone
    const childName = child.firstName && child.lastName 
      ? `${child.firstName} ${child.lastName}` 
      : child.firstName || child.name || 'Noma\'lum'
    
    const remainingAmount = debt.amount - (debt.paidAmount || 0)
    
    // Telegram xabar matni
    const message = `🔔 <b>To'lov eslatmasi</b>\n\n` +
      `👶 Bola: <b>${childName}</b>\n` +
      `💰 Qarzdorlik: <b>${remainingAmount.toLocaleString()} so'm</b>\n` +
      `📅 Muddat: <b>${debt.dueDate || 'Belgilanmagan'}</b>\n\n` +
      `Iltimos, to'lovni o'z vaqtida amalga oshiring.\n` +
      `📞 Bog'lanish: +998 94 514 09 49`
    
    // Admin chat ID ga yuborish
    const adminChatId = process.env.TELEGRAM_CHAT_ID || '8058402292'
    const sent = await sendTelegramMessage(adminChatId, message)
    
    if (sent) {
      // Eslatma yuborilgan vaqtni saqlash
      await getCollection('debts').updateOne(
        { _id: debt._id },
        { $set: { lastReminder: new Date() } }
      )
      res.json({ success: true, message: 'Eslatma yuborildi' })
    } else {
      res.status(500).json({ error: 'Telegram xabar yuborishda xatolik' })
    }
  } catch (error) {
    console.error('Remind error:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/debts/remind-all - Barcha qarzdorlarga eslatma yuborish
router.post('/remind-all', authenticateToken, async (req, res) => {
  try {
    const debts = await getCollection('debts').find({ status: { $ne: 'paid' } }).toArray()
    const children = await getCollection('children').find({}).toArray()
    
    if (debts.length === 0) {
      return res.json({ success: true, sent: 0, message: 'Qarzdorlik yo\'q' })
    }
    
    let sentCount = 0
    const adminChatId = process.env.TELEGRAM_CHAT_ID || '8058402292'
    
    // Umumiy hisobot xabari
    let reportMessage = `📊 <b>Qarzdorlik hisoboti</b>\n\n`
    reportMessage += `📅 Sana: ${new Date().toLocaleDateString('uz-UZ')}\n`
    reportMessage += `👥 Jami qarzdorlar: ${debts.length} ta\n\n`
    reportMessage += `<b>Ro'yxat:</b>\n`
    
    let totalDebt = 0
    
    for (const debt of debts) {
      const child = children.find(c => 
        c._id?.toString() === debt.childId || 
        c.id === debt.childId ||
        String(c._id) === String(debt.childId)
      )
      
      const childName = child 
        ? (child.firstName && child.lastName 
            ? `${child.firstName} ${child.lastName}` 
            : child.firstName || child.name || 'Noma\'lum')
        : 'Noma\'lum'
      
      const remainingAmount = debt.amount - (debt.paidAmount || 0)
      totalDebt += remainingAmount
      
      reportMessage += `• ${childName}: ${remainingAmount.toLocaleString()} so'm`
      if (debt.daysOverdue > 0) {
        reportMessage += ` ⚠️ (${debt.daysOverdue} kun kechikish)`
      }
      reportMessage += `\n`
    }
    
    reportMessage += `\n💰 <b>Jami qarzdorlik: ${totalDebt.toLocaleString()} so'm</b>`
    
    // Admin ga yuborish
    const sent = await sendTelegramMessage(adminChatId, reportMessage)
    
    if (sent) {
      sentCount = 1
      
      // Barcha debts ga lastReminder qo'shish
      await getCollection('debts').updateMany(
        { status: { $ne: 'paid' } },
        { $set: { lastReminder: new Date() } }
      )
    }
    
    res.json({ 
      success: true, 
      sent: sentCount, 
      totalDebtors: debts.length,
      totalAmount: totalDebt,
      message: `Qarzdorlik hisoboti yuborildi (${debts.length} ta qarzdor, ${totalDebt.toLocaleString()} so'm)`
    })
  } catch (error) {
    console.error('Remind all error:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
