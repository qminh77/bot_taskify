import { Telegraf, Context } from 'telegraf';
import { handleLogin, handleLogout, handleMe } from './features/auth';
import { sendMainMenu } from './features/menu';
import { handleProjects, handleTasks, handleClients, handleLeads } from './features/business_features';
import { handleUsers, handleLeaves, handleMeetings, handleTodos } from './features/productivity_features';
import { handleStatistics } from './features/dashboard';
import { handleNotes, handleActivityLogs } from './features/utilities_features';
import { sessionStore } from './core/session';

export function setupBot(bot: Telegraf<Context>) {
    // Middleware
    bot.use(async (ctx, next) => {
        // Optional: Log requests or check session expiry globally
        await next();
    });

    // COMMANDS
    bot.start((ctx) => {
        const userId = ctx.from.id;
        if (sessionStore.has(userId)) {
            sendMainMenu(ctx);
        } else {
            ctx.reply(`Xin chào ${ctx.from.first_name || 'bạn'}! \n\n🤖 *E-NG Systems Bot*\nVui lòng đăng nhập để sử dụng hệ thống.\nCú pháp: \`/login email password\``, { parse_mode: 'Markdown' });
        }
    });

    bot.command('help', (ctx) => sendMainMenu(ctx));
    bot.command('login', handleLogin);
    bot.command('logout', handleLogout);
    bot.command('me', handleMe);

    // COMMAND HANDLERS WRAPPER (Allow ctx to flow)
    bot.command('projects', (ctx) => handleProjects(ctx));
    bot.command('tasks', (ctx) => handleTasks(ctx));
    bot.command('clients', (ctx) => handleClients(ctx));
    bot.command('leads', (ctx) => handleLeads(ctx));
    bot.command('users', (ctx) => handleUsers(ctx));
    bot.command('leaves', (ctx) => handleLeaves(ctx));
    bot.command('meetings', (ctx) => handleMeetings(ctx));
    bot.command('todos', (ctx) => handleTodos(ctx));

    // ACTIONS
    bot.action('help_action', (ctx) => { sendMainMenu(ctx); ctx.answerCbQuery(); });
    bot.action('main_menu', (ctx) => { sendMainMenu(ctx); ctx.answerCbQuery(); });
    bot.action('logout_action', (ctx) => { handleLogout(ctx); ctx.answerCbQuery(); });
    bot.action('btn_me', (ctx) => { handleMe(ctx); ctx.answerCbQuery(); });

    // FEATURE ACTIONS
    bot.command('stats', (ctx) => handleStatistics(ctx));
    bot.action('btn_stats', (ctx) => { handleStatistics(ctx); ctx.answerCbQuery(); });

    bot.action('btn_users', (ctx) => { handleUsers(ctx); ctx.answerCbQuery(); });
    bot.action('btn_projects', (ctx) => { handleProjects(ctx); ctx.answerCbQuery(); });
    bot.action('btn_tasks', (ctx) => { handleTasks(ctx); ctx.answerCbQuery(); });
    bot.action('btn_clients', (ctx) => { handleClients(ctx); ctx.answerCbQuery(); });
    bot.action('btn_leads', (ctx) => { handleLeads(ctx); ctx.answerCbQuery(); });
    bot.action('btn_leaves', (ctx) => { handleLeaves(ctx); ctx.answerCbQuery(); });
    bot.action('btn_meetings', (ctx) => { handleMeetings(ctx); ctx.answerCbQuery(); });
    bot.action('btn_todos', (ctx) => { handleTodos(ctx); ctx.answerCbQuery(); });

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
            case 'users': handleUsers(ctx, offset, limit, search); break;
            case 'projects': handleProjects(ctx, offset, limit, search); break;
            case 'tasks': handleTasks(ctx, offset, limit, search); break;
            case 'clients': handleClients(ctx, offset, limit, search); break;
            case 'leads': handleLeads(ctx, offset, limit, search); break;
            case 'leaves': handleLeaves(ctx, offset, limit, search); break;
            case 'meetings': handleMeetings(ctx, offset, limit, search); break;
            case 'todos': handleTodos(ctx, offset, limit, search); break;
            case 'notes': handleNotes(ctx, offset, limit, search); break;
            case 'logs': handleActivityLogs(ctx, offset, limit, search); break;
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
