import mongoose from 'mongoose'

const achievementSchema = new mongoose.Schema({
  name: {
    type: mongoose.Schema.Types.Mixed, // Ko'p tilli yoki String
    required: true
  },
  description: mongoose.Schema.Types.Mixed,
  icon: {
    type: String,
    default: '🏆'
  },
  category: {
    type: String,
    enum: ['attendance', 'behavior', 'learning', 'sports', 'creativity', 'social'],
    default: 'learning'
  },
  points: {
    type: Number,
    default: 10
  },
  criteria: mongoose.Schema.Types.Mixed,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

export default mongoose.model('Achievement', achievementSchema)
