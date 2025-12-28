import mongoose from 'mongoose'

const blogPostSchema = new mongoose.Schema({
  title: {
    type: mongoose.Schema.Types.Mixed, // Ko'p tilli yoki String
    required: true
  },
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed, // Ko'p tilli yoki String
    required: true
  },
  excerpt: mongoose.Schema.Types.Mixed,
  image: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  authorName: String,
  category: {
    type: String,
    enum: ['news', 'tips', 'events', 'education', 'health'],
    default: 'news'
  },
  tags: [String],
  isPublished: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Slug yaratish
blogPostSchema.pre('save', function() {
  if (!this.slug) {
    const titleText = typeof this.title === 'object' ? (this.title.uz || this.title.en || '') : this.title
    this.slug = titleText
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
  }
})

export default mongoose.model('BlogPost', blogPostSchema)
