import { Telegraf, session } from 'telegraf';
import { logger } from './utils/logger.js';

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN topilmadi! .env faylni tekshiring.');
}

export const bot = new Telegraf(BOT_TOKEN);

// Session middleware
bot.use(session({
  defaultSession: () => ({
    lang: 'uz',
    step: null,
    registered: false,
    userId: null,
    data: {}
  })
}));

// Error handler
bot.catch((err, ctx) => {
  logger.error(`Bot xatolik [${ctx.updateType}]:`, err);
  ctx.reply('❌ Xatolik yuz berdi. Iltimos, /start buyrug\'ini qayta yuboring.').catch(() => {});
});

export default bot;
