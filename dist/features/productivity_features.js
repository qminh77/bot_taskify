"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTodos = exports.handleMeetings = exports.handleLeaves = exports.handleUsers = void 0;
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
// USERS
const handleUsers = async (ctx, offset = 0, limit = 5, search = '') => {
    try {
        search = parseSearchQuery(ctx, search);
        const params = { limit: limit, offset: offset };
        if (search)
            params.search = search;
        const response = await (0, api_1.authenticatedRequest)(ctx.from?.id || 0, 'get', '/api/users', {}, params);
        const users = response.data || [];
        const list = Array.isArray(users) ? users : (users.data || []);
        if (list.length === 0) {
            const msg = search ? `🔍 Không tìm thấy nhân viên nào với từ khóa: "${search}"` : '👥 Danh sách nhân viên trống.';
            return (0, helper_1.editOrReply)(ctx, msg, (0, menu_1.getBackToMenuKeyboard)());
        }
        let msg = `👥 *Danh Sách Nhân Viên* ${search ? `(Tìm: ${search})` : ''}\n\n`;
        list.slice(0, limit).forEach((u) => {
            msg += `👤 *${u.first_name} ${u.last_name}* (ID: ${u.id})\n`;
            msg += `   📧 ${u.email}\n`;
            if (u.role)
                msg += `   🛡️ ${u.role}\n`;
            msg += `   ----------------\n`;
        });
        (0, helper_1.editOrReply)(ctx, msg, getPaginationKeyboard('users', list.length, offset, limit, search));
    }
    catch (e) {
        (0, helper_1.handleError)(ctx, e);
    }
};
exports.handleUsers = handleUsers;
// LEAVES
const handleLeaves = async (ctx, offset = 0, limit = 5, search = '') => {
    try {
        search = parseSearchQuery(ctx, search);
        const params = { limit: limit, offset: offset };
        if (search)
            params.search = search;
        const response = await (0, api_1.authenticatedRequest)(ctx.from?.id || 0, 'get', '/api/leave-requests', {}, params);
        const leaves = response.data || [];
        const list = Array.isArray(leaves) ? leaves : (leaves.data || []);
        if (list.length === 0) {
            const msg = search ? `🔍 Không tìm thấy nghỉ phép: "${search}"` : '🏖️ Bạn chưa có yêu cầu nghỉ phép nào.';
            return (0, helper_1.editOrReply)(ctx, msg, (0, menu_1.getBackToMenuKeyboard)());
        }
        let msg = `🏖️ *Danh Sách Nghỉ Phép* ${search ? `(Tìm: ${search})` : ''}\n\n`;
        list.slice(0, limit).forEach((l) => {
            msg += `📅 *${l.from_date}* ➡️ *${l.to_date}*\n`;
            msg += `   📝 Lý do: ${l.reason || 'N/A'}\n`;
            const statusMap = { 0: 'Chờ duyệt', 1: 'Đã duyệt', 2: 'Từ chối' };
            msg += `   📊 Trạng thái: ${statusMap[l.status] || l.status}\n`;
            msg += `   ----------------\n`;
        });
        (0, helper_1.editOrReply)(ctx, msg, getPaginationKeyboard('leaves', list.length, offset, limit, search));
    }
    catch (e) {
        (0, helper_1.handleError)(ctx, e);
    }
};
exports.handleLeaves = handleLeaves;
// MEETINGS
const handleMeetings = async (ctx, offset = 0, limit = 5, search = '') => {
    try {
        search = parseSearchQuery(ctx, search);
        const params = { limit: limit, offset: offset };
        if (search)
            params.search = search;
        const response = await (0, api_1.authenticatedRequest)(ctx.from?.id || 0, 'get', '/api/meetings', {}, params);
        const meetings = response.data || [];
        const list = Array.isArray(meetings) ? meetings : (meetings.data || []);
        if (list.length === 0) {
            const msg = search ? `🔍 Không tìm thấy cuộc họp: "${search}"` : '📅 Bạn chưa có lịch họp nào.';
            return (0, helper_1.editOrReply)(ctx, msg, (0, menu_1.getBackToMenuKeyboard)());
        }
        let msg = `📅 *Danh Sách Lịch Họp* ${search ? `(Tìm: ${search})` : ''}\n\n`;
        list.slice(0, limit).forEach((m) => {
            msg += `🗣️ *${m.title}*\n`;
            msg += `   🕒 ${m.start_date_time} - ${m.end_date_time}\n`;
            if (m.status)
                msg += `   📊 ${m.status}\n`;
            msg += `   ----------------\n`;
        });
        (0, helper_1.editOrReply)(ctx, msg, getPaginationKeyboard('meetings', list.length, offset, limit, search));
    }
    catch (e) {
        (0, helper_1.handleError)(ctx, e);
    }
};
exports.handleMeetings = handleMeetings;
// TODOS
const handleTodos = async (ctx, offset = 0, limit = 5, search = '') => {
    try {
        search = parseSearchQuery(ctx, search);
        const params = { limit: limit, offset: offset };
        if (search)
            params.search = search;
        const response = await (0, api_1.authenticatedRequest)(ctx.from?.id || 0, 'get', '/api/todos', {}, params);
        const todos = response.data || [];
        const list = Array.isArray(todos) ? todos : (todos.data || []);
        if (list.length === 0) {
            const msg = search ? `🔍 Không tìm thấy Todo: "${search}"` : '✅ Bạn không có việc cần làm (Todos).';
            return (0, helper_1.editOrReply)(ctx, msg, (0, menu_1.getBackToMenuKeyboard)());
        }
        let msg = `✅ *Danh Sách Todos* ${search ? `(Tìm: ${search})` : ''}\n\n`;
        list.slice(0, limit).forEach((t) => {
            msg += `📌 *${t.title}*\n`;
            msg += `   🔥 Ưu tiên: ${t.priority}\n`;
            if (t.description)
                msg += `   📝 ${t.description.substring(0, 30)}...\n`;
            msg += `   📊 ${t.status || 'Chưa xong'}\n`;
            msg += `   ----------------\n`;
        });
        (0, helper_1.editOrReply)(ctx, msg, getPaginationKeyboard('todos', list.length, offset, limit, search));
    }
    catch (e) {
        (0, helper_1.handleError)(ctx, e);
    }
};
exports.handleTodos = handleTodos;
