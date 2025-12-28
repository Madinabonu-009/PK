import mongoose from 'mongoose'

const enrollmentSchema = new mongoose.Schema({
  // Bola ma'lumotlari
  childName: {
    type: String,
    required: true
  },
  childBirthDate: {
    type: Date,
    required: true
  },
  childGender: {
    type: String,
    enum: ['male', 'female']
  },
  // Ota-ona ma'lumotlari
  parentName: {
    type: String,
    required: true
  },
  parentPhone: {
    type: String,
    required: true
  },
  parentEmail: String,
  address: String,
  // Ariza holati
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  preferredGroup: String,
  message: String,
  // Admin tomonidan
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  rejectionReason: String,
  // To'lov
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid'],
    default: 'unpaid'
  },
  paymentAmount: Number
}, {
  timestamps: true
})

export default mongoose.model('Enrollment', enrollmentSchema)
