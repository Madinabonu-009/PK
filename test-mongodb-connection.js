// Backend'dan mongoose import qilish uchun
const mongoose = await import('./backend/node_modules/mongoose/index.js')

const MONGODB_URI = 'mongodb+srv://Mdindin:Mdindin2009@cluster0.ne3n1dj.mongodb.net/playkids?retryWrites=true&w=majority'

async function testConnection() {
  console.log('🔍 MongoDB ulanishini tekshiryapmiz...')
  console.log('📍 URI:', MONGODB_URI.replace(/:[^:@]+@/, ':***@'))
  
  try {
    const options = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 15000,
    }
    
    console.log('\n⏳ Ulanmoqda...')
    await mongoose.connect(MONGODB_URI, options)
    
    console.log('\n✅ MongoDB ulanish MUVAFFAQIYATLI!')
    console.log(`📦 Host: ${mongoose.connection.host}`)
    console.log(`🗄️  Database: ${mongoose.connection.name}`)
    console.log(`🔗 State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected'}`)
    
    // Collections sanash
    const db = mongoose.connection.db
    const collections = await db.listCollections().toArray()
    console.log(`\n📊 Collections soni: ${collections.length}`)
    if (collections.length > 0) {
      console.log('📋 Collections:')
      for (const col of collections.slice(0, 10)) {
        const count = await db.collection(col.name).countDocuments()
        console.log(`   - ${col.name}: ${count} documents`)
      }
    }
    
    await mongoose.disconnect()
    console.log('\n✅ Test tugadi - Ulanish ishlayapti!')
    process.exit(0)
    
  } catch (error) {
    console.error('\n❌ XATO:', error.message)
    
    if (error.message.includes('ENOTFOUND')) {
      console.error('\n💡 Sabab: Internet yoki DNS muammosi')
    } else if (error.message.includes('authentication failed')) {
      console.error('\n💡 Sabab: Username yoki password noto\'g\'ri')
    } else if (error.message.includes('timed out')) {
      console.error('\n💡 Sabab: IP whitelist sozlanmagan yoki cluster paused')
      console.error('   1. MongoDB Atlas ga kiring: https://cloud.mongodb.com')
      console.error('   2. Network Access → IP Access List')
      console.error('   3. 0.0.0.0/0 qo\'shing (Allow from Anywhere)')
    }
    
    process.exit(1)
  }
}

testConnection()
