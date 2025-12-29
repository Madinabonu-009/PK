import mongoose from 'mongoose'

const groupSchema = new mongoose.Schema({
  // String ID (g1, g2, g3) - eski data uchun
  id: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  ageRange: {
    type: String, // "2-3 yosh" format
    default: ''
  },
  capacity: {
    type: Number,
    default: 20
  },
  // Teacher reference
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  teacherId: String, // String ID (t1, t2, t3)
  teacherName: String,
  description: String,
  schedule: {
    startTime: String,
    endTime: String
  },
  monthlyFee: {
    type: Number,
    default: 500000
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// JSON'ga convert qilganda id qo'shish
groupSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    // Agar string id bo'lsa, uni ishlatish
    if (ret.id && typeof ret.id === 'string' && ret.id.startsWith('g')) {
      // id allaqachon to'g'ri
    } else {
      ret.id = ret._id
    }
    return ret
  }
})

export default mongoose.model('Group', groupSchema)
