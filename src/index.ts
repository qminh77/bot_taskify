import { bot } from './core/bot';
import { setupBot } from './setup';

// Setup listeners
setupBot(bot);

// LAUNCH
bot.launch(() => {
    console.log('Bot is running... (Pagination & Search Enabled)');
});

// GRACEFUL STOP
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
