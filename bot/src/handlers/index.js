import { setupStartHandler } from './start.handler.js';
import { setupCallbackHandler } from './callback.handler.js';
import { setupMessageHandler } from './message.handler.js';
import { logger } from '../utils/logger.js';

export const setupHandlers = (bot) => {
  // /start command
  setupStartHandler(bot);
  
  // Callback query handler
  setupCallbackHandler(bot);
  
  // Message handler (text, contact)
  setupMessageHandler(bot);
  
  // /help command
  bot.help((ctx) => {
    ctx.replyWithMarkdown(`
🤖 *Play Kids Bot*

📋 *Buyruqlar:*
/start - Botni boshlash
/menu - Asosiy menyu
/help - Yordam

📞 *Muammo bo'lsa:*
Admin bilan bog'laning
    `);
  });
  
  // /menu command
  bot.command('menu', async (ctx) => {
    const { showMainMenu } = await import('./callback.handler.js');
    await showMainMenu(ctx);
  });
  
  logger.info('✅ Handlers sozlandi');
};

export default { setupHandlers };
