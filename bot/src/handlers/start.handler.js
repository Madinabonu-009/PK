import { t } from '../i18n/index.js';
import { registerKeyboard, mainMenuKeyboard } from '../keyboards/index.js';
import { findUserByTelegramId } from '../services/db.service.js';
import { logger } from '../utils/logger.js';

export const setupStartHandler = (bot) => {
  bot.start(async (ctx) => {
    const telegramId = ctx.from.id;
    const firstName = ctx.from.first_name || '';
    
    logger.info(`/start: ${telegramId} - ${firstName}`);
    
    try {
      // Foydalanuvchi mavjudligini tekshirish
      const existingUser = findUserByTelegramId(telegramId);
      
      if (existingUser) {
        // Ro'yxatdan o'tgan foydalanuvchi
        ctx.session = {
          ...ctx.session,
          registered: true,
          userId: existingUser.id,
          user: existingUser
        };
        
        const welcomeText = t('welcome_back', { 
          name: existingUser.parentFirstName || firstName 
        });
        
        await ctx.replyWithMarkdown(welcomeText, mainMenuKeyboard());
      } else {
        // Yangi foydalanuvchi - ro'yxatdan o'tish taklifi
        ctx.session = {
          lang: 'uz',
          step: null,
          registered: false,
          userId: null,
          data: {}
        };
        
        await ctx.replyWithMarkdown(t('welcome'), registerKeyboard());
      }
    } catch (error) {
      logger.error('Start handler xatolik:', error);
      await ctx.reply(t('error'));
    }
  });
};

export default { setupStartHandler };
