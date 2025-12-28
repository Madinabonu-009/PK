import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    // Agar MONGODB_URI mavjud bo'lsa, MongoDB ga ulanish
    if (process.env.MONGODB_URI) {
      const conn = await mongoose.connect(process.env.MONGODB_URI)
      console.log(`✅ MongoDB ulandi: ${conn.connection.host}`)
      return true
    } else {
      console.log('⚠️ MONGODB_URI topilmadi, JSON fayllar ishlatiladi')
      return false
    }
  } catch (error) {
    console.error(`❌ MongoDB ulanish xatosi: ${error.message}`)
    console.log('⚠️ JSON fayllar ishlatiladi')
    return false
  }
}

export default connectDB
