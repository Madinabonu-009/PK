import express from 'express'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import { readData, writeData } from '../utils/db.js'
import { authenticateToken } from '../middleware/auth.js'
import Payment from '../models/Payment.js'
import logger from '../utils/logger.js'

const router = express.Router()

// Environment variables dan credentials olish
const PAYMENT_CONFIG = {
  payme: {
    merchantId: process.env.PAYME_MERCHANT_ID,
    secretKey: process.env.PAYME_SECRET_KEY,
    testMode: !process.env.PAYME_MERCHANT_ID || process.env.PAYME_TEST_MODE === 'true'
  },
  click: {
    merchantId: process.env.CLICK_MERCHANT_ID,
    serviceId: process.env.CLICK_SERVICE_ID,
    secretKey: process.env.CLICK_SECRET_KEY,
    testMode: !process.env.CLICK_MERCHANT_ID || process.env.CLICK_TEST_MODE === 'true'
  }
}

// Sayt URL (production uchun)
const SITE_URL = process.env.SITE_URL || 'http://localhost:5173'
const API_URL = process.env.API_URL || 'http://localhost:3000'

const MONTHLY_FEE = parseInt(process.env.MONTHLY_FEE) || 500000 // 500,000 UZS

// Test rejimini tekshirish
const isTestMode = () => {
  return PAYMENT_CONFIG.payme.testMode && PAYMENT_CONFIG.click.testMode
}

// GET /api/payments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, childId } = req.query
    
    if (req.app.locals.useDatabase) {
      let query = {}
      if (status) query.status = status
      if (childId) query.child = childId
      const payments = await Payment.find(query).sort({ createdAt: -1 }).populate('child')
      return res.json(payments)
    }
    
    let payments = readData('payments.json') || []
    if (status) payments = payments.filter(p => p.status === status)
    if (childId) payments = payments.filter(p => p.childId === childId)
    payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    res.json(payments)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' })
  }
})

// GET /api/payments/stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    if (req.app.locals.useDatabase) {
      const completed = await Payment.find({ status: 'completed' })
      const pending = await Payment.find({ status: 'pending' })
      const failed = await Payment.find({ status: 'failed' })
      
      const totalRevenue = completed.reduce((sum, p) => sum + p.amount, 0)
      const pendingAmount = pending.reduce((sum, p) => sum + p.amount, 0)
      
      const monthlyRevenue = {}
      completed.forEach(p => {
        const month = p.paidAt ? p.paidAt.toISOString().slice(0, 7) : p.createdAt.toISOString().slice(0, 7)
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + p.amount
      })
      
      return res.json({
        totalRevenue,
        pendingAmount,
        completedCount: completed.length,
        pendingCount: pending.length,
        failedCount: failed.length,
        monthlyRevenue
      })
    }
    
    const payments = readData('payments.json') || []
    const completed = payments.filter(p => p.status === 'completed')
    const pending = payments.filter(p => p.status === 'pending')
    const failed = payments.filter(p => p.status === 'failed')
    
    const totalRevenue = completed.reduce((sum, p) => sum + p.amount, 0)
    const pendingAmount = pending.reduce((sum, p) => sum + p.amount, 0)
    
    const monthlyRevenue = {}
    completed.forEach(p => {
      const month = new Date(p.completedAt).toISOString().slice(0, 7)
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + p.amount
    })
    
    res.json({
      totalRevenue,
      pendingAmount,
      completedCount: completed.length,
      pendingCount: pending.length,
      failedCount: failed.length,
      monthlyRevenue
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment stats' })
  }
})

// GET /api/payments/config - Frontend uchun config
router.get('/config', (req, res) => {
  res.json({
    testMode: isTestMode(),
    payme: {
      enabled: !!PAYMENT_CONFIG.payme.merchantId,
      testMode: PAYMENT_CONFIG.payme.testMode
    },
    click: {
      enabled: !!PAYMENT_CONFIG.click.merchantId,
      testMode: PAYMENT_CONFIG.click.testMode
    },
    monthlyFee: MONTHLY_FEE
  })
})

// POST /api/payments/create
router.post('/create', async (req, res) => {
  try {
    const { childId, childName, provider, amount, type = 'monthly', description } = req.body
    
    if (!childId || !childName || !provider) {
      return res.status(400).json({ error: 'childId, childName and provider are required' })
    }
    
    if (!['payme', 'click'].includes(provider)) {
      return res.status(400).json({ error: 'Invalid payment provider' })
    }
    
    const paymentAmount = amount || MONTHLY_FEE
    let newPayment
    const paymentId = `pay_${uuidv4().slice(0, 8)}`
    
    if (req.app.locals.useDatabase) {
      newPayment = new Payment({
        child: childId,
        childName,
        amount: paymentAmount,
        method: provider,
        status: 'pending',
        description: description || (type === 'monthly' ? 'Oylik to\'lov' : 'To\'lov')
      })
      await newPayment.save()
    } else {
      const payments = readData('payments.json') || []
      newPayment = {
        id: paymentId,
        childId,
        childName,
        amount: paymentAmount,
        currency: 'UZS',
        type,
        status: 'pending',
        provider,
        transactionId: null,
        description: description || (type === 'monthly' ? 'Oylik to\'lov' : 'To\'lov'),
        createdAt: new Date().toISOString(),
        completedAt: null
      }
      payments.push(newPayment)
      writeData('payments.json', payments)
    }
    
    const id = newPayment._id || newPayment.id
    let paymentUrl = ''
    
    // Payme URL yaratish
    if (provider === 'payme') {
      if (PAYMENT_CONFIG.payme.merchantId && !PAYMENT_CONFIG.payme.testMode) {
        // Haqiqiy Payme URL
        const params = {
          m: PAYMENT_CONFIG.payme.merchantId,
          ac: { order_id: id },
          a: paymentAmount * 100, // Payme tiyinda qabul qiladi
          c: `${SITE_URL}/payment/success?id=${id}`
        }
        const encoded = Buffer.from(JSON.stringify(params)).toString('base64')
        paymentUrl = `https://checkout.paycom.uz/${encoded}`
      } else {
        // Test URL
        paymentUrl = `${SITE_URL}/payment/test?id=${id}&provider=payme&amount=${paymentAmount}`
      }
    }
    
    // Click URL yaratish
    if (provider === 'click') {
      if (PAYMENT_CONFIG.click.merchantId && !PAYMENT_CONFIG.click.testMode) {
        // Haqiqiy Click URL
        paymentUrl = `https://my.click.uz/services/pay?` +
          `service_id=${PAYMENT_CONFIG.click.serviceId}` +
          `&merchant_id=${PAYMENT_CONFIG.click.merchantId}` +
          `&amount=${paymentAmount}` +
          `&transaction_param=${id}` +
          `&return_url=${encodeURIComponent(`${SITE_URL}/payment/success?id=${id}`)}`
      } else {
        // Test URL
        paymentUrl = `${SITE_URL}/payment/test?id=${id}&provider=click&amount=${paymentAmount}`
      }
    }
    
    res.status(201).json({
      payment: newPayment,
      paymentUrl,
      testMode: isTestMode(),
      message: isTestMode() 
        ? 'Test rejimida. Haqiqiy to\'lov uchun .env faylga credentials qo\'shing.'
        : 'To\'lov sahifasiga yo\'naltirilmoqda...'
    })
  } catch (error) {
    console.error('Payment create error:', error)
    res.status(500).json({ error: 'Failed to create payment' })
  }
})

// ============================================
// PAYME WEBHOOK ENDPOINTS
// ============================================

// POST /api/payments/payme - Payme webhook
router.post('/payme', async (req, res) => {
  try {
    const { method, params, id } = req.body
    
    // Auth tekshirish
    const authHeader = req.headers.authorization
    if (PAYMENT_CONFIG.payme.secretKey && authHeader) {
      const [, credentials] = authHeader.split(' ')
      const decoded = Buffer.from(credentials, 'base64').toString()
      const [, password] = decoded.split(':')
      
      if (password !== PAYMENT_CONFIG.payme.secretKey) {
        return res.json({
          error: { code: -32504, message: 'Unauthorized' },
          id
        })
      }
    }
    
    // Payme methods
    switch (method) {
      case 'CheckPerformTransaction':
        return handlePaymeCheckPerform(params, id, res)
      case 'CreateTransaction':
        return handlePaymeCreateTransaction(params, id, res)
      case 'PerformTransaction':
        return handlePaymePerformTransaction(params, id, res)
      case 'CancelTransaction':
        return handlePaymeCancelTransaction(params, id, res)
      case 'CheckTransaction':
        return handlePaymeCheckTransaction(params, id, res)
      default:
        return res.json({
          error: { code: -32601, message: 'Method not found' },
          id
        })
    }
  } catch (error) {
    console.error('Payme webhook error:', error)
    res.json({ error: { code: -32400, message: 'System error' }, id: req.body?.id })
  }
})

async function handlePaymeCheckPerform(params, id, res) {
  const orderId = params.account?.order_id
  const payments = readData('payments.json') || []
  const payment = payments.find(p => p.id === orderId)
  
  if (!payment) {
    return res.json({ error: { code: -31050, message: 'Order not found' }, id })
  }
  
  if (payment.status === 'completed') {
    return res.json({ error: { code: -31051, message: 'Order already paid' }, id })
  }
  
  if (params.amount !== payment.amount * 100) {
    return res.json({ error: { code: -31001, message: 'Invalid amount' }, id })
  }
  
  res.json({ result: { allow: true }, id })
}

async function handlePaymeCreateTransaction(params, id, res) {
  const orderId = params.account?.order_id
  const payments = readData('payments.json') || []
  const index = payments.findIndex(p => p.id === orderId)
  
  if (index === -1) {
    return res.json({ error: { code: -31050, message: 'Order not found' }, id })
  }
  
  const payment = payments[index]
  
  if (payment.paymeTransactionId && payment.paymeTransactionId !== params.id) {
    return res.json({ error: { code: -31008, message: 'Transaction exists' }, id })
  }
  
  payment.paymeTransactionId = params.id
  payment.paymeCreateTime = params.time
  payment.status = 'processing'
  payments[index] = payment
  writeData('payments.json', payments)
  
  res.json({
    result: {
      create_time: payment.paymeCreateTime,
      transaction: payment.id,
      state: 1
    },
    id
  })
}

async function handlePaymePerformTransaction(params, id, res) {
  const payments = readData('payments.json') || []
  const index = payments.findIndex(p => p.paymeTransactionId === params.id)
  
  if (index === -1) {
    return res.json({ error: { code: -31003, message: 'Transaction not found' }, id })
  }
  
  const payment = payments[index]
  
  if (payment.status === 'completed') {
    return res.json({
      result: {
        transaction: payment.id,
        perform_time: payment.paymePerformTime,
        state: 2
      },
      id
    })
  }
  
  payment.status = 'completed'
  payment.paymePerformTime = Date.now()
  payment.completedAt = new Date().toISOString()
  payment.transactionId = params.id
  payments[index] = payment
  writeData('payments.json', payments)
  
  logger.info(`Payme payment completed: ${payment.id} - ${payment.amount} UZS`)
  
  res.json({
    result: {
      transaction: payment.id,
      perform_time: payment.paymePerformTime,
      state: 2
    },
    id
  })
}

async function handlePaymeCancelTransaction(params, id, res) {
  const payments = readData('payments.json') || []
  const index = payments.findIndex(p => p.paymeTransactionId === params.id)
  
  if (index === -1) {
    return res.json({ error: { code: -31003, message: 'Transaction not found' }, id })
  }
  
  const payment = payments[index]
  payment.status = 'cancelled'
  payment.paymeCancelTime = Date.now()
  payment.cancelReason = params.reason
  payments[index] = payment
  writeData('payments.json', payments)
  
  res.json({
    result: {
      transaction: payment.id,
      cancel_time: payment.paymeCancelTime,
      state: payment.paymePerformTime ? -2 : -1
    },
    id
  })
}

async function handlePaymeCheckTransaction(params, id, res) {
  const payments = readData('payments.json') || []
  const payment = payments.find(p => p.paymeTransactionId === params.id)
  
  if (!payment) {
    return res.json({ error: { code: -31003, message: 'Transaction not found' }, id })
  }
  
  let state = 1
  if (payment.status === 'completed') state = 2
  if (payment.status === 'cancelled') state = payment.paymePerformTime ? -2 : -1
  
  res.json({
    result: {
      create_time: payment.paymeCreateTime,
      perform_time: payment.paymePerformTime || 0,
      cancel_time: payment.paymeCancelTime || 0,
      transaction: payment.id,
      state,
      reason: payment.cancelReason || null
    },
    id
  })
}

// ============================================
// CLICK WEBHOOK ENDPOINTS
// ============================================

// POST /api/payments/click/prepare - Click prepare
router.post('/click/prepare', async (req, res) => {
  try {
    const { click_trans_id, service_id, merchant_trans_id, amount, action, sign_time, sign_string } = req.body
    
    // Sign tekshirish
    if (PAYMENT_CONFIG.click.secretKey) {
      const expectedSign = crypto
        .createHash('md5')
        .update(`${click_trans_id}${service_id}${PAYMENT_CONFIG.click.secretKey}${merchant_trans_id}${amount}${action}${sign_time}`)
        .digest('hex')
      
      if (sign_string !== expectedSign) {
        return res.json({ error: -1, error_note: 'Invalid signature' })
      }
    }
    
    const payments = readData('payments.json') || []
    const payment = payments.find(p => p.id === merchant_trans_id)
    
    if (!payment) {
      return res.json({ error: -5, error_note: 'Order not found' })
    }
    
    if (payment.status === 'completed') {
      return res.json({ error: -4, error_note: 'Already paid' })
    }
    
    if (parseInt(amount) !== payment.amount) {
      return res.json({ error: -2, error_note: 'Invalid amount' })
    }
    
    res.json({
      click_trans_id,
      merchant_trans_id,
      merchant_prepare_id: payment.id,
      error: 0,
      error_note: 'Success'
    })
  } catch (error) {
    console.error('Click prepare error:', error)
    res.json({ error: -9, error_note: 'System error' })
  }
})

// POST /api/payments/click/complete - Click complete
router.post('/click/complete', async (req, res) => {
  try {
    const { click_trans_id, service_id, merchant_trans_id, merchant_prepare_id, amount, action, sign_time, sign_string, error: clickError } = req.body
    
    // Sign tekshirish
    if (PAYMENT_CONFIG.click.secretKey) {
      const expectedSign = crypto
        .createHash('md5')
        .update(`${click_trans_id}${service_id}${PAYMENT_CONFIG.click.secretKey}${merchant_trans_id}${merchant_prepare_id}${amount}${action}${sign_time}`)
        .digest('hex')
      
      if (sign_string !== expectedSign) {
        return res.json({ error: -1, error_note: 'Invalid signature' })
      }
    }
    
    const payments = readData('payments.json') || []
    const index = payments.findIndex(p => p.id === merchant_trans_id)
    
    if (index === -1) {
      return res.json({ error: -5, error_note: 'Order not found' })
    }
    
    const payment = payments[index]
    
    if (clickError < 0) {
      payment.status = 'failed'
      payment.clickError = clickError
      payments[index] = payment
      writeData('payments.json', payments)
      return res.json({ error: clickError, error_note: 'Payment failed' })
    }
    
    payment.status = 'completed'
    payment.clickTransId = click_trans_id
    payment.transactionId = click_trans_id.toString()
    payment.completedAt = new Date().toISOString()
    payments[index] = payment
    writeData('payments.json', payments)
    
    logger.info(`Click payment completed: ${payment.id} - ${payment.amount} UZS`)
    
    res.json({
      click_trans_id,
      merchant_trans_id,
      merchant_confirm_id: payment.id,
      error: 0,
      error_note: 'Success'
    })
  } catch (error) {
    console.error('Click complete error:', error)
    res.json({ error: -9, error_note: 'System error' })
  }
})

// ============================================
// OTHER ENDPOINTS
// ============================================

// POST /api/payments/callback - Manual callback (test uchun)
router.post('/callback', async (req, res) => {
  try {
    const { id, status, transactionId } = req.body
    
    if (req.app.locals.useDatabase) {
      const payment = await Payment.findByIdAndUpdate(id, {
        status: status || 'completed',
        transactionId: transactionId || `TXN${Date.now()}`,
        paidAt: new Date()
      }, { new: true })
      if (!payment) return res.status(404).json({ error: 'Payment not found' })
      return res.json({ success: true, payment })
    }
    
    const payments = readData('payments.json') || []
    const index = payments.findIndex(p => p.id === id)
    if (index === -1) return res.status(404).json({ error: 'Payment not found' })
    
    payments[index] = {
      ...payments[index],
      status: status || 'completed',
      transactionId: transactionId || `TXN${Date.now()}`,
      completedAt: new Date().toISOString()
    }
    writeData('payments.json', payments)
    res.json({ success: true, payment: payments[index] })
  } catch (error) {
    res.status(500).json({ error: 'Failed to process callback' })
  }
})

// POST /api/payments/simulate/:id - Test uchun simulyatsiya
router.post('/simulate/:id', authenticateToken, async (req, res) => {
  try {
    if (!isTestMode()) {
      return res.status(400).json({ error: 'Simulation only available in test mode' })
    }
    
    if (req.app.locals.useDatabase) {
      const payment = await Payment.findById(req.params.id)
      if (!payment) return res.status(404).json({ error: 'Payment not found' })
      if (payment.status === 'completed') return res.status(400).json({ error: 'Payment already completed' })
      
      payment.status = 'completed'
      payment.transactionId = `SIM_${Date.now()}`
      payment.paidAt = new Date()
      await payment.save()
      return res.json({ success: true, message: 'Payment simulated', payment })
    }
    
    const payments = readData('payments.json') || []
    const index = payments.findIndex(p => p.id === req.params.id)
    if (index === -1) return res.status(404).json({ error: 'Payment not found' })
    if (payments[index].status === 'completed') return res.status(400).json({ error: 'Payment already completed' })
    
    payments[index] = {
      ...payments[index],
      status: 'completed',
      transactionId: `SIM_${Date.now()}`,
      completedAt: new Date().toISOString()
    }
    writeData('payments.json', payments)
    res.json({ success: true, message: 'Payment simulated', payment: payments[index] })
  } catch (error) {
    res.status(500).json({ error: 'Failed to simulate payment' })
  }
})

export default router
