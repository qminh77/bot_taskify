import { Context, Markup } from 'telegraf';
import { authenticatedRequest } from '../core/api';
import { editOrReply, handleError } from '../utils/helper';
import { getBackToMenuKeyboard } from './menu';

// Helper to generate pagination buttons
// Format: btn_TYPE_page:offset:limit:search
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

// Common logic to parse search query from command
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

// PROJECTS
export const handleProjects = async (ctx: Context, offset: number = 0, limit: number = 5, search: string = '') => {
    try {
        search = parseSearchQuery(ctx, search);
        const params: any = { limit: limit, offset: offset };
        if (search) params.search = search; // API typically supports ?search=...

        const response: any = await authenticatedRequest(ctx.from?.id || 0, 'get', '/api/projects', {}, params);
        const projects = response.data || [];

        if (projects.length === 0) {
            const msg = search ? `🔍 Không tìm thấy dự án nào với từ khóa: "${search}"` : '📂 Bạn chưa có dự án nào.';
            return editOrReply(ctx, msg, getBackToMenuKeyboard());
        }

        let msg = `📂 *Danh Sách Dự Án* ${search ? `(Tìm: ${search})` : ''}\n\n`;
        projects.forEach((p: any) => {
            msg += `🔹 *${p.title}* (ID: ${p.id})\n`;
            msg += `   Status: ${p.status} | Priority: ${p.priority}\n`;
            msg += `   ----------------\n`;
        });
        editOrReply(ctx, msg, getPaginationKeyboard('projects', projects.length, offset, limit, search));
    } catch (e: any) { handleError(ctx, e); }
};

// TASKS
export const handleTasks = async (ctx: Context, offset: number = 0, limit: number = 5, search: string = '') => {
    try {
        search = parseSearchQuery(ctx, search);
        const params: any = { limit: limit, offset: offset };
        if (search) params.search = search;

        const response: any = await authenticatedRequest(ctx.from?.id || 0, 'get', '/api/tasks', {}, params);
        const tasks = response.data || [];

        if (tasks.length === 0) {
            const msg = search ? `🔍 Không tìm thấy Task nào với: "${search}"` : '📝 Bạn chưa có công việc nào.';
            return editOrReply(ctx, msg, getBackToMenuKeyboard());
        }

        let msg = `📝 *Danh Sách Công Việc* ${search ? `(Tìm: ${search})` : ''}\n\n`;
        tasks.forEach((t: any) => {
            msg += `📌 *${t.title}* (ID: ${t.id})\n`;
            msg += `   Status: ${t.status} | Priority: ${t.priority}\n`;
            msg += `   Deadline: ${t.due_date || 'N/A'}\n`;
            msg += `   ----------------\n`;
        });
        editOrReply(ctx, msg, getPaginationKeyboard('tasks', tasks.length, offset, limit, search));
    } catch (e: any) { handleError(ctx, e); }
};

// CLIENTS
export const handleClients = async (ctx: Context, offset: number = 0, limit: number = 5, search: string = '') => {
    try {
        search = parseSearchQuery(ctx, search);
        const params: any = { limit: limit, offset: offset };
        if (search) params.search = search;

        const response: any = await authenticatedRequest(ctx.from?.id || 0, 'get', '/api/clients', {}, params);
        const clients = response.data || [];

        if (clients.length === 0) {
            const msg = search ? `🔍 Không tìm thấy Client: "${search}"` : '👥 Bạn chưa có khách hàng nào.';
            return editOrReply(ctx, msg, getBackToMenuKeyboard());
        }

        let msg = `👥 *Danh Sách Khách Hàng* ${search ? `(Tìm: ${search})` : ''}\n\n`;
        clients.forEach((c: any) => {
            const name = `${c.first_name} ${c.last_name}`;
            msg += `👤 *${name}* (ID: ${c.id})\n`;
            msg += `   🏢 Công ty: ${c.company_name || 'N/A'}\n`;
            msg += `   📧 Email: ${c.email}\n`;
            msg += `   ----------------\n`;
        });
        editOrReply(ctx, msg, getPaginationKeyboard('clients', clients.length, offset, limit, search));
    } catch (e: any) { handleError(ctx, e); }
};

// LEADS
export const handleLeads = async (ctx: Context, offset: number = 0, limit: number = 5, search: string = '') => {
    try {
        search = parseSearchQuery(ctx, search);
        const params: any = { limit: limit, offset: offset };
        if (search) params.search = search;

        const response: any = await authenticatedRequest(ctx.from?.id || 0, 'get', '/api/leads/list', {}, params); // Corrected endpoint
        const leads = response.data || [];

        if (leads.length === 0) {
            const msg = search ? `🔍 Không tìm thấy Lead: "${search}"` : '🎯 Bạn chưa có khách hàng tiềm năng nào.';
            return editOrReply(ctx, msg, getBackToMenuKeyboard());
        }

        let msg = `🎯 *Danh Sách Leads* ${search ? `(Tìm: ${search})` : ''}\n\n`;
        leads.forEach((l: any) => {
            const name = l.first_name ? `${l.first_name} ${l.last_name}` : (l.name || 'No Name');
            msg += `🌟 *${name}* (ID: ${l.id})\n`;
            msg += `   🏢 Công ty: ${l.company || l.company_name || 'N/A'}\n`;
            msg += `   📊 Trạng thái: ${l.status || 'Mới'}\n`;
            msg += `   ----------------\n`;
        });
        editOrReply(ctx, msg, getPaginationKeyboard('leads', leads.length, offset, limit, search));
    } catch (e: any) { handleError(ctx, e); }
};
