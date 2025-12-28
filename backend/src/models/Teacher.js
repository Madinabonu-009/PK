import mongoose from 'mongoose'

// Ko'p tilli matn uchun schema
const localizedStringSchema = new mongoose.Schema({
  uz: String,
  ru: String,
  en: String
}, { _id: false })

const teacherSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    trim: true,
    default: ''
  },
  name: String, // To'liq ism (eski format uchun)
  position: {
    type: mongoose.Schema.Types.Mixed, // String yoki Object
    required: true
  },
  role: mongoose.Schema.Types.Mixed, // Ko'p tilli
  education: mongoose.Schema.Types.Mixed, // Ko'p tilli
  experience: mongoose.Schema.Types.Mixed, // Ko'p tilli yoki Number
  phone: String,
  email: String,
  photo: String,
  bio: mongoose.Schema.Types.Mixed, // Ko'p tilli
  specializations: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

teacherSchema.virtual('fullName').get(function() {
  if (this.name) return this.name
  return `${this.firstName} ${this.lastName}`.trim()
})

export default mongoose.model('Teacher', teacherSchema)
