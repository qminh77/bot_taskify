"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function () { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function (o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function (o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const bot = new telegraf_1.Telegraf(process.env.BOT_TOKEN || '');
const API_BASE_URL = process.env.API_BASE_URL || 'https://dev-taskify.taskhub.company';
// In-memory session store (Map<TelegramUserID, { token: string, user: any }>)
const sessionStore = new Map();
// Authentication Middleware
const authMiddleware = async (ctx, next) => {
    const userId = ctx.from?.id;
    if (!userId)
        return next();
    const session = sessionStore.get(userId);
    // Attach session to context if needed? Or just access store directly.
    // For now, checks are done inside commands.
    return next();
};
bot.use(authMiddleware);
// --- Commands ---
// HELP Command
bot.command('help', (ctx) => {
    const userId = ctx.from.id;
    const session = sessionStore.get(userId);
    const isLoggedIn = !!session;
    let helpMessage = `🤖 *Taskify Bot Help* 🤖\n\n`;
    helpMessage += `Welcome to our Taskify Telegram Bot! Here is how to use it:\n\n`;
    if (isLoggedIn) {
        helpMessage += `👤 *Status*: Logged In as *${session.user.first_name} ${session.user.last_name}*\n\n`;
        helpMessage += `📝 *Commands*:\n`;
        helpMessage += `/me - View your profile\n`;
        helpMessage += `/projects - View your projects (Coming Soon)\n`;
        helpMessage += `/tasks - View your tasks (Coming Soon)\n`;
        helpMessage += `/logout - Sign out\n`;
    }
    else {
        helpMessage += `👤 *Status*: Guest\n\n`;
        helpMessage += `🔐 *To Login*:\n`;
        helpMessage += `Type: \`/login email password\`\n`;
        helpMessage += `_Example: /login user@example.com 123456_\n\n`;
        helpMessage += `⚠️ _Note: Your password is sent securely to our API and not stored permanently by the bot._`;
    }
    ctx.replyWithMarkdown(helpMessage);
});
bot.start((ctx) => {
    ctx.reply(`Welcome ${ctx.from.first_name}! Type /help to see available commands.`);
});
// LOGIN Command
bot.command('login', async (ctx) => {
    const args = ctx.message.text.split(' ');
    // args[0] is /login
    if (args.length < 3) {
        return ctx.reply('❌ Invalid Format.\nUsage: `/login email password`', { parse_mode: 'Markdown' });
    }
    const email = args[1];
    const password = args.slice(2).join(' '); // Allow spaces in password if any (though typically not)
    try {
        const response = await axios_1.default.post(`${API_BASE_URL}/api/users/login`, {
            email: email,
            password: password
        });
        if (response.data && !response.data.error) {
            const token = response.data.token; // "15|ANl9H..."
            // Extract pure token if needed, or use as is. API usually expects "Bearer <token>"
            // Based on API docs, token might be directly used as Bearer token.
            const userData = response.data.data; // User info object
            sessionStore.set(ctx.from.id, {
                token: token,
                user: userData
            });
            // Delete user message to hide password
            try {
                await ctx.deleteMessage();
            }
            catch (e) {
                console.error("Could not delete login message", e);
            }
            let welcomeMsg = `✅ *Login Successful!*\n\n`;
            welcomeMsg += `Welcome back, *${userData.first_name || 'User'}*!\n`;
            welcomeMsg += `Workspace ID: ${userData.workspace_id}\n\n`;
            welcomeMsg += `Type /help to see what you can do.`;
            ctx.replyWithMarkdown(welcomeMsg);
        }
        else {
            ctx.reply('❌ Login Failed. Please check your credentials.');
        }
    }
    catch (error) {
        console.error('Login Error:', error.response?.data || error.message);
        const errorMsg = error.response?.data?.message || 'Unknown error occurred.';
        ctx.reply(`❌ Login Error: ${errorMsg}`);
    }
});
// LOGOUT Command
bot.command('logout', (ctx) => {
    if (sessionStore.has(ctx.from.id)) {
        sessionStore.delete(ctx.from.id);
        ctx.reply('👋 Logged out successfully.');
    }
    else {
        ctx.reply('You are not logged in.');
    }
});
// ME Command
bot.command('me', (ctx) => {
    const session = sessionStore.get(ctx.from.id);
    if (!session) {
        return ctx.reply('🔒 You must login first. Use /login email password');
    }
    const u = session.user;
    let msg = `👤 *Your Profile*\n\n`;
    msg += `*Name*: ${u.first_name} ${u.last_name}\n`;
    msg += `*Email*: ${u.email}\n`;
    msg += `*Role*: ${u.role}\n`;
    msg += `*ID*: ${u.id}\n`;
    ctx.replyWithMarkdown(msg);
});
// Launch Bot
bot.launch(() => {
    console.log('Bot is running...');
});
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
