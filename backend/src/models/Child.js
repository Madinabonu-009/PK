import mongoose from 'mongoose'

const childSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  birthDate: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true
  },
  // Guruh - string ID sifatida (g1, g2, g3 yoki ObjectId)
  groupId: {
    type: String,
    required: true
  },
  groupName: String,
  // ObjectId reference (optional, eski data uchun)
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
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
  photo: String,
  medicalInfo: String,
  allergies: [String],
  notes: String,
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  enrolledAt: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  // Gamifikatsiya
  points: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  achievements: [{
    achievementId: String,
    earnedAt: Date,
    awardedBy: String
  }]
}, {
  timestamps: true
})

// Virtual: to'liq ism
childSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`
})

// JSON'ga convert qilganda id qo'shish
childSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id
    return ret
  }
})

export default mongoose.model('Child', childSchema)
