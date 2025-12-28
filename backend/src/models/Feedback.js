import mongoose from 'mongoose'

const feedbackSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['teacher', 'group', 'general'],
    default: 'general'
  },
  targetId: String, // teacher yoki group ID
  targetName: String,
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: String,
  parentName: String,
  parentEmail: String,
  isApproved: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

export default mongoose.model('Feedback', feedbackSchema)
