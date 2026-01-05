"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMainMenu = exports.getBackToMenuKeyboard = void 0;
const telegraf_1 = require("telegraf");
const session_1 = require("../core/session");
const helper_1 = require("../utils/helper");
const getBackToMenuKeyboard = () => {
    return telegraf_1.Markup.inlineKeyboard([
        telegraf_1.Markup.button.callback('🔙 Quay lại Menu', 'main_menu')
    ]);
};
exports.getBackToMenuKeyboard = getBackToMenuKeyboard;
// Map features to necessary permissions (OR logic for array of perms? or SINGLE perm)
// If permission is empty string, IT IS PUBLIC/OPEN for logged in users.
const MENU_ITEMS = [
    { label: '📂 Projects', callback: 'btn_projects', permission: 'manage_projects' },
    { label: '📝 Tasks', callback: 'btn_tasks', permission: 'manage_tasks' },
    { label: '👥 Clients', callback: 'btn_clients', permission: 'manage_clients' },
    { label: '🎯 Leads', callback: 'btn_leads', permission: 'manage_clients' }, // Assuming clients perm covers leads or 'manage_leads'
    { label: '👤 Users', callback: 'btn_users', permission: 'manage_users' },
    { label: '🏖️ Leaves', callback: 'btn_leaves', permission: '' }, // Everyone has leaves usually? or 'manage_leave_requests' for VIEWING ALL? 
    // Wait, list leaves usually lists YOUR leaves.
    // Let's assume basic features (Leaves, Meetings, Todos) are for everyone.
    { label: '📊 Báo cáo (Stats)', callback: 'btn_stats', permission: '' }, // Should be available to everyone or 'view_dashboard'?
    { label: '📝 Ghi chú (Notes)', callback: 'btn_notes', permission: '' },
    { label: '📋 Nhật ký (Logs)', callback: 'btn_logs', permission: '' }, // Add permission if needed e.g. 'manage_activity_log'
    { label: '📅 Meetings', callback: 'btn_meetings', permission: '' },
    { label: '✅ Todos', callback: 'btn_todos', permission: '' },
];
const sendMainMenu = async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId)
        return;
    const session = session_1.sessionStore.get(userId);
    if (!session) {
        return ctx.reply('🔒 Bạn chưa đăng nhập. Vui lòng đăng nhập bằng lệnh `/login email password`.', { parse_mode: 'Markdown' });
    }
    const { user, permissions } = session;
    const name = user.first_name || 'User';
    const role = user.role; // e.g., 'admin'
    const msg = `🤖 *E-NG Systems Dashboard*\n\nXin chào *${name}*, bạn muốn làm gì hôm nay?`;
    // Filter Buttons based on Permissions
    // If user is 'admin', show everything? Or strictly follow permissions?
    // Often admins have all permissions in the list, or we bypass check.
    const isAdmin = role === 'admin';
    const visibleItems = MENU_ITEMS.filter(item => {
        if (isAdmin)
            return true;
        if (!item.permission)
            return true; // Public/Common feature
        return permissions.includes(item.permission);
    });
    // Always add Profile and Logout
    const bottomRow = [
        telegraf_1.Markup.button.callback('👤 Hồ sơ (Me)', 'btn_me'),
        telegraf_1.Markup.button.callback('👋 Đăng xuất', 'logout_action')
    ];
    // Build Grid
    const buttons = visibleItems.map(item => telegraf_1.Markup.button.callback(item.label, item.callback));
    // Chunk into pairs
    const grid = [];
    for (let i = 0; i < buttons.length; i += 2) {
        grid.push(buttons.slice(i, i + 2));
    }
    grid.push(bottomRow);
    await (0, helper_1.editOrReply)(ctx, msg, telegraf_1.Markup.inlineKeyboard(grid));
};
exports.sendMainMenu = sendMainMenu;
