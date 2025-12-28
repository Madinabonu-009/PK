import { t } from '../i18n/index.js';
import * as keyboards from '../keyboards/index.js';
import * as db from '../services/db.service.js';
import { logger } from '../utils/logger.js';

// Asosiy menyuni ko'rsatish
export const showMainMenu = async (ctx) => {
  const user = ctx.session?.user || db.findUserByTelegramId(ctx.from.id);
  
  if (!user) {
    try {
      if (ctx.callbackQuery) {
        await ctx.editMessageText(t('welcome'), { parse_mode: 'Markdown', ...keyboards.registerKeyboard() });
      } else {
        await ctx.replyWithMarkdown(t('welcome'), keyboards.registerKeyboard());
      }
    } catch {
      await ctx.replyWithMarkdown(t('welcome'), keyboards.registerKeyboard());
    }
    return;
  }
  
  const text = t('welcome_back', { name: user.parentFirstName });
  
  try {
    if (ctx.callbackQuery) {
      await ctx.editMessageText(text, { parse_mode: 'Markdown', ...keyboards.mainMenuKeyboard() });
    } else {
      await ctx.replyWithMarkdown(text, keyboards.mainMenuKeyboard());
    }
  } catch {
    await ctx.replyWithMarkdown(text, keyboards.mainMenuKeyboard());
  }
};

export const setupCallbackHandler = (bot) => {
  bot.on('callback_query', async (ctx) => {
    const data = ctx.callbackQuery.data;
    const parts = data.split(':');
    const action = parts[0];
    const subAction = parts[1] || '';
    
    logger.info(`Callback: ${data} from ${ctx.from.id}`);
    
    try {
      // Eski callback uchun xatolikni e'tiborsiz qoldirish
      ctx.answerCbQuery().catch(() => {});
      
      // ============ REGISTER ============
      if (action === 'register') {
        await handleRegister(ctx, subAction);
        return;
      }
      
      // ============ BACK ============
      if (action === 'back') {
        switch (subAction) {
          case 'main':
            await showMainMenu(ctx);
            break;
          case 'settings':
            await handleSettings(ctx, 'main');
            break;
          default:
            await showMainMenu(ctx);
        }
        return;
      }
      
      // ============ MENU ============
      if (action === 'menu') {
        await handleMenu(ctx, subAction);
        return;
      }
      
      // ============ CHILD ============
      if (action === 'child') {
        await handleChild(ctx, subAction);
        return;
      }
      
      // ============ SETTINGS ============
      if (action === 'settings') {
        await handleSettings(ctx, subAction);
        return;
      }
      
      // ============ CONTACT ============
      if (action === 'contact') {
        await ctx.editMessageText(t('contact_info'), { 
          parse_mode: 'Markdown', 
          ...keyboards.backKeyboard() 
        });
        return;
      }
      
      // ============ LANGUAGE ============
      if (action === 'lang') {
        // Til o'zgartirish (hozircha faqat uz)
        ctx.session.lang = subAction || 'uz';
        await ctx.editMessageText(`🌐 Til: O'zbek\n\nBoshqa tillar tez orada qo'shiladi.`, { 
          parse_mode: 'Markdown', 
          ...keyboards.backKeyboard('back:settings') 
        });
        return;
      }
      
      // Noma'lum callback
      logger.warn(`Noma'lum callback: ${data}`);
      
    } catch (error) {
      logger.error('Callback xatolik:', error);
      await ctx.reply(t('error'));
    }
  });
};

// ============ REGISTER HANDLERS ============
const handleRegister = async (ctx, action) => {
  switch (action) {
    case 'start':
      ctx.session.step = 'parent_firstname';
      ctx.session.data = {};
      await ctx.editMessageText(t('register_start') + '\n\n' + t('enter_parent_firstname'), { 
        parse_mode: 'Markdown' 
      });
      break;
      
    case 'confirm':
      // Ma'lumotlarni saqlash
      const userData = {
        telegramId: ctx.from.id,
        telegramUsername: ctx.from.username,
        ...ctx.session.data
      };
      
      const newUser = db.createUser(userData);
      
      ctx.session = {
        lang: 'uz',
        step: null,
        registered: true,
        userId: newUser.id,
        user: newUser,
        data: {}
      };
      
      await ctx.editMessageText(t('registration_success'), { 
        parse_mode: 'Markdown',
        ...keyboards.mainMenuKeyboard()
      });
      
      logger.info(`Yangi ro'yxatdan o'tish: ${newUser.parentFirstName} ${newUser.parentLastName}`);
      break;
      
    case 'cancel':
      ctx.session.step = null;
      ctx.session.data = {};
      await ctx.editMessageText(t('registration_cancelled'), { 
        parse_mode: 'Markdown',
        ...keyboards.registerKeyboard()
      });
      break;
      
    case 'skip':
      // Keyingi bosqichga o'tish (ixtiyoriy maydonlar uchun)
      break;
  }
};

// ============ MENU HANDLERS ============
const handleMenu = async (ctx, action) => {
  if (action === 'today') {
    try {
      const todayData = await db.getTodayMenu();
      
      if (!todayData || !todayData.menu) {
        await ctx.editMessageText(t('no_menu'), { 
          parse_mode: 'Markdown',
          ...keyboards.backKeyboard()
        });
        return;
      }
      
      const dayName = t(`days.${todayData.day}`);
      let text = `🍽️ *${dayName} menyusi*\n\n`;
      
      if (todayData.menu.breakfast?.name) {
        text += `🥣 *Nonushta* (08:30)\n${todayData.menu.breakfast.name}\n\n`;
      }
      if (todayData.menu.lunch?.name) {
        text += `🍲 *Tushlik* (12:30)\n${todayData.menu.lunch.name}\n\n`;
      }
      if (todayData.menu.snack?.name) {
        text += `🥛 *Poldnik* (15:30)\n${todayData.menu.snack.name}`;
      }
      
      await ctx.editMessageText(text, { 
        parse_mode: 'Markdown',
        ...keyboards.backKeyboard()
      });
    } catch (error) {
      logger.error('Menu xatolik:', error);
      await ctx.editMessageText(t('error'), keyboards.backKeyboard());
    }
  }
};

// ============ CHILD HANDLERS ============
const handleChild = async (ctx, action) => {
  const user = ctx.session?.user || db.findUserByTelegramId(ctx.from.id);
  
  if (!user?.phone) {
    await ctx.editMessageText(t('no_child'), { 
      parse_mode: 'Markdown',
      ...keyboards.backKeyboard()
    });
    return;
  }
  
  try {
    const child = await db.getChildByParentPhone(user.phone);
    
    if (!child) {
      await ctx.editMessageText(t('no_child'), { 
        parse_mode: 'Markdown',
        ...keyboards.backKeyboard()
      });
      return;
    }
    
    switch (action) {
      case 'info':
        const age = child.birthDate 
          ? Math.floor((Date.now() - new Date(child.birthDate)) / (365.25 * 24 * 60 * 60 * 1000))
          : '?';
        
        const infoText = t('child_info', {
          name: `${child.firstName} ${child.lastName}`,
          group: child.groupName || 'Belgilanmagan',
          age: `${age} yosh`
        });
        
        await ctx.editMessageText(infoText, { 
          parse_mode: 'Markdown',
          ...keyboards.backKeyboard()
        });
        break;
        
      case 'attendance':
        const attendance = await db.getAttendanceByChild(child.id);
        
        if (!attendance.length) {
          await ctx.editMessageText(t('no_attendance'), { 
            parse_mode: 'Markdown',
            ...keyboards.backKeyboard()
          });
          return;
        }
        
        const present = attendance.filter(a => a.status === 'present').length;
        const absent = attendance.filter(a => a.status === 'absent').length;
        
        const attText = t('attendance_info', {
          present,
          absent,
          total: attendance.length
        });
        
        await ctx.editMessageText(attText, { 
          parse_mode: 'Markdown',
          ...keyboards.backKeyboard()
        });
        break;
        
      case 'payments':
        const payments = await db.getPaymentsByChild(child.id);
        const debts = await db.getDebtsByChild(child.id);
        
        const paid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0);
        const pending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + (p.amount || 0), 0);
        const debt = debts.reduce((s, d) => s + (d.amount || 0), 0);
        
        const payText = t('payment_info', {
          paid: paid.toLocaleString(),
          pending: pending.toLocaleString(),
          debt: debt.toLocaleString()
        });
        
        await ctx.editMessageText(payText, { 
          parse_mode: 'Markdown',
          ...keyboards.backKeyboard()
        });
        break;
        
      case 'report':
        const today = new Date().toISOString().split('T')[0];
        const report = await db.getDailyReportByChild(child.id, today);
        
        if (!report) {
          await ctx.editMessageText(t('no_report'), { 
            parse_mode: 'Markdown',
            ...keyboards.backKeyboard()
          });
          return;
        }
        
        let reportText = `📋 *Kunlik hisobot*\n📅 ${today}\n\n`;
        if (report.mood) reportText += `😊 Kayfiyat: ${report.mood}\n`;
        if (report.meals) reportText += `🍽️ Ovqatlanish: ${report.meals}\n`;
        if (report.sleep) reportText += `😴 Uyqu: ${report.sleep}\n`;
        if (report.activities) reportText += `🎨 Mashg'ulotlar: ${report.activities}\n`;
        if (report.notes) reportText += `\n📝 ${report.notes}`;
        
        await ctx.editMessageText(reportText, { 
          parse_mode: 'Markdown',
          ...keyboards.backKeyboard()
        });
        break;
    }
  } catch (error) {
    logger.error('Child handler xatolik:', error);
    await ctx.editMessageText(t('error'), keyboards.backKeyboard());
  }
};

// ============ SETTINGS HANDLERS ============
const handleSettings = async (ctx, action) => {
  try {
    switch (action) {
      case 'main':
        await ctx.editMessageText(t('settings_menu'), { 
          parse_mode: 'Markdown',
          ...keyboards.settingsKeyboard()
        });
        break;
        
      case 'edit':
        await ctx.editMessageText('✏️ *Ma\'lumotlarni o\'zgartirish*\n\nBu funksiya tez orada qo\'shiladi.', { 
          parse_mode: 'Markdown',
          ...keyboards.backKeyboard('back:settings')
        });
        break;
        
      case 'notifications':
        await ctx.editMessageText('🔔 *Bildirishnomalar*\n\nBu funksiya tez orada qo\'shiladi.', { 
          parse_mode: 'Markdown',
          ...keyboards.backKeyboard('back:settings')
        });
        break;
        
      default:
        await ctx.editMessageText(t('settings_menu'), { 
          parse_mode: 'Markdown',
          ...keyboards.settingsKeyboard()
        });
    }
  } catch (error) {
    logger.error('Settings handler xatolik:', error);
    await ctx.reply(t('error'));
  }
};

export default { setupCallbackHandler, showMainMenu };
