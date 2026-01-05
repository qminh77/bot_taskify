"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMe = exports.handleLogout = exports.handleLogin = void 0;
const telegraf_1 = require("telegraf");
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
const session_1 = require("../core/session");
const menu_1 = require("./menu"); // Import helper
const helper_1 = require("../utils/helper"); // Import helper
// AUTHENTICATION LOGIC
const handleLogin = async (ctx) => {
    // Expected format: /login email password
    // Or just a handler called by command
    const text = ctx.message?.text || '';
    const args = text.split(' ');
    if (args.length < 3) {
        return ctx.reply('❌ Sai cú pháp.\nSử dụng: `/login email password`', { parse_mode: 'Markdown' });
    }
    const email = args[1];
    const password = args.slice(2).join(' ');
    try {
        // 1. Login
        const response = await axios_1.default.post(`${config_1.API_BASE_URL}/api/users/login`, {
            email: email,
            password: password
        });
        if (response.data && !response.data.error) {
            const token = response.data.token;
            const userData = response.data.data;
            // 2. Fetch Permissions
            // Note: We need to pass workspace_id if required by API, defaulting to user's workspace_id
            let permissions = [];
            try {
                const permResponse = await axios_1.default.get(`${config_1.API_BASE_URL}/api/permissions`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'workspace_id': userData.workspace_id
                    }
                });
                // Assuming format: { data: { permissions: { create_projects: true, ... } } }
                // We need to convert this object to an array of keys where value is true
                if (permResponse.data && permResponse.data.data && permResponse.data.data.permissions) {
                    const permObj = permResponse.data.data.permissions;
                    permissions = Object.keys(permObj).filter(key => permObj[key] === true || permObj[key] === 1);
                }
                else if (Array.isArray(permResponse.data.data)) {
                    // Some APIs return list of strings
                    permissions = permResponse.data.data;
                }
            }
            catch (permError) {
                console.error('Failed to fetch permissions:', permError);
                // Continue login even if permissions fail? Yes, but menu might be limited.
                // Or maybe default to strictly limited.
            }
            // 3. Save Session
            session_1.sessionStore.set(ctx.from.id, {
                token: token,
                user: userData,
                permissions: permissions
            });
            try {
                await ctx.deleteMessage();
            }
            catch (e) { }
            await ctx.reply(`✅ Đăng nhập thành công! Chào mừng *${userData.first_name}*.`, { parse_mode: 'Markdown' });
            // 4. Send Menu
            (0, menu_1.sendMainMenu)(ctx);
        }
        else {
            ctx.reply('❌ Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.');
        }
    }
    catch (error) {
        console.error('Login Error:', error.response?.data || error.message);
        const errorMsg = error.response?.data?.message || 'Đã xảy ra lỗi không xác định.';
        ctx.reply(`❌ Lỗi đăng nhập: ${errorMsg}`);
    }
};
exports.handleLogin = handleLogin;
const handleLogout = (ctx) => {
    const userId = ctx.from?.id;
    if (userId && session_1.sessionStore.has(userId)) {
        session_1.sessionStore.delete(userId);
        ctx.reply('👋 Đăng xuất thành công.', telegraf_1.Markup.removeKeyboard());
    }
    else {
        ctx.reply('Bạn chưa đăng nhập.');
    }
};
exports.handleLogout = handleLogout;
const handleMe = async (ctx) => {
    const userId = ctx.from?.id;
    const session = session_1.sessionStore.get(userId || 0);
    if (!session)
        return ctx.reply('🔒 Vui lòng đăng nhập.');
    const u = session.user;
    let msg = `👤 *Hồ Sơ Của Bạn*\n\n`;
    msg += `*Họ tên*: ${u.first_name} ${u.last_name}\n`;
    msg += `*Email*: ${u.email}\n`;
    msg += `*Vai trò*: ${u.role}\n`;
    msg += `*ID*: ${u.id}\n`;
    // Standard import to avoid require() usage
    // Circular dependency note: menu.ts does not import auth.ts, so this is safe.
    const backKeyboard = (0, menu_1.getBackToMenuKeyboard)();
    (0, helper_1.editOrReply)(ctx, msg, backKeyboard);
};
exports.handleMe = handleMe;
