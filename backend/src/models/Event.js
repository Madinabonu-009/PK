import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
  title: {
    type: mongoose.Schema.Types.Mixed, // Ko'p tilli yoki String
    required: true
  },
  description: mongoose.Schema.Types.Mixed, // Ko'p tilli yoki String
  date: {
    type: Date,
    required: true
  },
  endDate: Date,
  time: String,
  type: {
    type: String,
    enum: ['holiday', 'event', 'meeting', 'activity', 'other'],
    default: 'event'
  },
  location: mongoose.Schema.Types.Mixed,
  isPublic: {
    type: Boolean,
    default: true
  },
  groups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  }],
  color: {
    type: String,
    default: '#4CAF50'
  }
}, {
  timestamps: true
})

export default mongoose.model('Event', eventSchema)
