import cron from 'node-cron';
import { 
  sendDailyMenu, 
  sendAttendanceReport, 
  sendWeeklyReport,
  sendAllDebtsReminder 
} from './telegramService.js';
import { backupAllData, cleanOldBackups } from '../utils/backup.js';
import logger from '../utils/logger.js';

// Oxirgi yuborilgan sanalar
let lastMenuDate = null;
let lastAttendanceDate = null;

// Keep-alive ping uchun
const RENDER_URL = process.env.SITE_URL || process.env.RENDER_EXTERNAL_URL || 'https://play-kids.onrender.com';

export const initCronJobs = () => {
  // ============================================
  // KEEP-ALIVE PING - Har 10 daqiqada (Render uyquga ketmasligi uchun)
  // ============================================
  if (process.env.NODE_ENV === 'production') {
    cron.schedule('*/10 * * * *', async () => {
      try {
        const response = await fetch(`${RENDER_URL}/api/health`);
        if (response.ok) {
          console.log('🏓 Keep-alive ping muvaffaqiyatli');
        }
      } catch (error) {
        // Xato bo'lsa ham davom etamiz
        console.log('⚠️ Keep-alive ping:', error.message?.substring(0, 50) || 'xatolik');
      }
    });
    console.log(`   🏓 Keep-alive: har 10 daqiqada (${RENDER_URL})`);
  }

  // ============================================
  // KUNLIK MENYU - Har kuni ertalab 7:30 (Dush-Shan)
  // ============================================
  cron.schedule('0 30 7 * * 1-6', async () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    console.log('⏰ Kunlik menyu yuborish boshlandi:', now.toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' }));
    
    if (lastMenuDate === today) {
      console.log('⚠️ Bugun menyu allaqachon yuborilgan');
      return;
    }
    
    try {
      const result = await sendDailyMenu();
      if (result) {
        lastMenuDate = today;
        console.log('✅ Kunlik menyu muvaffaqiyatli yuborildi');
      } else {
        console.log('❌ Kunlik menyu yuborishda xatolik');
      }
    } catch (error) {
      console.error('❌ Menyu cron job xatolik:', error);
    }
  }, {
    timezone: 'Asia/Tashkent'
  });

  // ============================================
  // KUNLIK DAVOMAT HISOBOTI - Har kuni kechqurun 18:00 (Dush-Shan)
  // ============================================
  cron.schedule('0 0 18 * * 1-6', async () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    console.log('⏰ Kunlik davomat hisoboti yuborish boshlandi:', now.toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' }));
    
    if (lastAttendanceDate === today) {
      console.log('⚠️ Bugun davomat hisoboti allaqachon yuborilgan');
      return;
    }
    
    try {
      const result = await sendAttendanceReport();
      if (result) {
        lastAttendanceDate = today;
        console.log('✅ Kunlik davomat hisoboti muvaffaqiyatli yuborildi');
      } else {
        console.log('❌ Kunlik davomat hisoboti yuborishda xatolik');
      }
    } catch (error) {
      console.error('❌ Davomat cron job xatolik:', error);
    }
  }, {
    timezone: 'Asia/Tashkent'
  });

  // ============================================
  // HAFTALIK HISOBOT - Har juma kuni 17:00 da
  // ============================================
  cron.schedule('0 0 17 * * 5', async () => {
    const now = new Date();
    console.log('⏰ Haftalik hisobot yuborish boshlandi:', now.toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' }));
    
    try {
      const result = await sendWeeklyReport();
      if (result) {
        console.log('✅ Haftalik hisobot muvaffaqiyatli yuborildi');
      } else {
        console.log('❌ Haftalik hisobot yuborishda xatolik');
      }
    } catch (error) {
      console.error('❌ Haftalik hisobot cron job xatolik:', error);
    }
  }, {
    timezone: 'Asia/Tashkent'
  });

  // ============================================
  // QARZDORLIK ESLATMASI - Har oyning 5 va 15 sanasida 10:00 da
  // ============================================
  cron.schedule('0 0 10 5,15 * *', async () => {
    const now = new Date();
    console.log('⏰ Qarzdorlik eslatmasi yuborish boshlandi:', now.toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' }));
    
    try {
      const result = await sendAllDebtsReminder();
      console.log(`✅ Qarzdorlik eslatmasi: ${result.sent}/${result.total} ta yuborildi`);
    } catch (error) {
      console.error('❌ Qarzdorlik eslatmasi cron job xatolik:', error);
    }
  }, {
    timezone: 'Asia/Tashkent'
  });

  // ============================================
  // BACKUP - Har kuni tunda 2:00 da
  // ============================================
  cron.schedule('0 0 2 * * *', async () => {
    logger.info('🔄 Kunlik backup boshlandi');
    try {
      const result = backupAllData();
      logger.info('✅ Backup yakunlandi', result);
      
      // Eski backuplarni tozalash (7 kundan eski)
      cleanOldBackups(7);
    } catch (error) {
      logger.error('❌ Backup xatolik:', { error: error.message });
    }
  }, {
    timezone: 'Asia/Tashkent'
  });

  // Server ishga tushganda hozirgi vaqtni ko'rsatish
  const now = new Date();
  const tashkentTime = now.toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' });
  console.log(`📅 Cron jobs ishga tushirildi`);
  console.log(`   🕐 Hozirgi vaqt (Toshkent): ${tashkentTime}`);
  console.log(`   📨 Menyu: har kuni 7:30 (Dush-Shan)`);
  console.log(`   📊 Davomat: har kuni 18:00 (Dush-Shan)`);
  console.log(`   📈 Haftalik hisobot: har juma 17:00`);
  console.log(`   ⚠️ Qarzdorlik eslatmasi: har oyning 5 va 15 sanasi 10:00`);
  console.log(`   💾 Backup: har kuni 2:00`);
};

// Qo'lda menyu yuborish (test uchun)
export const sendMenuNow = async () => {
  console.log('📤 Qo\'lda menyu yuborish...');
  return await sendDailyMenu();
};

// Qo'lda davomat hisoboti yuborish
export const sendAttendanceNow = async () => {
  console.log('📤 Qo\'lda davomat hisoboti yuborish...');
  return await sendAttendanceReport();
};

// Qo'lda haftalik hisobot yuborish
export const sendWeeklyReportNow = async () => {
  console.log('📤 Qo\'lda haftalik hisobot yuborish...');
  return await sendWeeklyReport();
};

// Qo'lda qarzdorlik eslatmasi yuborish
export const sendDebtsReminderNow = async () => {
  console.log('📤 Qo\'lda qarzdorlik eslatmasi yuborish...');
  return await sendAllDebtsReminder();
};

// Qo'lda backup yaratish
export const createBackupNow = () => {
  logger.info('📤 Qo\'lda backup yaratish...');
  return backupAllData();
};
