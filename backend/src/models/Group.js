import mongoose from 'mongoose'

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  ageRange: {
    min: Number,
    max: Number
  },
  capacity: {
    type: Number,
    default: 20
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  teacherName: String,
  description: String,
  schedule: {
    startTime: String,
    endTime: String
  },
  monthlyFee: {
    type: Number,
    default: 1500000 // 1,500,000 UZS
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

export default mongoose.model('Group', groupSchema)
