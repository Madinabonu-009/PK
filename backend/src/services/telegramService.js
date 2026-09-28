import axios from 'axios';
import mongoose from 'mongoose';

// Environment variables dinamik o'qiladi (dotenv yuklangandan keyin)
const getTelegramConfig = () => ({
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  chatId: process.env.TELEGRAM_CHAT_ID
});

// MongoDB collection helper
const getCollection = (name) => mongoose.connection.collection(name)

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

export const sendTelegramMessage = async (message, chatId) => {
  const config = getTelegramConfig();
  const TELEGRAM_BOT_TOKEN = config.botToken;
  const TELEGRAM_CHAT_ID = chatId || config.chatId;
  
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('Telegram bot token yoki chat ID topilmadi');
    console.error('BOT_TOKEN:', TELEGRAM_BOT_TOKEN ? 'mavjud' : 'yo\'q');
    console.error('CHAT_ID:', TELEGRAM_CHAT_ID ? 'mavjud' : 'yo\'q');
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    // Markdown maxsus belgilarini escape qilish
    const escapedMessage = message
      .replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1')
      .replace(/\\\*/g, '*')  // Bold uchun * ni qaytarish
      .replace(/\\_/g, '_');  // Italic uchun _ ni qaytarish
    
    const response = await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML'  // Markdown o'rniga HTML ishlatish - xavfsizroq
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

export const getMenuData = async () => {
  try {
    const menu = await getCollection('menu').findOne({})
    if (!menu) {
      console.error('Menu topilmadi');
      return null;
    }
    // menu.days mavjud bo'lsa, uni qaytarish
    return menu.days || menu;
  } catch (error) {
    console.error('Menu ma\'lumotlarini o\'qishda xatolik:', error);
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

  let message = `🍽️ <b>BUGUNGI MENYU</b>\n`;
  message += `📅 ${dateStr} - ${dayNameUz}\n`;
  message += `━━━━━━━━━━━━━━━━━━\n\n`;

  if (dayMenu.breakfast) {
    message += `🥣 <b>Nonushta</b> (08:30)\n`;
    message += `   ${dayMenu.breakfast.name}\n\n`;
  }

  if (dayMenu.lunch) {
    message += `🍲 <b>Tushlik</b> (12:30)\n`;
    message += `   ${dayMenu.lunch.name}\n\n`;
  }

  if (dayMenu.snack) {
    message += `🥛 <b>Yengil tamaddi</b> (15:30)\n`;
    message += `   ${dayMenu.snack.name}\n\n`;
  }

  message += `━━━━━━━━━━━━━━━━━━\n`;
  message += `🏫 <b>Play Kids Bog'chasi</b>\n`;
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
  const menuData = await getMenuData();
  
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
  
  const message = `⚠️ <b>TO'LOV ESLATMASI</b>\n\n` +
    `👶 <b>Bola:</b> ${child.firstName} ${child.lastName}\n` +
    `📅 <b>Oy:</b> ${debt.month}\n` +
    `💰 <b>Qarz:</b> ${remaining.toLocaleString()} so'm\n` +
    `📆 <b>Muddati:</b> ${debt.dueDate}\n` +
    `${daysOverdue > 0 ? `⏰ <b>Kechikish:</b> ${daysOverdue} kun\n` : ''}` +
    `\n💳 <b>To'lov usullari:</b>\n` +
    `• Naqd pul\n` +
    `• Karta: 8600 1234 5678 9012\n\n` +
    `<i>Play Kids Bog'chasi</i>`;
  
  const chatId = child.parentTelegram || TELEGRAM_CHAT_ID;
  return await sendTelegramMessage(message, chatId);
};

export const sendAllDebtsReminder = async () => {
  try {
    const debts = await getCollection('debts').find({ status: { $ne: 'paid' } }).toArray()
    const children = await getCollection('children').find({}).toArray()
    
    let sentCount = 0;
    
    for (const debt of debts) {
      const child = children.find(c => (c._id?.toString() || c.id) === debt.childId);
      if (!child) continue;
      
      const result = await sendDebtReminder(child, debt);
      if (result) sentCount++;
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return { sent: sentCount, total: debts.length };
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
    const attendance = await getCollection('attendance').find({}).toArray()
    const children = await getCollection('children').find({ isDeleted: { $ne: true } }).toArray()
    const groups = await getCollection('groups').find({ isDeleted: { $ne: true } }).toArray()
    
    const dateStr = date.toISOString().split('T')[0];
    const todayAttendance = attendance.filter(a => a.date === dateStr);
    
    const present = todayAttendance.filter(a => a.status === 'present').length;
    const absent = todayAttendance.filter(a => a.status === 'absent').length;
    const late = todayAttendance.filter(a => a.status === 'late').length;
    const total = children.length;
    
    // Guruhlar bo'yicha statistika
    let groupStats = '';
    for (const group of groups) {
      const groupId = group.id || group._id?.toString()
      const groupChildren = children.filter(c => c.groupId === groupId);
      const groupPresent = todayAttendance.filter(a => {
        const child = children.find(c => (c._id?.toString() || c.id) === a.childId);
        return child?.groupId === groupId && a.status === 'present';
      }).length;
      groupStats += `   ${group.name}: ${groupPresent}/${groupChildren.length}\n`;
    }
    
    const message = `📊 <b>KUNLIK DAVOMAT HISOBOTI</b>\n\n` +
      `📅 <b>Sana:</b> ${date.toLocaleDateString('uz-UZ')}\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `✅ <b>Kelganlar:</b> ${present}\n` +
      `❌ <b>Kelmaganlar:</b> ${absent}\n` +
      `⏰ <b>Kechikkanlar:</b> ${late}\n` +
      `👶 <b>Jami bolalar:</b> ${total}\n` +
      `📈 <b>Davomat:</b> ${total > 0 ? Math.round((present / total) * 100) : 0}%\n\n` +
      `<b>Guruhlar bo'yicha:</b>\n${groupStats}\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `<i>Play Kids Bog'chasi</i>`;
    
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
    const children = await getCollection('children').find({}).toArray()
    const child = children.find(c => (c._id?.toString() || c.id) === childId);
    
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
    
    let message = `📋 <b>KUNLIK HISOBOT</b>\n\n`;
    message += `👶 <b>${child.firstName} ${child.lastName}</b>\n`;
    message += `📅 ${report.date}\n`;
    message += `━━━━━━━━━━━━━━━━━━\n\n`;
    
    // Kayfiyat
    if (report.mood) {
      message += `<b>Kayfiyat:</b>\n`;
      message += `   Ertalab: ${getMoodEmoji(report.mood.morning)}\n`;
      message += `   Kunduzi: ${getMoodEmoji(report.mood.afternoon)}\n`;
      message += `   Kechqurun: ${getMoodEmoji(report.mood.evening)}\n\n`;
    }
    
    // Ovqatlanish
    if (report.meals) {
      message += `<b>Ovqatlanish:</b>\n`;
      if (report.meals.breakfast) message += `   🥣 Nonushta: ${getMealText(report.meals.breakfast.ate || report.meals.breakfast.eaten)}\n`;
      if (report.meals.lunch) message += `   🍲 Tushlik: ${getMealText(report.meals.lunch.ate || report.meals.lunch.eaten)}\n`;
      if (report.meals.snack) message += `   🥛 Yengil tamaddi: ${getMealText(report.meals.snack.ate || report.meals.snack.eaten)}\n`;
      message += '\n';
    }
    
    // Uyqu
    if (report.sleep) {
      message += `<b>Uyqu:</b>\n`;
      if (report.sleep.slept) {
        message += `   😴 ${report.sleep.duration} daqiqa\n`;
        message += `   Sifati: ${report.sleep.quality === 'good' ? '👍 Yaxshi' : report.sleep.quality === 'fair' || report.sleep.quality === 'normal' ? '👌 O\'rtacha' : '👎 Yomon'}\n\n`;
      } else {
        message += `   ❌ Uxlamadi\n\n`;
      }
    }
    
    // Faoliyatlar
    if (report.activities && report.activities.length > 0) {
      message += `<b>Faoliyatlar:</b>\n`;
      report.activities.forEach(act => {
        message += `   • ${act.description || act}\n`;
      });
      message += '\n';
    }
    
    // Tarbiyachi izohi
    if (report.teacherNotes) {
      message += `<b>Tarbiyachi izohi:</b>\n`;
      message += `   ${report.teacherNotes}\n\n`;
    }
    
    message += `━━━━━━━━━━━━━━━━━━\n`;
    message += `<i>Play Kids Bog'chasi</i>`;
    
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
  
  const message = `${icons[type] || 'ℹ️'} <b>${title}</b>\n\n` +
    `${content}\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `<i>Play Kids Bog'chasi</i>`;
  
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
  
  const message = `🎉 <b>TADBIR ESLATMASI</b>\n\n` +
    `📌 <b>${event.title}</b>\n` +
    `📅 <b>Sana:</b> ${dateStr}\n` +
    `🕐 <b>Vaqt:</b> ${event.time || 'Belgilanmagan'}\n` +
    `📍 <b>Joy:</b> ${event.location || 'Bog\'cha'}\n\n` +
    `${event.description || ''}\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `<i>Play Kids Bog'chasi</i>`;
  
  return await sendTelegramMessage(message);
};

// ============================================
// YUTUQLAR
// ============================================

export const sendAchievementNotification = async (child, achievement) => {
  const message = `🏆 <b>YANGI YUTUQ!</b>\n\n` +
    `👶 <b>${child.firstName} ${child.lastName}</b>\n` +
    `🎖️ <b>${achievement.name}</b>\n` +
    `⭐ <b>+${achievement.points || 0} ball</b>\n\n` +
    `${achievement.description || ''}\n\n` +
    `Tabriklaymiz! 🎉\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `<i>Play Kids Bog'chasi</i>`;
  
  const chatId = child.parentTelegram || TELEGRAM_CHAT_ID;
  return await sendTelegramMessage(message, chatId);
};

// ============================================
// HAFTALIK HISOBOT
// ============================================

export const sendWeeklyReport = async () => {
  try {
    const children = await getCollection('children').find({ isDeleted: { $ne: true } }).toArray()
    const attendance = await getCollection('attendance').find({}).toArray()
    const debts = await getCollection('debts').find({ status: { $ne: 'paid' } }).toArray()
    
    // Haftalik davomat
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAttendance = attendance.filter(a => new Date(a.date) >= weekAgo);
    const avgAttendance = weekAttendance.length > 0 
      ? Math.round((weekAttendance.filter(a => a.status === 'present').length / weekAttendance.length) * 100)
      : 0;
    
    // Qarzdorlik
    const totalDebt = debts.reduce((sum, d) => sum + (d.amount - (d.paidAmount || 0)), 0);
    
    const message = `📊 <b>HAFTALIK HISOBOT</b>\n\n` +
      `📅 ${weekAgo.toLocaleDateString('uz-UZ')} - ${new Date().toLocaleDateString('uz-UZ')}\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `👶 <b>Jami bolalar:</b> ${children.length}\n` +
      `📈 <b>O'rtacha davomat:</b> ${avgAttendance}%\n` +
      `💰 <b>Qarzdorlik:</b> ${totalDebt.toLocaleString()} so'm\n` +
      `⚠️ <b>Qarzdorlar soni:</b> ${debts.length}\n\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `<i>Play Kids Bog'chasi</i>`;
    
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
