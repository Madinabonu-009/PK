import cron from 'node-cron';
import { getAllUsers, getTodayMenu, getChildByParentPhone, getDailyReportByChild } from './db.service.js';
import { t } from '../i18n/index.js';
import { logger } from '../utils/logger.js';

const dayNames = {
  uz: {
    sunday: 'Yakshanba', monday: 'Dushanba', tuesday: 'Seshanba',
    wednesday: 'Chorshanba', thursday: 'Payshanba', friday: 'Juma', saturday: 'Shanba'
  }
};

// Menyu xabarini formatlash
const formatMenuMessage = (dayMenu, dayName) => {
  if (!dayMenu) return null;
  
  let text = `🍽️ *BUGUNGI MENYU*\n`;
  text += `📅 ${dayName}\n`;
  text += `━━━━━━━━━━━━━━━━━━\n\n`;
  
  if (dayMenu.breakfast?.name) {
    text += `🥣 *Nonushta* (08:30)\n${dayMenu.breakfast.name}\n\n`;
  }
  if (dayMenu.lunch?.name) {
    text += `🍲 *Tushlik* (12:30)\n${dayMenu.lunch.name}\n\n`;
  }
  if (dayMenu.snack?.name) {
    text += `🥛 *Poldnik* (15:30)\n${dayMenu.snack.name}\n`;
  }
  
  text += `\n━━━━━━━━━━━━━━━━━━\n`;
  text += `🏫 *Play Kids Bog'chasi*`;
  
  return text;
};

// Barcha foydalanuvchilarga menyu yuborish
const sendDailyMenuToAll = async (bot) => {
  try {
    const todayData = await getTodayMenu();
    if (!todayData || !todayData.menu) {
      logger.info('Bugungi menyu topilmadi');
      return;
    }
    
    const dayName = dayNames.uz[todayData.day] || todayData.day;
    const message = formatMenuMessage(todayData.menu, dayName);
    
    if (!message) {
      logger.info('Menyu xabari yaratilmadi');
      return;
    }
    
    const users = getAllUsers();
    let sent = 0, failed = 0;
    
    for (const user of users) {
      if (!user.telegramId) continue;
      
      try {
        await bot.telegram.sendMessage(user.telegramId, message, { parse_mode: 'Markdown' });
        sent++;
        // Rate limit uchun kichik kutish
        await new Promise(r => setTimeout(r, 100));
      } catch (error) {
        failed++;
        logger.error(`Xabar yuborishda xatolik (${user.telegramId}):`, error.message);
      }
    }
    
    logger.info(`Kunlik menyu yuborildi: ${sent} ta muvaffaqiyatli, ${failed} ta xato`);
  } catch (error) {
    logger.error('Kunlik menyu yuborishda xatolik:', error);
  }
};

// Kunlik hisobot yuborish (kechqurun)
const sendDailyReportsToAll = async (bot) => {
  try {
    const users = getAllUsers();
    const today = new Date().toISOString().split('T')[0];
    let sent = 0;
    
    for (const user of users) {
      if (!user.telegramId || !user.phone) continue;
      
      try {
        const child = await getChildByParentPhone(user.phone);
        if (!child) continue;
        
        const report = await getDailyReportByChild(child.id, today);
        if (!report) continue;
        
        let text = `📋 *KUNLIK HISOBOT*\n`;
        text += `👶 ${child.firstName} ${child.lastName}\n`;
        text += `📅 ${today}\n`;
        text += `━━━━━━━━━━━━━━━━━━\n\n`;
        
        if (report.mood) text += `😊 Kayfiyat: ${report.mood}\n`;
        if (report.meals) text += `🍽️ Ovqatlanish: ${report.meals}\n`;
        if (report.sleep) text += `😴 Uyqu: ${report.sleep}\n`;
        if (report.activities) text += `🎨 Mashg'ulotlar: ${report.activities}\n`;
        if (report.notes) text += `\n📝 Izoh: ${report.notes}\n`;
        
        text += `\n━━━━━━━━━━━━━━━━━━\n`;
        text += `🏫 *Play Kids Bog'chasi*`;
        
        await bot.telegram.sendMessage(user.telegramId, text, { parse_mode: 'Markdown' });
        sent++;
        await new Promise(r => setTimeout(r, 100));
      } catch (error) {
        logger.error(`Hisobot yuborishda xatolik (${user.telegramId}):`, error.message);
      }
    }
    
    logger.info(`Kunlik hisobotlar yuborildi: ${sent} ta`);
  } catch (error) {
    logger.error('Kunlik hisobotlar yuborishda xatolik:', error);
  }
};

export const initCronJobs = (bot) => {
  // Har kuni 07:30 da menyu yuborish (Dushanba-Shanba)
  cron.schedule('30 7 * * 1-6', () => {
    logger.info('⏰ Kunlik menyu yuborish boshlandi');
    sendDailyMenuToAll(bot);
  }, { timezone: 'Asia/Tashkent' });
  
  // Har kuni 17:00 da kunlik hisobot yuborish (Dushanba-Juma)
  cron.schedule('0 17 * * 1-5', () => {
    logger.info('⏰ Kunlik hisobotlar yuborish boshlandi');
    sendDailyReportsToAll(bot);
  }, { timezone: 'Asia/Tashkent' });
  
  const now = new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' });
  logger.info(`📅 Cron jobs ishga tushirildi (${now})`);
  console.log(`📅 Cron jobs sozlandi:`);
  console.log(`   🍽️ Menyu: Har kuni 07:30 (Dush-Shan)`);
  console.log(`   📋 Hisobot: Har kuni 17:00 (Dush-Jum)`);
};

// Test uchun qo'lda yuborish
export const sendMenuNow = (bot) => sendDailyMenuToAll(bot);
export const sendReportsNow = (bot) => sendDailyReportsToAll(bot);

export default { initCronJobs, sendMenuNow, sendReportsNow };
