import mongoose from 'mongoose'

const gallerySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  thumbnail: String,
  title: String,
  description: String,
  album: {
    type: String,
    default: 'general'
  },
  published: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: String
}, {
  timestamps: true
})

export default mongoose.model('Gallery', gallerySchema)
