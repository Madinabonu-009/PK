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
    
    let filtered = debts
    if (status) filtered = filtered.filter(d => d.status === status)
    if (month) filtered = filtered.filter(d => d.month === month)
    if (childId) filtered = filtered.filter(d => d.childId === childId)
    if (groupId) {
      const groupChildIds = children.filter(c => c.groupId === groupId).map(c => c._id?.toString() || c.id)
      filtered = filtered.filter(d => groupChildIds.includes(d.childId))
    }
    
    const result = filtered.map(debt => {
      const child = children.find(c => (c._id?.toString() || c.id) === debt.childId)
      const group = child ? groups.find(g => (g._id?.toString() || g.id) === child.groupId) : null
      let daysOverdue = 0
      if (debt.status !== 'paid' && debt.dueDate) {
        daysOverdue = Math.max(0, Math.floor((new Date() - new Date(debt.dueDate)) / (1000 * 60 * 60 * 24)))
      }
      return {
        ...debt,
        id: debt._id || debt.id,
        childName: child ? `${child.firstName} ${child.lastName}` : 'Noma\'lum',
        groupName: group?.name || '-',
        parentPhone: child?.parentPhone,
        daysOverdue,
        remainingAmount: debt.amount - (debt.paidAmount || 0)
      }
    })
    res.json(result.sort((a, b) => b.daysOverdue - a.daysOverdue))
  } catch (error) {
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
