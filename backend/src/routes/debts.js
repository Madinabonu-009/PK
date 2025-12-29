import express from 'express'
import mongoose from 'mongoose'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()
const getCollection = (name) => mongoose.connection.collection(name)

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

export default router
