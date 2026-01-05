"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleActivityLogs = exports.handleNotes = void 0;
const telegraf_1 = require("telegraf");
const api_1 = require("../core/api");
const helper_1 = require("../utils/helper");
const menu_1 = require("./menu");
// Helper to generate pagination buttons
const getPaginationKeyboard = (type, listLength, offset, limit, search) => {
    const buttons = [];
    if (offset > 0) {
        buttons.push(telegraf_1.Markup.button.callback('⬅️ Trước', `btn_${type}_page:${offset - limit}:${limit}:${search}`));
    }
    if (listLength === limit) {
        buttons.push(telegraf_1.Markup.button.callback('Sau ➡️', `btn_${type}_page:${offset + limit}:${limit}:${search}`));
    }
    return telegraf_1.Markup.inlineKeyboard([
        buttons,
        [telegraf_1.Markup.button.callback('🔍 Tìm kiếm', `btn_${type}_search`)],
        [telegraf_1.Markup.button.callback('🔙 Quay lại Menu', 'main_menu')]
    ]);
};
// Common Search Parser
const parseSearchQuery = (ctx, initialSearch) => {
    if (ctx.message && 'text' in ctx.message) {
        const text = ctx.message.text;
        const parts = text.split(' ');
        if (parts.length > 1) {
            return parts.slice(1).join(' ');
        }
    }
    return initialSearch;
};
// NOTES
const handleNotes = async (ctx, offset = 0, limit = 5, search = '') => {
    try {
        search = parseSearchQuery(ctx, search);
        const params = { limit: limit, offset: offset };
        if (search)
            params.search = search;
        // Try /api/notes first. If it fails, we might need /api/notes/list or similar, but OpenAPI suggested /api/notes/{id} for list/search?
        // Let's try /api/notes/list (common pattern) or just /api/notes
        // Based on other modules (leads used /list), let's try /api/notes. If 404, we fix.
        // Actually earlier grep showed /api/notes/{id} description "List or search notes". That looks like a single ID fetch?
        // Wait, typical Laravel resource controller: GET /api/notes usually lists.
        const response = await (0, api_1.authenticatedRequest)(ctx.from?.id || 0, 'get', '/api/notes', {}, params);
        const notes = response.data || [];
        const list = Array.isArray(notes) ? notes : (notes.data || []);
        if (list.length === 0) {
            const msg = search ? `🔍 Không tìm thấy Ghi chú: "${search}"` : '📝 Bạn chưa có ghi chú nào.';
            return (0, helper_1.editOrReply)(ctx, msg, (0, menu_1.getBackToMenuKeyboard)());
        }
        let msg = `📝 *Danh Sách Ghi chú* ${search ? `(Tìm: ${search})` : ''}\n\n`;
        list.slice(0, limit).forEach((n) => {
            msg += `📌 *${n.title}* (ID: ${n.id})\n`;
            if (n.color)
                msg += `   🎨 Color: ${n.color}\n`;
            if (n.description)
                msg += `   📄 ${n.description.substring(0, 50)}...\n`;
            msg += `   ----------------\n`;
        });
        (0, helper_1.editOrReply)(ctx, msg, getPaginationKeyboard('notes', list.length, offset, limit, search));
    }
    catch (e) {
        (0, helper_1.handleError)(ctx, e);
    }
};
exports.handleNotes = handleNotes;
// ACTIVITY LOGS
const handleActivityLogs = async (ctx, offset = 0, limit = 5, search = '') => {
    try {
        search = parseSearchQuery(ctx, search);
        const params = { limit: limit, offset: offset };
        if (search)
            params.search = search;
        // Endpoint usually /api/activity-log based on docs
        const response = await (0, api_1.authenticatedRequest)(ctx.from?.id || 0, 'get', '/api/activity-log', {}, params);
        const logs = response.data || [];
        const list = Array.isArray(logs) ? logs : (logs.data || []);
        if (list.length === 0) {
            const msg = search ? `🔍 Không tìm thấy Nhật ký: "${search}"` : '📋 Chưa có nhật ký hoạt động nào.';
            return (0, helper_1.editOrReply)(ctx, msg, (0, menu_1.getBackToMenuKeyboard)());
        }
        let msg = `📋 *Nhật ký Hoạt động* ${search ? `(Tìm: ${search})` : ''}\n\n`;
        list.slice(0, limit).forEach((log) => {
            // Check likely fields: description, message, created_at, causer_id (user)
            const description = log.description || log.message || log.activity_message || 'N/A';
            const date = log.created_at || 'N/A';
            const id = log.id;
            // Sometimes logs have 'causer' object
            const causer = log.causer ? `${log.causer.first_name} ${log.causer.last_name}` : (log.causer_id || 'System');
            msg += `🕒 *${date}*\n`;
            msg += `   👤 ${causer}\n`;
            msg += `   📝 ${description}\n`;
            msg += `   ----------------\n`;
        });
        (0, helper_1.editOrReply)(ctx, msg, getPaginationKeyboard('logs', list.length, offset, limit, search));
    }
    catch (e) {
        (0, helper_1.handleError)(ctx, e);
    }
};
exports.handleActivityLogs = handleActivityLogs;
