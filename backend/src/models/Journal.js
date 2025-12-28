import mongoose from 'mongoose'

const journalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['photo', 'video'],
    default: 'photo'
  },
  mediaUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: String,
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  groupName: String,
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child'
  }],
  date: {
    type: Date,
    default: Date.now
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  tags: [String]
}, {
  timestamps: true
})

export default mongoose.model('Journal', journalSchema)
