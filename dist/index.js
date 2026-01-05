"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bot_1 = require("./core/bot");
const setup_1 = require("./setup");
// Setup listeners
(0, setup_1.setupBot)(bot_1.bot);
// LAUNCH
bot_1.bot.launch(() => {
    console.log('Bot is running... (Pagination & Search Enabled)');
});
// GRACEFUL STOP
process.once('SIGINT', () => bot_1.bot.stop('SIGINT'));
process.once('SIGTERM', () => bot_1.bot.stop('SIGTERM'));
