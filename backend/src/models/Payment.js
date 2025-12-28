import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
  child: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child'
  },
  childName: String,
  parentName: String,
  amount: {
    type: Number,
    required: true
  },
  method: {
    type: String,
    enum: ['payme', 'click', 'cash', 'transfer'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: String,
  description: String,
  month: String, // "2024-01" format
  paidAt: Date,
  // Payme/Click ma'lumotlari
  providerData: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
})

export default mongoose.model('Payment', paymentSchema)
