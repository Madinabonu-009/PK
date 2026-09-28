import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://nozazokirova2_db_user:Mdindin2009@cluster0.u9jgd6o.mongodb.net/playkids?retryWrites=true&w=majority&appName=Cluster0';

async function updateMenu() {
  try {
    console.log('📡 MongoDB ulanmoqda...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB ulandi\n');

    // menu.json faylni o'qish
    const menuPath = path.join(__dirname, 'data', 'menu.json');
    const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf8'));
    
    console.log('📄 menu.json o\'qildi');
    console.log('Menu tuzilishi:', Object.keys(menuData));

    // Mavjud menu'ni o'chirish
    await mongoose.connection.collection('menu').deleteMany({});
    console.log('🗑️ Eski menu o\'chirildi');

    // Yangi menu'ni qo'shish
    await mongoose.connection.collection('menu').insertOne(menuData);
    console.log('✅ Yangi menu qo\'shildi\n');

    // Tekshirish
    const savedMenu = await mongoose.connection.collection('menu').findOne({});
    console.log('📊 Saqlangan menu:');
    console.log('- days mavjudmi?', !!savedMenu.days);
    console.log('- Kunlar:', savedMenu.days ? Object.keys(savedMenu.days) : 'yo\'q');

    console.log('\n✨ Menu muvaffaqiyatli yangilandi!');
    
  } catch (error) {
    console.error('❌ Xatolik:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 MongoDB ulanish yopildi');
  }
}

updateMenu();
