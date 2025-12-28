import express from 'express'
import mongoose from 'mongoose'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import { authenticateToken } from '../middleware/auth.js'
import logger from '../utils/logger.js'

const router = express.Router()

const getCollection = (name) => mongoose.connection.collection(name)

const MONTHLY_FEE = parseInt(process.env.MONTHLY_FEE) || 500000
const SITE_URL = process.env.SITE_URL || 'http://localhost:5173'

// GET /api/payments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, childId } = req.query
    let query = {}
    if (status) query.status = status
    if (childId) query.childId = childId
    
    const payments = await getCollection('payments').find(query).sort({ createdAt: -1 }).toArray()
    res.json(payments.map(p => ({ ...p, id: p._id || p.id })))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' })
  }
})

// GET /api/payments/stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const payments = await getCollection('payments').find({}).toArray()
    const completed = payments.filter(p => p.status === 'completed')
    const pending = payments.filter(p => p.status === 'pending')
    
    res.json({
      totalRevenue: completed.reduce((sum, p) => sum + (p.amount || 0), 0),
      pendingAmount: pending.reduce((sum, p) => sum + (p.amount || 0), 0),
      completedCount: completed.length,
      pendingCount: pending.length,
      failedCount: payments.filter(p => p.status === 'failed').length
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// GET /api/payments/config
router.get('/config', (req, res) => {
  res.json({
    testMode: true,
    monthlyFee: MONTHLY_FEE
  })
})

// POST /api/payments/create
router.post('/create', async (req, res) => {
  try {
    const { childId, childName, provider, amount, description } = req.body
    if (!childId || !childName || !provider) {
      return res.status(400).json({ error: 'childId, childName and provider required' })
    }
    
    const paymentId = `pay_${uuidv4().slice(0, 8)}`
    const newPayment = {
      id: paymentId,
      childId,
      childName,
      amount: amount || MONTHLY_FEE,
      provider,
      status: 'pending',
      description: description || 'Oylik to\'lov',
      createdAt: new Date()
    }
    
    await getCollection('payments').insertOne(newPayment)
    
    const paymentUrl = `${SITE_URL}/payment/test?id=${paymentId}&provider=${provider}&amount=${newPayment.amount}`
    
    res.status(201).json({ payment: newPayment, paymentUrl, testMode: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payment' })
  }
})

// POST /api/payments/callback
router.post('/callback', async (req, res) => {
  try {
    const { id, status, transactionId } = req.body
    
    const payments = await getCollection('payments').find({}).toArray()
    const payment = payments.find(p => (p._id?.toString() || p.id) === id)
    
    if (!payment) return res.status(404).json({ error: 'Payment not found' })
    
    const updateData = {
      status: status || 'completed',
      transactionId: transactionId || `TXN${Date.now()}`,
      completedAt: new Date()
    }
    
    if (payment._id) {
      await getCollection('payments').updateOne({ _id: payment._id }, { $set: updateData })
    } else {
      await getCollection('payments').updateOne({ id: payment.id }, { $set: updateData })
    }
    
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to process callback' })
  }
})

// POST /api/payments/simulate/:id
router.post('/simulate/:id', authenticateToken, async (req, res) => {
  try {
    const payments = await getCollection('payments').find({}).toArray()
    const payment = payments.find(p => (p._id?.toString() || p.id) === req.params.id)
    
    if (!payment) return res.status(404).json({ error: 'Payment not found' })
    if (payment.status === 'completed') return res.status(400).json({ error: 'Already completed' })
    
    const updateData = {
      status: 'completed',
      transactionId: `SIM_${Date.now()}`,
      completedAt: new Date()
    }
    
    if (payment._id) {
      await getCollection('payments').updateOne({ _id: payment._id }, { $set: updateData })
    } else {
      await getCollection('payments').updateOne({ id: payment.id }, { $set: updateData })
    }
    
    res.json({ success: true, message: 'Payment simulated' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to simulate' })
  }
})

export default router
