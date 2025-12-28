import { t } from '../i18n/index.js';
import { confirmKeyboard, phoneKeyboard, removeKeyboard } from '../keyboards/index.js';
import { logger } from '../utils/logger.js';

// Ism validatsiyasi
const isValidName = (name) => {
  return name && name.length >= 2 && /^[a-zA-Zа-яА-ЯёЁ\u0400-\u04FF\s'-]+$/.test(name);
};

// Telefon validatsiyasi
const isValidPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 9 && cleaned.length <= 15;
};

export const setupMessageHandler = (bot) => {
  // Contact (telefon raqam) handler
  bot.on('contact', async (ctx) => {
    const step = ctx.session?.step;
    
    if (step === 'phone') {
      const phone = ctx.message.contact.phone_number;
      ctx.session.data.phone = phone;
      
      logger.info(`Phone received: ${phone}`);
      
      // Ma'lumotlarni tasdiqlash
      await showConfirmation(ctx);
    }
  });
  
  // Text message handler
  bot.on('text', async (ctx) => {
    const text = ctx.message.text.trim();
    const step = ctx.session?.step;
    
    if (!step) return;
    
    logger.info(`Message: "${text}", step: ${step}`);
    
    try {
      switch (step) {
        case 'parent_firstname':
          if (!isValidName(text)) {
            await ctx.reply(t('invalid_name'));
            return;
          }
          ctx.session.data.parentFirstName = text;
          ctx.session.step = 'parent_lastname';
          await ctx.reply(t('enter_parent_lastname'));
          break;
          
        case 'parent_lastname':
          if (!isValidName(text)) {
            await ctx.reply(t('invalid_name'));
            return;
          }
          ctx.session.data.parentLastName = text;
          ctx.session.step = 'child_firstname';
          await ctx.reply(t('enter_child_firstname'));
          break;
          
        case 'child_firstname':
          if (!isValidName(text)) {
            await ctx.reply(t('invalid_name'));
            return;
          }
          ctx.session.data.childFirstName = text;
          ctx.session.step = 'child_lastname';
          await ctx.reply(t('enter_child_lastname'));
          break;
          
        case 'child_lastname':
          if (!isValidName(text)) {
            await ctx.reply(t('invalid_name'));
            return;
          }
          ctx.session.data.childLastName = text;
          ctx.session.step = 'phone';
          await ctx.reply(t('enter_phone'), phoneKeyboard());
          break;
          
        case 'phone':
          // Qo'lda kiritilgan telefon raqam
          if (!isValidPhone(text)) {
            await ctx.reply(t('invalid_phone'));
            return;
          }
          ctx.session.data.phone = text;
          await showConfirmation(ctx);
          break;
      }
    } catch (error) {
      logger.error('Message handler xatolik:', error);
      await ctx.reply(t('error'));
    }
  });
};

// Ma'lumotlarni tasdiqlash
const showConfirmation = async (ctx) => {
  const data = ctx.session.data;
  
  const confirmText = t('confirm_data', {
    parentName: `${data.parentFirstName} ${data.parentLastName}`,
    childName: `${data.childFirstName} ${data.childLastName}`,
    phone: data.phone
  });
  
  ctx.session.step = 'confirm';
  await ctx.replyWithMarkdown(confirmText, confirmKeyboard());
};

export default { setupMessageHandler };
