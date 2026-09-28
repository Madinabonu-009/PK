import mongoose from 'mongoose';
import { sendDailyMenu, sendTelegramMessage } from './src/services/telegramService.js';
import dotenv from 'dotenv';

// .env faylni yuklash
dotenv.config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

async function testTelegram() {
  try {
    console.log('🚀 Telegram bot test boshlanmoqda...\n');

    // 1. Environment variables tekshirish
    console.log('📋 Environment variables:');
    console.log('- BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? '✅ Mavjud' : '❌ Yo\'q');
    console.log('- CHAT_ID:', process.env.TELEGRAM_CHAT_ID ? '✅ Mavjud' : '❌ Yo\'q');
    console.log('- MONGODB_URI:', process.env.MONGODB_URI ? '✅ Mavjud' : '❌ Yo\'q');
    console.log();

    // 2. MongoDB'ga ulanish
    console.log('📡 MongoDB ulanmoqda...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB ulandi\n');

    // 3. Menu'ni tekshirish
    console.log('📄 Menu tekshirilmoqda...');
    const menu = await mongoose.connection.collection('menu').findOne({});
    console.log('- Menu topildimi?', menu ? '✅ Ha' : '❌ Yo\'q');
    console.log('- menu.days mavjudmi?', menu?.days ? '✅ Ha' : '❌ Yo\'q');
    if (menu?.days) {
      const today = new Date().getDay();
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const todayName = dayNames[today];
      console.log('- Bugungi kun:', todayName);
      console.log('- Bugungi menyu mavjudmi?', menu.days[todayName] ? '✅ Ha' : '❌ Yo\'q');
    }
    console.log();

    // 4. Oddiy xabar yuborish (test)
    console.log('📤 Test xabar yuborilmoqda...');
    const testResult = await sendTelegramMessage('🧪 <b>Test</b>\n\nPlay Kids bot ishlayapti! ✅');
    console.log('Test xabar:', testResult ? '✅ Yuborildi' : '❌ Xatolik');
    console.log();

    // 5. Menyu yuborish
    console.log('🍽️ Menyu yuborilmoqda...');
    const menuResult = await sendDailyMenu();
    console.log('Menyu:', menuResult ? '✅ Yuborildi' : '❌ Xatolik');
    console.log();

    console.log('✨ Test yakunlandi!');
    
  } catch (error) {
    console.error('❌ Xatolik:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 MongoDB ulanish yopildi');
  }
}

testTelegram();
