/**
 * MongoDB Seed Script
 * JSON fayllardan MongoDB ga ma'lumotlarni ko'chirish
 * 
 * Ishlatish: node src/scripts/seed.js
 */

import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Models
import User from '../models/User.js'
import Child from '../models/Child.js'
import Group from '../models/Group.js'
import Teacher from '../models/Teacher.js'
import Enrollment from '../models/Enrollment.js'
import Event from '../models/Event.js'
import BlogPost from '../models/BlogPost.js'
import Achievement from '../models/Achievement.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDir = path.join(__dirname, '../../data')

// JSON faylni o'qish
const readJSON = (filename) => {
  try {
    const filePath = path.join(dataDir, filename)
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'))
    }
    return []
  } catch (error) {
    console.log(`⚠️ ${filename} o'qishda xato:`, error.message)
    return []
  }
}

async function seed() {
  try {
    // MongoDB ga ulanish
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI topilmadi .env faylda')
      process.exit(1)
    }
    
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ MongoDB ga ulandi')
    
    // Eski ma'lumotlarni o'chirish (ixtiyoriy)
    const clearDB = process.argv.includes('--clear')
    if (clearDB) {
      console.log('🗑️ Eski malumotlar ochirilmoqda...')
      await Promise.all([
        User.deleteMany({}),
        Child.deleteMany({}),
        Group.deleteMany({}),
        Teacher.deleteMany({}),
        Enrollment.deleteMany({}),
        Event.deleteMany({}),
        BlogPost.deleteMany({}),
        Achievement.deleteMany({})
      ])
    }
    
    // 1. Users
    console.log('👤 Foydalanuvchilar yuklanmoqda...')
    const users = readJSON('users.json')
    for (const user of users) {
      const exists = await User.findOne({ username: user.username })
      if (!exists) {
        await User.create({
          username: user.username,
          password: user.password,
          role: user.role || 'admin',
          name: user.name || user.username,
          email: user.email,
          phone: user.phone
        })
      }
    }
    console.log(`  ✓ ${users.length} foydalanuvchi`)
    
    // 2. Teachers
    console.log('👩‍🏫 Oqituvchilar yuklanmoqda...')
    const teachers = readJSON('teachers.json')
    for (const teacher of teachers) {
      const exists = await Teacher.findOne({ name: teacher.name })
      if (!exists) {
        await Teacher.create({
          name: teacher.name,
          firstName: teacher.name?.split(' ')[0] || '',
          lastName: teacher.name?.split(' ').slice(1).join(' ') || '',
          position: teacher.role || teacher.position,
          role: teacher.role,
          education: teacher.education,
          experience: teacher.experience,
          photo: teacher.photo || '/images/teacher-1.jpg',
          bio: teacher.bio
        })
      }
    }
    console.log(`  ✓ ${teachers.length} oqituvchi`)
    
    // 3. Groups
    console.log('👥 Guruhlar yuklanmoqda...')
    const groups = readJSON('groups.json')
    for (const group of groups) {
      const exists = await Group.findOne({ name: group.name })
      if (!exists) {
        await Group.create({
          name: group.name,
          ageRange: group.ageRange || { min: 3, max: 6 },
          capacity: group.capacity || 20,
          teacherName: group.teacher || group.teacherName,
          monthlyFee: group.monthlyFee || 1500000
        })
      }
    }
    console.log(`  ✓ ${groups.length} guruh`)
    
    // 4. Children
    console.log('👶 Bolalar yuklanmoqda...')
    const children = readJSON('children.json')
    for (const child of children) {
      const exists = await Child.findOne({ 
        firstName: child.firstName,
        lastName: child.lastName 
      })
      if (!exists) {
        await Child.create({
          firstName: child.firstName || child.name?.split(' ')[0] || 'Bola',
          lastName: child.lastName || child.name?.split(' ')[1] || '',
          birthDate: child.birthDate || new Date('2020-01-01'),
          gender: child.gender || 'male',
          groupName: child.groupName || child.group,
          parentName: child.parentName || 'Ota-ona',
          parentPhone: child.parentPhone || '+998901234567',
          points: child.points || 0,
          level: child.level || 1,
          achievements: child.achievements || []
        })
      }
    }
    console.log(`  ✓ ${children.length} bola`)
    
    // 5. Enrollments
    console.log('📝 Arizalar yuklanmoqda...')
    const enrollments = readJSON('enrollments.json')
    for (const enrollment of enrollments) {
      // Status mapping: accepted -> approved
      let status = enrollment.status || 'pending'
      if (status === 'accepted') status = 'approved'
      
      await Enrollment.create({
        childName: enrollment.childName,
        childBirthDate: enrollment.birthDate || new Date(),
        parentName: enrollment.parentName,
        parentPhone: enrollment.parentPhone,
        parentEmail: enrollment.parentEmail,
        status: status,
        message: enrollment.notes || enrollment.message
      })
    }
    console.log(`  ✓ ${enrollments.length} ariza`)
    
    // 6. Events
    console.log('📅 Tadbirlar yuklanmoqda...')
    const events = readJSON('events.json')
    for (const event of events) {
      await Event.create({
        title: event.title,
        date: event.date,
        type: event.type || 'event',
        color: event.color || '#667eea',
        description: event.description
      })
    }
    console.log(`  ✓ ${events.length} tadbir`)
    
    // 7. Blog Posts
    console.log('📰 Blog postlar yuklanmoqda...')
    const posts = readJSON('blog.json')
    for (const post of posts) {
      await BlogPost.create({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        image: post.image || '/images/gallery-1.jpg',
        category: post.category || 'news',
        authorName: post.author || 'Admin',
        isPublished: post.published !== false
      })
    }
    console.log(`  ✓ ${posts.length} post`)
    
    // 8. Achievements
    console.log('🏆 Yutuqlar yuklanmoqda...')
    const achievements = readJSON('achievements.json')
    for (const achievement of achievements) {
      const exists = await Achievement.findOne({ name: achievement.name })
      if (!exists) {
        await Achievement.create({
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon || '🏆',
          category: achievement.category || 'learning',
          points: achievement.points || 10,
          criteria: achievement.criteria
        })
      }
    }
    console.log(`  ✓ ${achievements.length} yutuq`)
    
    console.log('\n✅ Barcha malumotlar muvaffaqiyatli yuklandi!')
    
  } catch (error) {
    console.error('❌ Xato:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 MongoDB dan uzildi')
    process.exit(0)
  }
}

seed()
