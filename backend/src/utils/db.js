import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDir = path.join(__dirname, '../../data')

// Data folder va kerakli fayllarni yaratish (Render disk persistence uchun)
const initializeDataFolder = () => {
  // Data folder mavjudligini tekshirish
  if (!fs.existsSync(dataDir)) {
    console.log('📁 Data folder yaratilmoqda:', dataDir)
    fs.mkdirSync(dataDir, { recursive: true })
  }

  // Kerakli JSON fayllar ro'yxati
  const requiredFiles = [
    'users.json',
    'children.json',
    'groups.json',
    'enrollments.json',
    'attendance.json',
    'payments.json',
    'menu.json',
    'gallery.json',
    'stories.json',
    'feedback.json',
    'events.json',
    'teachers.json',
    'dailyReports.json',
    'debts.json',
    'achievements.json',
    'progress.json',
    'settings.json',
    'questions.json',
    'journal.json',
    'blog.json',
    'curriculum.json',
    'migrations.json'
  ]

  // Default admin user
  const defaultUsers = [
    {
      id: 'admin_1',
      username: 'admin',
      password: '$2a$10$rQnM1.kK8LFmKgGqHqGqXOQz8z8z8z8z8z8z8z8z8z8z8z8z8z8z8', // admin123
      name: 'Administrator',
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ]

  // Har bir fayl uchun tekshirish va yaratish
  requiredFiles.forEach(filename => {
    const filePath = path.join(dataDir, filename)
    if (!fs.existsSync(filePath)) {
      console.log(`📄 ${filename} yaratilmoqda...`)
      // users.json uchun default admin qo'shish
      if (filename === 'users.json') {
        fs.writeFileSync(filePath, JSON.stringify(defaultUsers, null, 2))
      } else {
        fs.writeFileSync(filePath, '[]')
      }
    }
  })

  // Uploads folder
  const uploadsDir = path.join(dataDir, 'uploads')
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
    fs.mkdirSync(path.join(uploadsDir, 'gallery'), { recursive: true })
    fs.mkdirSync(path.join(uploadsDir, 'stories'), { recursive: true })
    fs.mkdirSync(path.join(uploadsDir, 'events'), { recursive: true })
    console.log('📁 Uploads folders yaratildi')
  }

  console.log('✅ Data folder tayyor:', dataDir)
}

// Initialization
initializeDataFolder()

export const readData = (filename) => {
  const filePath = path.join(dataDir, filename)
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ ${filename} mavjud emas, bo'sh array qaytarilmoqda`)
      return []
    }
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading ${filename}:`, error.message)
    return []
  }
}

export const writeData = (filename, data) => {
  const filePath = path.join(dataDir, filename)
  try {
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error(`Error writing ${filename}:`, error.message)
    return false
  }
}
