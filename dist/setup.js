"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupBot = setupBot;
const auth_1 = require("./features/auth");
const menu_1 = require("./features/menu");
const business_features_1 = require("./features/business_features");
const productivity_features_1 = require("./features/productivity_features");
const dashboard_1 = require("./features/dashboard");
const utilities_features_1 = require("./features/utilities_features");
const session_1 = require("./core/session");
function setupBot(bot) {
    // Middleware
    bot.use(async (ctx, next) => {
        console.log('LOG: Middleware entered for update', ctx.update.update_id);
        const start = Date.now();
        await next();
        const ms = Date.now() - start;
        console.log('LOG: Response time %sms', ms);
    });
    // COMMANDS
    bot.start(async (ctx) => {
        console.log('LOG: Handling /start command');
        const userId = ctx.from.id;
        try {
            if (session_1.sessionStore.has(userId)) {
                console.log('LOG: User has session, sending main menu');
                await (0, menu_1.sendMainMenu)(ctx);
            }
            else {
                console.log('LOG: User no session, sending login prompt');
                await ctx.reply(`Xin chào ${ctx.from.first_name || 'bạn'}! \n\n🤖 *E-NG Systems Bot*\nVui lòng đăng nhập để sử dụng hệ thống.\nCú pháp: \`/login email password\``, { parse_mode: 'Markdown' });
            }
            console.log('LOG: /start command handled successfully');
        }
        catch (e) {
            console.error('LOG: Error in /start handler:', e.message);
        }
    });
    bot.command('help', (ctx) => (0, menu_1.sendMainMenu)(ctx));
    bot.command('login', auth_1.handleLogin);
    bot.command('logout', auth_1.handleLogout);
    bot.command('me', auth_1.handleMe);
    // COMMAND HANDLERS WRAPPER (Allow ctx to flow)
    bot.command('projects', (ctx) => (0, business_features_1.handleProjects)(ctx));
    bot.command('tasks', (ctx) => (0, business_features_1.handleTasks)(ctx));
    bot.command('clients', (ctx) => (0, business_features_1.handleClients)(ctx));
    bot.command('leads', (ctx) => (0, business_features_1.handleLeads)(ctx));
    bot.command('users', (ctx) => (0, productivity_features_1.handleUsers)(ctx));
    bot.command('leaves', (ctx) => (0, productivity_features_1.handleLeaves)(ctx));
    bot.command('meetings', (ctx) => (0, productivity_features_1.handleMeetings)(ctx));
    bot.command('todos', (ctx) => (0, productivity_features_1.handleTodos)(ctx));
    // ACTIONS
    bot.action('help_action', (ctx) => { (0, menu_1.sendMainMenu)(ctx); ctx.answerCbQuery(); });
    bot.action('main_menu', (ctx) => { (0, menu_1.sendMainMenu)(ctx); ctx.answerCbQuery(); });
    bot.action('logout_action', (ctx) => { (0, auth_1.handleLogout)(ctx); ctx.answerCbQuery(); });
    bot.action('btn_me', (ctx) => { (0, auth_1.handleMe)(ctx); ctx.answerCbQuery(); });
    // FEATURE ACTIONS
    bot.command('stats', (ctx) => (0, dashboard_1.handleStatistics)(ctx));
    bot.action('btn_stats', (ctx) => { (0, dashboard_1.handleStatistics)(ctx); ctx.answerCbQuery(); });
    bot.action('btn_users', (ctx) => { (0, productivity_features_1.handleUsers)(ctx); ctx.answerCbQuery(); });
    bot.action('btn_projects', (ctx) => { (0, business_features_1.handleProjects)(ctx); ctx.answerCbQuery(); });
    bot.action('btn_tasks', (ctx) => { (0, business_features_1.handleTasks)(ctx); ctx.answerCbQuery(); });
    bot.action('btn_clients', (ctx) => { (0, business_features_1.handleClients)(ctx); ctx.answerCbQuery(); });
    bot.action('btn_leads', (ctx) => { (0, business_features_1.handleLeads)(ctx); ctx.answerCbQuery(); });
    bot.action('btn_leaves', (ctx) => { (0, productivity_features_1.handleLeaves)(ctx); ctx.answerCbQuery(); });
    bot.action('btn_meetings', (ctx) => { (0, productivity_features_1.handleMeetings)(ctx); ctx.answerCbQuery(); });
    bot.action('btn_todos', (ctx) => { (0, productivity_features_1.handleTodos)(ctx); ctx.answerCbQuery(); });
    // GENERIC PAGINATION HANDLER
    // Regex: btn_TYPE_page:offset:limit:search
    // Ex: btn_users_page:5:5:John
    bot.action(/btn_(\w+)_page:(.+)/, (ctx) => {
        const type = ctx.match[1]; // users, projects, etc.
        const data = ctx.match[2];
        const [offsetStr, limitStr, ...searchParts] = data.split(':');
        const offset = parseInt(offsetStr);
        const limit = parseInt(limitStr);
        const search = searchParts.join(':');
        // Dispatcher
        switch (type) {
            case 'users':
                (0, productivity_features_1.handleUsers)(ctx, offset, limit, search);
                break;
            case 'projects':
                (0, business_features_1.handleProjects)(ctx, offset, limit, search);
                break;
            case 'tasks':
                (0, business_features_1.handleTasks)(ctx, offset, limit, search);
                break;
            case 'clients':
                (0, business_features_1.handleClients)(ctx, offset, limit, search);
                break;
            case 'leads':
                (0, business_features_1.handleLeads)(ctx, offset, limit, search);
                break;
            case 'leaves':
                (0, productivity_features_1.handleLeaves)(ctx, offset, limit, search);
                break;
            case 'meetings':
                (0, productivity_features_1.handleMeetings)(ctx, offset, limit, search);
                break;
            case 'todos':
                (0, productivity_features_1.handleTodos)(ctx, offset, limit, search);
                break;
            case 'notes':
                (0, utilities_features_1.handleNotes)(ctx, offset, limit, search);
                break;
            case 'logs':
                (0, utilities_features_1.handleActivityLogs)(ctx, offset, limit, search);
                break;
        }
        ctx.answerCbQuery();
    });
    // GENERIC SEARCH BUTTON PROMPT
    // Regex: btn_TYPE_search
    bot.action(/btn_(\w+)_search/, (ctx) => {
        const type = ctx.match[1];
        ctx.reply(`🔍 Để tìm kiếm ${type}, vui lòng chat theo cú pháp:\n\`/${type} [Từ khóa]\`\nVí dụ: \`/${type} Design\``, { parse_mode: 'Markdown' });
        ctx.answerCbQuery();
    });
}
