import { Context, Markup } from 'telegraf';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { sessionStore } from '../core/session';
import { bot } from '../core/bot';

import { sendMainMenu, getBackToMenuKeyboard } from './menu'; // Import helper
import { editOrReply } from '../utils/helper'; // Import helper

// AUTHENTICATION LOGIC

export const handleLogin = async (ctx: Context) => {
    // Expected format: /login email password
    // Or just a handler called by command
    const text = (ctx.message as any)?.text || '';
    const args = text.split(' ');
    if (args.length < 3) {
        return ctx.reply('❌ Sai cú pháp.\nSử dụng: `/login email password`', { parse_mode: 'Markdown' });
    }

    const email = args[1];
    const password = args.slice(2).join(' ');

    try {
        // 1. Login
        const response = await axios.post(`${API_BASE_URL}/api/users/login`, {
            email: email,
            password: password
        });

        if (response.data && !response.data.error) {
            const token = response.data.token;
            const userData = response.data.data;

            // 2. Fetch Permissions
            // Note: We need to pass workspace_id if required by API, defaulting to user's workspace_id
            let permissions: string[] = [];
            try {
                const permResponse = await axios.get(`${API_BASE_URL}/api/permissions`, {
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
                } else if (Array.isArray(permResponse.data.data)) {
                    // Some APIs return list of strings
                    permissions = permResponse.data.data;
                }
            } catch (permError) {
                console.error('Failed to fetch permissions:', permError);
                // Continue login even if permissions fail? Yes, but menu might be limited.
                // Or maybe default to strictly limited.
            }

            // 3. Save Session
            sessionStore.set(ctx.from!.id, {
                token: token,
                user: userData,
                permissions: permissions
            });

            try { await ctx.deleteMessage(); } catch (e) { }

            await ctx.reply(`✅ Đăng nhập thành công! Chào mừng *${userData.first_name}*.`, { parse_mode: 'Markdown' });

            // 4. Send Menu
            sendMainMenu(ctx);

        } else {
            ctx.reply('❌ Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.');
        }

    } catch (error: any) {
        console.error('Login Error:', error.response?.data || error.message);
        const errorMsg = error.response?.data?.message || 'Đã xảy ra lỗi không xác định.';
        ctx.reply(`❌ Lỗi đăng nhập: ${errorMsg}`);
    }
};

export const handleLogout = (ctx: Context) => {
    const userId = ctx.from?.id;
    if (userId && sessionStore.has(userId)) {
        sessionStore.delete(userId);
        ctx.reply('👋 Đăng xuất thành công.', Markup.removeKeyboard());
    } else {
        ctx.reply('Bạn chưa đăng nhập.');
    }
};

export const handleMe = async (ctx: Context) => {
    const userId = ctx.from?.id;
    const session = sessionStore.get(userId || 0);
    if (!session) return ctx.reply('🔒 Vui lòng đăng nhập.');

    const u = session.user;
    let msg = `👤 *Hồ Sơ Của Bạn*\n\n`;
    msg += `*Họ tên*: ${u.first_name} ${u.last_name}\n`;
    msg += `*Email*: ${u.email}\n`;
    msg += `*Vai trò*: ${u.role}\n`;
    msg += `*ID*: ${u.id}\n`;

    // Standard import to avoid require() usage
    // Circular dependency note: menu.ts does not import auth.ts, so this is safe.
    const backKeyboard = getBackToMenuKeyboard();
    editOrReply(ctx, msg, backKeyboard);
};
