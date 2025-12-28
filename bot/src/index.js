import 'dotenv/config';
import { bot } from './bot.js';
import { setupHandlers } from './handlers/index.js';
import { initCronJobs } from './services/cron.service.js';
import { logger } from './utils/logger.js';

// Handlerlarni sozlash
setupHandlers(bot);

// Cron joblarni ishga tushirish
initCronJobs(bot);

// Botni ishga tushirish
bot.launch()
  .then(() => {
    logger.info('🤖 @Play_Kids_bot ishga tushdi!');
    console.log('🤖 @Play_Kids_bot ishga tushdi!');
    console.log('📅 Har kuni 07:30 da menyu yuboriladi');
  })
  .catch((err) => {
    logger.error('Bot ishga tushishda xatolik:', err);
    console.error('Bot ishga tushishda xatolik:', err);
  });

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
