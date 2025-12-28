/**
 * MongoDB Index Creation Script
 * Issue #27: Database indexing for better query performance
 * 
 * Run: node src/scripts/createIndexes.js
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/play-kids'

async function createIndexes() {
  try {
    console.log('🔗 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    const db = mongoose.connection.db

    // Children collection indexes
    console.log('\n📚 Creating indexes for children collection...')
    await db.collection('children').createIndexes([
      { key: { groupId: 1 }, name: 'idx_children_groupId' },
      { key: { firstName: 1, lastName: 1 }, name: 'idx_children_name' },
      { key: { parentEmail: 1 }, name: 'idx_children_parentEmail' },
      { key: { parentPhone: 1 }, name: 'idx_children_parentPhone' },
      { key: { createdAt: -1 }, name: 'idx_children_createdAt' },
      { key: { isActive: 1 }, name: 'idx_children_isActive' },
      { 
        key: { firstName: 'text', lastName: 'text' }, 
        name: 'idx_children_text_search',
        default_language: 'none'
      }
    ])
    console.log('✅ Children indexes created')

    // Users collection indexes
    console.log('\n📚 Creating indexes for users collection...')
    await db.collection('users').createIndexes([
      { key: { email: 1 }, name: 'idx_users_email', unique: true },
      { key: { role: 1 }, name: 'idx_users_role' },
      { key: { createdAt: -1 }, name: 'idx_users_createdAt' }
    ])
    console.log('✅ Users indexes created')

    // Groups collection indexes
    console.log('\n📚 Creating indexes for groups collection...')
    await db.collection('groups').createIndexes([
      { key: { name: 1 }, name: 'idx_groups_name' },
      { key: { teacherId: 1 }, name: 'idx_groups_teacherId' },
      { key: { isActive: 1 }, name: 'idx_groups_isActive' }
    ])
    console.log('✅ Groups indexes created')

    // Payments collection indexes
    console.log('\n📚 Creating indexes for payments collection...')
    await db.collection('payments').createIndexes([
      { key: { childId: 1 }, name: 'idx_payments_childId' },
      { key: { status: 1 }, name: 'idx_payments_status' },
      { key: { paymentDate: -1 }, name: 'idx_payments_date' },
      { key: { month: 1, year: 1 }, name: 'idx_payments_period' },
      { key: { createdAt: -1 }, name: 'idx_payments_createdAt' }
    ])
    console.log('✅ Payments indexes created')

    // Attendance collection indexes
    console.log('\n📚 Creating indexes for attendance collection...')
    await db.collection('attendance').createIndexes([
      { key: { childId: 1, date: 1 }, name: 'idx_attendance_child_date', unique: true },
      { key: { groupId: 1, date: 1 }, name: 'idx_attendance_group_date' },
      { key: { date: -1 }, name: 'idx_attendance_date' },
      { key: { status: 1 }, name: 'idx_attendance_status' }
    ])
    console.log('✅ Attendance indexes created')

    // Game Progress collection indexes
    console.log('\n📚 Creating indexes for gameprogress collection...')
    await db.collection('gameprogress').createIndexes([
      { key: { childId: 1 }, name: 'idx_gameprogress_childId' },
      { key: { gameType: 1 }, name: 'idx_gameprogress_gameType' },
      { key: { childId: 1, gameType: 1 }, name: 'idx_gameprogress_child_game' },
      { key: { playedAt: -1 }, name: 'idx_gameprogress_playedAt' },
      { key: { score: -1 }, name: 'idx_gameprogress_score' }
    ])
    console.log('✅ Game Progress indexes created')

    // Menu collection indexes
    console.log('\n📚 Creating indexes for menu collection...')
    await db.collection('menu').createIndexes([
      { key: { date: 1 }, name: 'idx_menu_date', unique: true },
      { key: { createdAt: -1 }, name: 'idx_menu_createdAt' }
    ])
    console.log('✅ Menu indexes created')

    // Enrollments collection indexes
    console.log('\n📚 Creating indexes for enrollments collection...')
    await db.collection('enrollments').createIndexes([
      { key: { status: 1 }, name: 'idx_enrollments_status' },
      { key: { parentEmail: 1 }, name: 'idx_enrollments_email' },
      { key: { createdAt: -1 }, name: 'idx_enrollments_createdAt' }
    ])
    console.log('✅ Enrollments indexes created')

    // Notifications collection indexes
    console.log('\n📚 Creating indexes for notifications collection...')
    await db.collection('notifications').createIndexes([
      { key: { userId: 1, read: 1 }, name: 'idx_notifications_user_read' },
      { key: { createdAt: -1 }, name: 'idx_notifications_createdAt' },
      { key: { type: 1 }, name: 'idx_notifications_type' }
    ])
    console.log('✅ Notifications indexes created')

    console.log('\n🎉 All indexes created successfully!')
    
    // List all indexes
    console.log('\n📋 Current indexes:')
    const collections = await db.listCollections().toArray()
    for (const col of collections) {
      const indexes = await db.collection(col.name).indexes()
      console.log(`\n${col.name}:`)
      indexes.forEach(idx => {
        console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`)
      })
    }

  } catch (error) {
    console.error('❌ Error creating indexes:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from MongoDB')
  }
}

createIndexes()
