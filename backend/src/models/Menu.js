import mongoose from 'mongoose'

const menuItemSchema = new mongoose.Schema({
  name: String,
  description: String
})

const mealSchema = new mongoose.Schema({
  breakfast: menuItemSchema,
  snack1: menuItemSchema,
  lunch: menuItemSchema,
  snack2: menuItemSchema
})

const menuSchema = new mongoose.Schema({
  weekNumber: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  startDate: Date,
  endDate: Date,
  days: {
    monday: mealSchema,
    tuesday: mealSchema,
    wednesday: mealSchema,
    thursday: mealSchema,
    friday: mealSchema
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

export default mongoose.model('Menu', menuSchema)
