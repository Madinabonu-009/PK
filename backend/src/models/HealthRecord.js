/**
 * Health Record Model
 * Bolaning tibbiy ma'lumotlari
 */

import mongoose from 'mongoose'

const vaccinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  nextDue: { type: Date },
  doctor: String,
  notes: String,
  completed: { type: Boolean, default: true }
})

const allergySchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['food', 'medicine', 'environmental', 'other'],
    required: true 
  },
  name: { type: String, required: true },
  severity: { 
    type: String, 
    enum: ['mild', 'moderate', 'severe'],
    default: 'moderate'
  },
  symptoms: [String],
  treatment: String,
  notes: String
})

const dailyHealthSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  temperature: Number,
  mood: { 
    type: String, 
    enum: ['excellent', 'good', 'normal', 'tired', 'sick'],
    default: 'good'
  },
  appetite: {
    type: String,
    enum: ['excellent', 'good', 'normal', 'poor', 'none'],
    default: 'good'
  },
  sleep: {
    type: String,
    enum: ['excellent', 'good', 'normal', 'poor'],
    default: 'good'
  },
  symptoms: [String],
  medications: [{
    name: String,
    dose: String,
    time: String
  }],
  notes: String,
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
})

const healthRecordSchema = new mongoose.Schema({
  childId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Child', 
    required: true,
    unique: true
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'],
    default: 'unknown'
  },
  height: Number, // cm
  weight: Number, // kg
  vaccinations: [vaccinationSchema],
  allergies: [allergySchema],
  specialNeeds: [{
    type: String,
    description: String,
    accommodations: String
  }],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date,
    prescribedBy: String,
    isActive: { type: Boolean, default: true }
  }],
  emergencyContacts: [{
    name: { type: String, required: true },
    relationship: String,
    phone: { type: String, required: true },
    isPrimary: { type: Boolean, default: false }
  }],
  insuranceInfo: {
    provider: String,
    policyNumber: String,
    expiryDate: Date
  },
  doctorInfo: {
    name: String,
    phone: String,
    clinic: String,
    address: String
  },
  dailyRecords: [dailyHealthSchema],
  lastCheckup: Date,
  notes: String
}, {
  timestamps: true
})

// Indexes (childId already has unique index from schema definition)
healthRecordSchema.index({ 'dailyRecords.date': -1 })
healthRecordSchema.index({ 'vaccinations.nextDue': 1 })

export default mongoose.model('HealthRecord', healthRecordSchema)
