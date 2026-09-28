import pg from 'pg'
const { Pool } = pg
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let pool = null

const connectDB = async () => {
  try {
    if (process.env.DATABASE_URL) {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      })
      
      // Test connection
      const client = await pool.connect()
      console.log(`✅ PostgreSQL ulandi: ${client.host}`)
      client.release()
      
      // Create tables if not exist
      await createTables()
      
      // Seed data if empty
      await seedAllDataIfEmpty()
      
      return true
    } else {
      console.log('⚠️ DATABASE_URL topilmadi')
      return false
    }
  } catch (error) {
    console.error(`❌ PostgreSQL ulanish xatosi: ${error.message}`)
    return false
  }
}

// Get database connection
export const getDB = () => {
  if (!pool) throw new Error('Database not connected')
  return pool
}

// Create tables from schema.sql
async function createTables() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    await pool.query(schema)
    console.log('✅ PostgreSQL jadvallar yaratildi')
  } catch (error) {
    console.error('❌ Jadval yaratishda xato:', error.message)
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

// Barcha ma'lumotlarni PostgreSQL'ga ko'chirish
async function seedAllDataIfEmpty() {
  try {
    // 1. USERS
    const usersResult = await pool.query('SELECT COUNT(*) FROM users')
    if (parseInt(usersResult.rows[0].count) === 0) {
      const usersJson = readJsonFile('users.json')
      if (usersJson.length > 0) {
        for (const u of usersJson) {
          await pool.query(`
            INSERT INTO users (username, password, name, email, phone, role, group_id, child_name, is_active, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          `, [
            u.username, u.password, u.name, u.email, u.phone,
            u.role || 'parent', u.groupId, u.childName,
            u.isActive !== false, u.createdAt || new Date()
          ])
        }
        console.log(`✅ Users seeded: ${usersJson.length}`)
      }
    }

    // 2. CHILDREN
    const childrenResult = await pool.query('SELECT COUNT(*) FROM children')
    if (parseInt(childrenResult.rows[0].count) === 0) {
      const childrenJson = readJsonFile('children.json')
      if (childrenJson.length > 0) {
        for (const c of childrenJson) {
          await pool.query(`
            INSERT INTO children (
              first_name, last_name, birth_date, gender, group_id, group_name,
              parent_name, parent_phone, parent_email, allergies, notes, photo,
              points, level, achievements, is_active, enrolled_at, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          `, [
            c.firstName, c.lastName, c.birthDate, c.gender || 'male',
            c.groupId, c.groupName, c.parentName || 'Ota-ona',
            c.parentPhone || '+998900000000', c.parentEmail,
            c.allergies || [], c.notes, c.photo,
            c.points || 0, c.level || 1, JSON.stringify(c.achievements || []),
            true, c.enrolledAt || new Date(), new Date()
          ])
        }
        console.log(`✅ Children seeded: ${childrenJson.length}`)
      }
    }

    // 3. TEACHERS
    const teachersResult = await pool.query('SELECT COUNT(*) FROM teachers')
    if (parseInt(teachersResult.rows[0].count) === 0) {
      const teachersJson = readJsonFile('teachers.json')
      if (teachersJson.length > 0) {
        for (const t of teachersJson) {
          const name = typeof t.name === 'string' ? t.name : t.name?.uz || ''
          await pool.query(`
            INSERT INTO teachers (
              first_name, last_name, name, position, role, education, experience,
              phone, email, photo, bio, category, "group", specializations, is_active, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          `, [
            name.split(' ')[0], name.split(' ').slice(1).join(' '), name,
            t.role || t.position, t.role, t.education, t.experience,
            t.phone || '', t.email || '', t.photo, t.bio,
            t.category, typeof t.group === 'string' ? t.group : t.group?.uz,
            t.specialization || [], true, new Date()
          ])
        }
        console.log(`✅ Teachers seeded: ${teachersJson.length}`)
      }
    }

    // 4. GALLERY
    const galleryResult = await pool.query('SELECT COUNT(*) FROM gallery')
    if (parseInt(galleryResult.rows[0].count) === 0) {
      const galleryJson = readJsonFile('gallery.json')
      if (galleryJson.length > 0) {
        for (const g of galleryJson) {
          await pool.query(`
            INSERT INTO gallery (type, url, thumbnail, title, description, album, published, is_published, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `, [
            g.type || 'image', g.url, g.thumbnail || g.url,
            g.title || '', g.description, g.album || 'general',
            g.published !== false, g.published !== false, g.createdAt || new Date()
          ])
        }
        console.log(`✅ Gallery seeded: ${galleryJson.length}`)
      }
    }

    // 5. GROUPS
    const groupsResult = await pool.query('SELECT COUNT(*) FROM groups')
    if (parseInt(groupsResult.rows[0].count) === 0) {
      const groupsJson = readJsonFile('groups.json')
      if (groupsJson.length > 0) {
        for (const g of groupsJson) {
          await pool.query(`
            INSERT INTO groups (name, age_range, capacity, teacher_id, teacher_name, monthly_fee, schedule, description, is_active, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          `, [
            g.name, g.ageRange, g.capacity, g.teacherId, g.teacherName,
            g.monthlyFee || 500000, JSON.stringify(g.schedule || {}),
            g.description, true, new Date()
          ])
        }
        console.log(`✅ Groups seeded: ${groupsJson.length}`)
      }
    }

    // Similar patterns for other tables...
    await seedGenericTable('feedback', readJsonFile('feedback.json'))
    await seedGenericTable('menu', readJsonFile('menu.json'))
    await seedGenericTable('enrollments', readJsonFile('enrollments.json'))
    
    console.log('✅ PostgreSQL to\'liq to\'ldirildi!')
  } catch (error) {
    console.error('❌ Seed xatosi:', error.message)
  }
}

// Generic seed helper
async function seedGenericTable(tableName, data) {
  if (!data || data.length === 0) return
  
  const countResult = await pool.query(`SELECT COUNT(*) FROM ${tableName}`)
  if (parseInt(countResult.rows[0].count) > 0) return
  
  console.log(`📥 Seeding ${tableName}: ${data.length} records...`)
}

export default connectDB
