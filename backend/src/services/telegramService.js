import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const dayNames = {
  0: { uz: 'Yakshanba', en: 'sunday' },
  1: { uz: 'Dushanba', en: 'monday' },
  2: { uz: 'Seshanba', en: 'tuesday' },
  3: { uz: 'Chorshanba', en: 'wednesday' },
  4: { uz: 'Payshanba', en: 'thursday' },
  5: { uz: 'Juma', en: 'friday' },
  6: { uz: 'Shanba', en: 'saturday' }
};

// ============================================
// ASOSIY FUNKSIYALAR
// ============================================

export const sendTelegramMessage = async (message, chatId = TELEGRAM_CHAT_ID) => {
  if (!TELEGRAM_BOT_TOKEN || !chatId) {
    console.error('Telegram bot token yoki chat ID topilmadi');
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    });
    console.log('✅ Telegram xabar yuborildi');
    return response.data.ok;
  } catch (error) {
    console.error('❌ Telegram xabar yuborishda xatolik:', error.response?.data || error.message);
    return false;
  }
};

// ============================================
// MENYU FUNKSIYALARI
// ============================================

export const getMenuData = () => {
  try {
    const menuPath = path.join(__dirname, '../../data/menu.json');
    const data = fs.readFileSync(menuPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Menu faylini o\'qishda xatolik:', error);
    return null;
  }
};

export const formatDailyMenu = (dayKey, dayNameUz, menuData) => {
  const dayMenu = menuData[dayKey];
  if (!dayMenu) return null;

  const today = new Date();
  const dateStr = today.toLocaleDateString('uz-UZ', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  let message = `🍽️ *BUGUNGI MENYU*\n`;
  message += `📅 ${dateStr} - ${dayNameUz}\n`;
  message += `━━━━━━━━━━━━━━━━━━\n\n`;

  if (dayMenu.breakfast) {
    message += `🥣 *Nonushta* (08:30)\n`;
    message += `   ${dayMenu.breakfast.name}\n\n`;
  }

  if (dayMenu.lunch) {
    message += `🍲 *Tushlik* (12:30)\n`;
    message += `   ${dayMenu.lunch.name}\n\n`;
  }

  if (dayMenu.snack) {
    message += `🥛 *Poldnik* (15:30)\n`;
    message += `   ${dayMenu.snack.name}\n\n`;
  }

  message += `━━━━━━━━━━━━━━━━━━\n`;
  message += `🏫 *Play Kids Bog'chasi*\n`;
  message += `📍 G'ijduvon, Abdulla Qahhor MFY`;

  return message;
};

export const sendDailyMenu = async () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  if (dayOfWeek === 0) {
    console.log('Yakshanba - menyu yuborilmaydi');
    return false;
  }

  const dayInfo = dayNames[dayOfWeek];
  const menuData = getMenuData();
  
  if (!menuData) {
    console.error('Menu ma\'lumotlari topilmadi');
    return false;
  }

  const message = formatDailyMenu(dayInfo.en, dayInfo.uz, menuData);
  
  if (!message) {
    console.error('Bugungi menyu topilmadi');
    return false;
  }

  return await sendTelegramMessage(message);
};

// ============================================
// QARZDORLIK FUNKSIYALARI
// ============================================

export const sendDebtReminder = async (child, debt) => {
  const remaining = debt.amount - (debt.paidAmount || 0);
  const dueDate = new Date(debt.dueDate);
  const today = new Date();
  const daysOverdue = Math.max(0, Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)));
  
  const message = `⚠️ *TO'LOV ESLATMASI*\n\n` +
    `👶 *Bola:* ${child.firstName} ${child.lastName}\n` +
    `📅 *Oy:* ${debt.month}\n` +
    `💰 *Qarz:* ${remaining.toLocaleString()} so'm\n` +
    `📆 *Muddati:* ${debt.dueDate}\n` +
    `${daysOverdue > 0 ? `⏰ *Kechikish:* ${daysOverdue} kun\n` : ''}` +
    `\n💳 *To'lov usullari:*\n` +
    `• Naqd pul\n` +
    `• Karta: 8600 1234 5678 9012\n\n` +
    `_Play Kids Bog'chasi_`;
  
  const chatId = child.parentTelegram || TELEGRAM_CHAT_ID;
  return await sendTelegramMessage(message, chatId);
};

export const sendAllDebtsReminder = async () => {
  try {
    const debtsPath = path.join(__dirname, '../../data/debts.json');
    const childrenPath = path.join(__dirname, '../../data/children.json');
    
    const debts = JSON.parse(fs.readFileSync(debtsPath, 'utf8'));
    const children = JSON.parse(fs.readFileSync(childrenPath, 'utf8'));
    
    const unpaidDebts = debts.filter(d => d.status !== 'paid');
    let sentCount = 0;
    
    for (const debt of unpaidDebts) {
      const child = children.find(c => c.id === debt.childId);
      if (!child) continue;
      
      const result = await sendDebtReminder(child, debt);
      if (result) sentCount++;
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return { sent: sentCount, total: unpaidDebts.length };
  } catch (error) {
    console.error('Qarzdorlik eslatmalarini yuborishda xatolik:', error);
    return { sent: 0, total: 0 };
  }
};

// ============================================
// DAVOMAT FUNKSIYALARI
// ============================================

export const sendAttendanceReport = async (date = new Date()) => {
  try {
    const attendancePath = path.join(__dirname, '../../data/attendance.json');
    const childrenPath = path.join(__dirname, '../../data/children.json');
    const groupsPath = path.join(__dirname, '../../data/groups.json');
    
    const attendance = JSON.parse(fs.readFileSync(attendancePath, 'utf8'));
    const children = JSON.parse(fs.readFileSync(childrenPath, 'utf8'));
    const groups = JSON.parse(fs.readFileSync(groupsPath, 'utf8'));
    
    const dateStr = date.toISOString().split('T')[0];
    const todayAttendance = attendance.filter(a => a.date === dateStr);
    
    const present = todayAttendance.filter(a => a.status === 'present').length;
    const absent = todayAttendance.filter(a => a.status === 'absent').length;
    const late = todayAttendance.filter(a => a.status === 'late').length;
    const total = children.length;
    
    // Guruhlar bo'yicha statistika
    let groupStats = '';
    for (const group of groups) {
      const groupChildren = children.filter(c => c.groupId === group.id);
      const groupPresent = todayAttendance.filter(a => {
        const child = children.find(c => c.id === a.childId);
        return child?.groupId === group.id && a.status === 'present';
      }).length;
      groupStats += `   ${group.name}: ${groupPresent}/${groupChildren.length}\n`;
    }
    
    const message = `📊 *KUNLIK DAVOMAT HISOBOTI*\n\n` +
      `📅 *Sana:* ${date.toLocaleDateString('uz-UZ')}\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `✅ *Kelganlar:* ${present}\n` +
      `❌ *Kelmaganlar:* ${absent}\n` +
      `⏰ *Kechikkanlar:* ${late}\n` +
      `👶 *Jami bolalar:* ${total}\n` +
      `📈 *Davomat:* ${total > 0 ? Math.round((present / total) * 100) : 0}%\n\n` +
      `*Guruhlar bo'yicha:*\n${groupStats}\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `_Play Kids Bog'chasi_`;
    
    return await sendTelegramMessage(message);
  } catch (error) {
    console.error('Davomat hisobotini yuborishda xatolik:', error);
    return false;
  }
};

// ============================================
// KUNLIK HISOBOT FUNKSIYALARI
// ============================================

export const sendChildDailyReport = async (childId, report) => {
  try {
    const childrenPath = path.join(__dirname, '../../data/children.json');
    const children = JSON.parse(fs.readFileSync(childrenPath, 'utf8'));
    const child = children.find(c => c.id === childId);
    
    if (!child) return false;
    
    const getMoodEmoji = (mood) => {
      const moods = { happy: '😊', calm: '😌', tired: '😴', sad: '😢', excited: '🤩' };
      return moods[mood] || '😐';
    };
    
    const getMealText = (ate) => {
      if (ate === 'full') return '✅ To\'liq';
      if (ate === 'partial') return '🟡 Qisman';
      return '❌ Yemadi';
    };
    
    let message = `📋 *KUNLIK HISOBOT*\n\n`;
    message += `👶 *${child.firstName} ${child.lastName}*\n`;
    message += `📅 ${report.date}\n`;
    message += `━━━━━━━━━━━━━━━━━━\n\n`;
    
    // Kayfiyat
    if (report.mood) {
      message += `*Kayfiyat:*\n`;
      message += `   Ertalab: ${getMoodEmoji(report.mood.morning)}\n`;
      message += `   Kunduzi: ${getMoodEmoji(report.mood.afternoon)}\n`;
      message += `   Kechqurun: ${getMoodEmoji(report.mood.evening)}\n\n`;
    }
    
    // Ovqatlanish
    if (report.meals) {
      message += `*Ovqatlanish:*\n`;
      if (report.meals.breakfast) message += `   🥣 Nonushta: ${getMealText(report.meals.breakfast.ate)}\n`;
      if (report.meals.lunch) message += `   🍲 Tushlik: ${getMealText(report.meals.lunch.ate)}\n`;
      if (report.meals.snack) message += `   🥛 Poldnik: ${getMealText(report.meals.snack.ate)}\n`;
      message += '\n';
    }
    
    // Uyqu
    if (report.sleep) {
      message += `*Uyqu:*\n`;
      if (report.sleep.slept) {
        message += `   😴 ${report.sleep.duration} daqiqa\n`;
        message += `   Sifati: ${report.sleep.quality === 'good' ? '👍 Yaxshi' : report.sleep.quality === 'fair' ? '👌 O\'rtacha' : '👎 Yomon'}\n\n`;
      } else {
        message += `   ❌ Uxlamadi\n\n`;
      }
    }
    
    // Faoliyatlar
    if (report.activities && report.activities.length > 0) {
      message += `*Faoliyatlar:*\n`;
      report.activities.forEach(act => {
        message += `   • ${act.description}\n`;
      });
      message += '\n';
    }
    
    // Tarbiyachi izohi
    if (report.teacherNotes) {
      message += `*Tarbiyachi izohi:*\n`;
      message += `   ${report.teacherNotes}\n\n`;
    }
    
    message += `━━━━━━━━━━━━━━━━━━\n`;
    message += `_Play Kids Bog'chasi_`;
    
    const chatId = child.parentTelegram || TELEGRAM_CHAT_ID;
    return await sendTelegramMessage(message, chatId);
  } catch (error) {
    console.error('Kunlik hisobotni yuborishda xatolik:', error);
    return false;
  }
};

// ============================================
// YANGILIKLAR VA E'LONLAR
// ============================================

export const sendAnnouncement = async (title, content, type = 'info') => {
  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    success: '✅',
    event: '🎉',
    urgent: '🚨'
  };
  
  const message = `${icons[type] || 'ℹ️'} *${title}*\n\n` +
    `${content}\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `_Play Kids Bog'chasi_`;
  
  return await sendTelegramMessage(message);
};

// ============================================
// TADBIRLAR
// ============================================

export const sendEventReminder = async (event) => {
  const eventDate = new Date(event.date);
  const dateStr = eventDate.toLocaleDateString('uz-UZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
  
  const message = `🎉 *TADBIR ESLATMASI*\n\n` +
    `📌 *${event.title}*\n` +
    `📅 *Sana:* ${dateStr}\n` +
    `🕐 *Vaqt:* ${event.time || 'Belgilanmagan'}\n` +
    `📍 *Joy:* ${event.location || 'Bog\'cha'}\n\n` +
    `${event.description || ''}\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `_Play Kids Bog'chasi_`;
  
  return await sendTelegramMessage(message);
};

// ============================================
// YUTUQLAR
// ============================================

export const sendAchievementNotification = async (child, achievement) => {
  const message = `🏆 *YANGI YUTUQ!*\n\n` +
    `👶 *${child.firstName} ${child.lastName}*\n` +
    `🎖️ *${achievement.name}*\n` +
    `⭐ *+${achievement.points || 0} ball*\n\n` +
    `${achievement.description || ''}\n\n` +
    `Tabriklaymiz! 🎉\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `_Play Kids Bog'chasi_`;
  
  const chatId = child.parentTelegram || TELEGRAM_CHAT_ID;
  return await sendTelegramMessage(message, chatId);
};

// ============================================
// HAFTALIK HISOBOT
// ============================================

export const sendWeeklyReport = async () => {
  try {
    const childrenPath = path.join(__dirname, '../../data/children.json');
    const attendancePath = path.join(__dirname, '../../data/attendance.json');
    const debtsPath = path.join(__dirname, '../../data/debts.json');
    
    const children = JSON.parse(fs.readFileSync(childrenPath, 'utf8'));
    const attendance = JSON.parse(fs.readFileSync(attendancePath, 'utf8'));
    const debts = JSON.parse(fs.readFileSync(debtsPath, 'utf8'));
    
    // Haftalik davomat
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAttendance = attendance.filter(a => new Date(a.date) >= weekAgo);
    const avgAttendance = weekAttendance.length > 0 
      ? Math.round((weekAttendance.filter(a => a.status === 'present').length / weekAttendance.length) * 100)
      : 0;
    
    // Qarzdorlik
    const unpaidDebts = debts.filter(d => d.status !== 'paid');
    const totalDebt = unpaidDebts.reduce((sum, d) => sum + (d.amount - (d.paidAmount || 0)), 0);
    
    const message = `📊 *HAFTALIK HISOBOT*\n\n` +
      `📅 ${weekAgo.toLocaleDateString('uz-UZ')} - ${new Date().toLocaleDateString('uz-UZ')}\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `👶 *Jami bolalar:* ${children.length}\n` +
      `📈 *O'rtacha davomat:* ${avgAttendance}%\n` +
      `💰 *Qarzdorlik:* ${totalDebt.toLocaleString()} so'm\n` +
      `⚠️ *Qarzdorlar soni:* ${unpaidDebts.length}\n\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `_Play Kids Bog'chasi_`;
    
    return await sendTelegramMessage(message);
  } catch (error) {
    console.error('Haftalik hisobotni yuborishda xatolik:', error);
    return false;
  }
};

// ============================================
// EXPORT
// ============================================

export default {
  sendTelegramMessage,
  sendDailyMenu,
  formatDailyMenu,
  getMenuData,
  sendDebtReminder,
  sendAllDebtsReminder,
  sendAttendanceReport,
  sendChildDailyReport,
  sendAnnouncement,
  sendEventReminder,
  sendAchievementNotification,
  sendWeeklyReport
};
