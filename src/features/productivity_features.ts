import { Context, Markup } from 'telegraf';
import { authenticatedRequest } from '../core/api';
import { editOrReply, handleError } from '../utils/helper';
import { getBackToMenuKeyboard } from './menu';

// Helper to generate pagination buttons
const getPaginationKeyboard = (type: string, listLength: number, offset: number, limit: number, search: string) => {
    const buttons = [];
    if (offset > 0) {
        buttons.push(Markup.button.callback('⬅️ Trước', `btn_${type}_page:${offset - limit}:${limit}:${search}`));
    }
    if (listLength === limit) {
        buttons.push(Markup.button.callback('Sau ➡️', `btn_${type}_page:${offset + limit}:${limit}:${search}`));
    }
    return Markup.inlineKeyboard([
        buttons,
        [Markup.button.callback('🔍 Tìm kiếm', `btn_${type}_search`)],
        [Markup.button.callback('🔙 Quay lại Menu', 'main_menu')]
    ]);
};

const parseSearchQuery = (ctx: Context, initialSearch: string) => {
    if (ctx.message && 'text' in ctx.message) {
        const text = (ctx.message as any).text;
        const parts = text.split(' ');
        if (parts.length > 1) {
            return parts.slice(1).join(' ');
        }
    }
    return initialSearch;
};

// USERS
export const handleUsers = async (ctx: Context, offset: number = 0, limit: number = 5, search: string = '') => {
    try {
        search = parseSearchQuery(ctx, search);
        const params: any = { limit: limit, offset: offset };
        if (search) params.search = search;

        const response: any = await authenticatedRequest(ctx.from?.id || 0, 'get', '/api/users', {}, params);

        const users = response.data || [];
        const list = Array.isArray(users) ? users : (users.data || []);

        if (list.length === 0) {
            const msg = search ? `🔍 Không tìm thấy nhân viên nào với từ khóa: "${search}"` : '👥 Danh sách nhân viên trống.';
            return editOrReply(ctx, msg, getBackToMenuKeyboard());
        }

        let msg = `👥 *Danh Sách Nhân Viên* ${search ? `(Tìm: ${search})` : ''}\n\n`;
        list.slice(0, limit).forEach((u: any) => {
            msg += `👤 *${u.first_name} ${u.last_name}* (ID: ${u.id})\n`;
            msg += `   📧 ${u.email}\n`;
            if (u.role) msg += `   🛡️ ${u.role}\n`;
            msg += `   ----------------\n`;
        });
        editOrReply(ctx, msg, getPaginationKeyboard('users', list.length, offset, limit, search));
    } catch (e: any) { handleError(ctx, e); }
};

// LEAVES
export const handleLeaves = async (ctx: Context, offset: number = 0, limit: number = 5, search: string = '') => {
    try {
        search = parseSearchQuery(ctx, search);
        const params: any = { limit: limit, offset: offset };
        if (search) params.search = search;

        const response: any = await authenticatedRequest(ctx.from?.id || 0, 'get', '/api/leave-requests', {}, params);
        const leaves = response.data || [];
        const list = Array.isArray(leaves) ? leaves : (leaves.data || []);

        if (list.length === 0) {
            const msg = search ? `🔍 Không tìm thấy nghỉ phép: "${search}"` : '🏖️ Bạn chưa có yêu cầu nghỉ phép nào.';
            return editOrReply(ctx, msg, getBackToMenuKeyboard());
        }

        let msg = `🏖️ *Danh Sách Nghỉ Phép* ${search ? `(Tìm: ${search})` : ''}\n\n`;
        list.slice(0, limit).forEach((l: any) => {
            msg += `📅 *${l.from_date}* ➡️ *${l.to_date}*\n`;
            msg += `   📝 Lý do: ${l.reason || 'N/A'}\n`;
            const statusMap: { [key: number]: string } = { 0: 'Chờ duyệt', 1: 'Đã duyệt', 2: 'Từ chối' };
            msg += `   📊 Trạng thái: ${statusMap[l.status] || l.status}\n`;
            msg += `   ----------------\n`;
        });
        editOrReply(ctx, msg, getPaginationKeyboard('leaves', list.length, offset, limit, search));
    } catch (e: any) { handleError(ctx, e); }
};

// MEETINGS
export const handleMeetings = async (ctx: Context, offset: number = 0, limit: number = 5, search: string = '') => {
    try {
        search = parseSearchQuery(ctx, search);
        const params: any = { limit: limit, offset: offset };
        if (search) params.search = search;

        const response: any = await authenticatedRequest(ctx.from?.id || 0, 'get', '/api/meetings', {}, params);
        const meetings = response.data || [];
        const list = Array.isArray(meetings) ? meetings : (meetings.data || []);

        if (list.length === 0) {
            const msg = search ? `🔍 Không tìm thấy cuộc họp: "${search}"` : '📅 Bạn chưa có lịch họp nào.';
            return editOrReply(ctx, msg, getBackToMenuKeyboard());
        }

        let msg = `📅 *Danh Sách Lịch Họp* ${search ? `(Tìm: ${search})` : ''}\n\n`;
        list.slice(0, limit).forEach((m: any) => {
            msg += `🗣️ *${m.title}*\n`;
            msg += `   🕒 ${m.start_date_time} - ${m.end_date_time}\n`;
            if (m.status) msg += `   📊 ${m.status}\n`;
            msg += `   ----------------\n`;
        });
        editOrReply(ctx, msg, getPaginationKeyboard('meetings', list.length, offset, limit, search));
    } catch (e: any) { handleError(ctx, e); }
};

// TODOS
export const handleTodos = async (ctx: Context, offset: number = 0, limit: number = 5, search: string = '') => {
    try {
        search = parseSearchQuery(ctx, search);
        const params: any = { limit: limit, offset: offset };
        if (search) params.search = search;

        const response: any = await authenticatedRequest(ctx.from?.id || 0, 'get', '/api/todos', {}, params);
        const todos = response.data || [];
        const list = Array.isArray(todos) ? todos : (todos.data || []);

        if (list.length === 0) {
            const msg = search ? `🔍 Không tìm thấy Todo: "${search}"` : '✅ Bạn không có việc cần làm (Todos).';
            return editOrReply(ctx, msg, getBackToMenuKeyboard());
        }

        let msg = `✅ *Danh Sách Todos* ${search ? `(Tìm: ${search})` : ''}\n\n`;
        list.slice(0, limit).forEach((t: any) => {
            msg += `📌 *${t.title}*\n`;
            msg += `   🔥 Ưu tiên: ${t.priority}\n`;
            if (t.description) msg += `   📝 ${t.description.substring(0, 30)}...\n`;
            msg += `   📊 ${t.status || 'Chưa xong'}\n`;
            msg += `   ----------------\n`;
        });
        editOrReply(ctx, msg, getPaginationKeyboard('todos', list.length, offset, limit, search));
    } catch (e: any) { handleError(ctx, e); }
};
