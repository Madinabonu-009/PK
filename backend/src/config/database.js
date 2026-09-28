import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let isConnected = false

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL
    
    if (!mongoUri) {
      console.log('⚠️ MONGODB_URI topilmadi')
      return false
    }

    // Agar allaqachon ulangan bo'lsa
    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB allaqachon ulangan')
      return true
    }

    // MongoDB ulanish sozlamalari
    const options = {
      serverSelectionTimeoutMS: 30000, // 30 sekund timeout
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      retryReads: true,
      w: 'majority',
    }

    // MongoDB'ga ulanish
    await mongoose.connect(mongoUri, options)
    
    isConnected = true
    console.log(`✅ MongoDB ulandi: ${mongoose.connection.host}`)
    console.log(`📦 Database: ${mongoose.connection.name}`)
    
    // Connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB xatosi:', err.message)
      isConnected = false
    })
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB uzildi')
      isConnected = false
    })
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB qayta ulandi')
      isConnected = true
    })

    // Seed data if collections are empty
    await seedAllDataIfEmpty()
    
    return true
  } catch (error) {
    console.error(`❌ MongoDB ulanish xatosi: ${error.message}`)
    isConnected = false
    return false
  }
}

// Get database connection
export const getDB = () => {
  if (!isConnected || mongoose.connection.readyState !== 1) {
    throw new Error('Database not connected')
  }
  return mongoose.connection.db
}

// Check if MongoDB is connected
export const isDBConnected = () => isConnected && mongoose.connection.readyState === 1

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

    // Har bir collectionni alohida tekshirish va to'ldirish
    const userCount = await User.countDocuments()
    const childCount = await Child.countDocuments()
    const teacherCount = await Teacher.countDocuments()
    const galleryCount = await Gallery.countDocuments()
    
    console.log(`📊 MongoDB: Users: ${userCount}, Children: ${childCount}, Teachers: ${teacherCount}, Gallery: ${galleryCount}`)

    // 1. USERS
    if (userCount === 0) {
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
        console.log(`✅ Users seeded: ${usersJson.length}`)
      }
    }

    // 2. CHILDREN - validation o'chirilgan
    if (childCount === 0) {
      const childrenJson = readJsonFile('children.json')
      if (childrenJson.length > 0) {
        const childrenCollection = mongoose.connection.collection('children')
        await childrenCollection.insertMany(childrenJson.map(c => ({
          id: c.id,
          firstName: c.firstName,
          lastName: c.lastName,
          birthDate: c.birthDate ? new Date(c.birthDate) : new Date(),
          gender: c.gender || 'male',
          groupId: c.groupId,
          groupName: c.groupName,
          parentName: c.parentName || 'Ota-ona',
          parentPhone: c.parentPhone || '+998900000000',
          parentEmail: c.parentEmail,
          allergies: c.allergies || [],
          notes: c.notes,
          photo: c.photo,
          points: c.points || 0,
          level: c.level || 1,
          achievements: c.achievements || [],
          isActive: true,
          isDeleted: false,
          enrolledAt: c.enrolledAt ? new Date(c.enrolledAt) : new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        })))
        console.log(`✅ Children seeded: ${childrenJson.length}`)
      }
    }

    // 3. TEACHERS - validation o'chirilgan
    if (teacherCount === 0) {
      const teachersJson = readJsonFile('teachers.json')
      if (teachersJson.length > 0) {
        const teachersCollection = mongoose.connection.collection('teachers')
        await teachersCollection.insertMany(teachersJson.map(t => ({
          id: t.id,
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
          group: t.group,
          specialization: t.specialization,
          isActive: true,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date()
        })))
        console.log(`✅ Teachers seeded: ${teachersJson.length}`)
      }
    }

    // 4. GALLERY - validation o'chirilgan
    if (galleryCount === 0) {
      const galleryJson = readJsonFile('gallery.json')
      if (galleryJson.length > 0) {
        const galleryCollection = mongoose.connection.collection('galleries')
        await galleryCollection.insertMany(galleryJson.map(g => ({
          type: g.type || 'image',
          url: g.url,
          thumbnail: g.thumbnail || g.url,
          title: g.title || '',
          description: g.description,
          album: g.album || 'general',
          published: g.published !== false,
          isDeleted: g.isDeleted || false,
          createdAt: g.createdAt ? new Date(g.createdAt) : new Date(),
          updatedAt: new Date()
        })))
        console.log(`✅ Gallery seeded: ${galleryJson.length}`)
      }
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
    'groups', 'menu', 'stories', 'feedback', 
    'events', 'attendance', 'payments', 'dailyReports', 
    'debts', 'achievements', 'progress', 'enrollments',
    'settings', 'questions', 'journal', 'blog', 'curriculum',
    'gameprogress'
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
            // Ma'lumotlarni tozalash va createdAt qo'shish
            const cleanedData = data.map(item => ({
              ...item,
              createdAt: item.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }))
            await collection.insertMany(cleanedData)
            console.log(`✅ ${name}: ${data.length}`)
          } else {
            await collection.insertOne({
              ...data,
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString()
            })
            console.log(`✅ ${name}: 1 document`)
          }
        }
      }
    } catch (error) {
      console.error(`⚠️ ${name} seed xatosi:`, error.message)
    }
  }
}

export default connectDB
