import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'parent'],
    default: 'parent'
  },
  name: {
    type: String,
    required: true
  },
  email: String,
  phone: String,
  avatar: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Parolni hash qilish
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return
  // Agar parol allaqachon hash qilingan bo'lsa, qayta hash qilmaslik
  if (this.password.startsWith('$2')) return
  this.password = await bcrypt.hash(this.password, 10)
})

// Parolni tekshirish
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.model('User', userSchema)
