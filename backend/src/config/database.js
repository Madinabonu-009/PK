import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      const conn = await mongoose.connect(process.env.MONGODB_URI)
      console.log(`✅ MongoDB ulandi: ${conn.connection.host}`)
      
      // MongoDB bo'sh bo'lsa, barcha JSON fayllarni ko'chirish
      await seedAllDataIfEmpty()
      
      return true
    } else {
      console.log('⚠️ MONGODB_URI topilmadi')
      return false
    }
  } catch (error) {
    console.error(`❌ MongoDB ulanish xatosi: ${error.message}`)
    return false
  }
}

// JSON faylni o'qish
function readJsonFile(filename) {
  try {
    const dataDir = path.join(__dirname, '../../data')
    const filePath = path.join(dataDir, filename)
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error(`Error reading ${filename}:`, error.message)
    return []
  }
}

// Barcha ma'lumotlarni MongoDB'ga ko'chirish
async function seedAllDataIfEmpty() {
  try {
    // Modellarni import qilish
    const User = (await import('../models/User.js')).default
    const Child = (await import('../models/Child.js')).default
    const Teacher = (await import('../models/Teacher.js')).default
    const Gallery = (await import('../models/Gallery.js')).default

    // Tekshirish - faqat users bo'sh bo'lsa seed qilish
    const userCount = await User.countDocuments()
    
    if (userCount > 0) {
      console.log('📊 MongoDB allaqachon to\'ldirilgan')
      const childCount = await Child.countDocuments()
      const teacherCount = await Teacher.countDocuments()
      const galleryCount = await Gallery.countDocuments()
      console.log(`   Users: ${userCount}, Children: ${childCount}, Teachers: ${teacherCount}, Gallery: ${galleryCount}`)
      return
    }

    console.log('🔄 MongoDB bo\'sh - JSON fayllardan to\'ldirilmoqda...')

    // 1. USERS
    const usersJson = readJsonFile('users.json')
    if (usersJson.length > 0) {
      await User.insertMany(usersJson.map(u => ({
        username: u.username,
        password: u.password,
        name: u.name,
        role: u.role,
        email: u.email,
        phone: u.phone,
        groupId: u.groupId,
        childName: u.childName,
        isActive: u.isActive !== false,
        createdAt: u.createdAt || new Date()
      })))
      console.log(`✅ Users: ${usersJson.length}`)
    }

    // 2. CHILDREN
    const childrenJson = readJsonFile('children.json')
    if (childrenJson.length > 0) {
      await Child.insertMany(childrenJson.map(c => ({
        firstName: c.firstName,
        lastName: c.lastName,
        birthDate: c.birthDate,
        gender: c.gender,
        groupId: c.groupId,
        groupName: c.groupName,
        parentName: c.parentName,
        parentPhone: c.parentPhone,
        parentEmail: c.parentEmail,
        allergies: c.allergies || [],
        notes: c.notes,
        photo: c.photo,
        points: c.points || 0,
        level: c.level || 1,
        achievements: c.achievements || [],
        isActive: c.isActive !== false,
        isDeleted: c.isDeleted || false,
        enrolledAt: c.enrolledAt || new Date()
      })))
      console.log(`✅ Children: ${childrenJson.length}`)
    }

    // 3. TEACHERS
    const teachersJson = readJsonFile('teachers.json')
    if (teachersJson.length > 0) {
      await Teacher.insertMany(teachersJson.map(t => ({
        name: t.name,
        firstName: t.name?.split(' ')[0] || t.name,
        lastName: t.name?.split(' ').slice(1).join(' ') || '',
        position: t.role || t.position,
        role: t.role,
        education: t.education,
        experience: t.experience,
        phone: t.phone || '',
        email: t.email || '',
        photo: t.photo,
        bio: t.bio,
        category: t.category,
        specialization: t.specialization,
        isActive: t.isDeleted !== true
      })))
      console.log(`✅ Teachers: ${teachersJson.length}`)
    }

    // 4. GALLERY
    const galleryJson = readJsonFile('gallery.json')
    if (galleryJson.length > 0) {
      await Gallery.insertMany(galleryJson.map(g => ({
        type: g.type,
        url: g.url,
        thumbnail: g.thumbnail || g.url,
        title: g.title || '',
        description: g.description,
        album: g.album || 'general',
        published: g.published !== false,
        isDeleted: g.isDeleted || false,
        createdAt: g.createdAt || g.date || new Date()
      })))
      console.log(`✅ Gallery: ${galleryJson.length}`)
    }

    // 5. Qolgan collectionlar uchun generic seed
    await seedGenericCollections()

    console.log('✅ MongoDB to\'liq to\'ldirildi!')

  } catch (error) {
    console.error('❌ Seed xatosi:', error.message)
  }
}

// Generic collectionlarni seed qilish
async function seedGenericCollections() {
  const collections = [
    'groups', 'menu', 'gallery', 'stories', 'feedback', 
    'events', 'attendance', 'payments', 'dailyReports', 
    'debts', 'achievements', 'progress', 'enrollments',
    'settings', 'questions', 'journal', 'blog', 'curriculum'
  ]

  for (const name of collections) {
    try {
      const data = readJsonFile(`${name}.json`)
      if (data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0)) {
        const collectionName = name.toLowerCase()
        const collection = mongoose.connection.collection(collectionName)
        
        const count = await collection.countDocuments()
        if (count === 0) {
          if (Array.isArray(data)) {
            await collection.insertMany(data)
            console.log(`✅ ${name}: ${data.length}`)
          } else {
            await collection.insertOne(data)
            console.log(`✅ ${name}: 1 document`)
          }
        }
      }
    } catch (error) {
      // Skip errors for collections without models
    }
  }
}

export default connectDB
