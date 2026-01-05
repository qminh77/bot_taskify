"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLeads = exports.handleClients = exports.handleTasks = exports.handleProjects = void 0;
const telegraf_1 = require("telegraf");
const api_1 = require("../core/api");
const helper_1 = require("../utils/helper");
const menu_1 = require("./menu");
// Helper to generate pagination buttons
// Format: btn_TYPE_page:offset:limit:search
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
// Common logic to parse search query from command
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
// PROJECTS
const handleProjects = async (ctx, offset = 0, limit = 5, search = '') => {
    try {
        search = parseSearchQuery(ctx, search);
        const params = { limit: limit, offset: offset };
        if (search)
            params.search = search; // API typically supports ?search=...
        const response = await (0, api_1.authenticatedRequest)(ctx.from?.id || 0, 'get', '/api/projects', {}, params);
        const projects = response.data || [];
        if (projects.length === 0) {
            const msg = search ? `🔍 Không tìm thấy dự án nào với từ khóa: "${search}"` : '📂 Bạn chưa có dự án nào.';
            return (0, helper_1.editOrReply)(ctx, msg, (0, menu_1.getBackToMenuKeyboard)());
        }
        let msg = `📂 *Danh Sách Dự Án* ${search ? `(Tìm: ${search})` : ''}\n\n`;
        projects.forEach((p) => {
            msg += `🔹 *${p.title}* (ID: ${p.id})\n`;
            msg += `   Status: ${p.status} | Priority: ${p.priority}\n`;
            msg += `   ----------------\n`;
        });
        (0, helper_1.editOrReply)(ctx, msg, getPaginationKeyboard('projects', projects.length, offset, limit, search));
    }
    catch (e) {
        (0, helper_1.handleError)(ctx, e);
    }
};
exports.handleProjects = handleProjects;
// TASKS
const handleTasks = async (ctx, offset = 0, limit = 5, search = '') => {
    try {
        search = parseSearchQuery(ctx, search);
        const params = { limit: limit, offset: offset };
        if (search)
            params.search = search;
        const response = await (0, api_1.authenticatedRequest)(ctx.from?.id || 0, 'get', '/api/tasks', {}, params);
        const tasks = response.data || [];
        if (tasks.length === 0) {
            const msg = search ? `🔍 Không tìm thấy Task nào với: "${search}"` : '📝 Bạn chưa có công việc nào.';
            return (0, helper_1.editOrReply)(ctx, msg, (0, menu_1.getBackToMenuKeyboard)());
        }
        let msg = `📝 *Danh Sách Công Việc* ${search ? `(Tìm: ${search})` : ''}\n\n`;
        tasks.forEach((t) => {
            msg += `📌 *${t.title}* (ID: ${t.id})\n`;
            msg += `   Status: ${t.status} | Priority: ${t.priority}\n`;
            msg += `   Deadline: ${t.due_date || 'N/A'}\n`;
            msg += `   ----------------\n`;
        });
        (0, helper_1.editOrReply)(ctx, msg, getPaginationKeyboard('tasks', tasks.length, offset, limit, search));
    }
    catch (e) {
        (0, helper_1.handleError)(ctx, e);
    }
};
exports.handleTasks = handleTasks;
// CLIENTS
const handleClients = async (ctx, offset = 0, limit = 5, search = '') => {
    try {
        search = parseSearchQuery(ctx, search);
        const params = { limit: limit, offset: offset };
        if (search)
            params.search = search;
        const response = await (0, api_1.authenticatedRequest)(ctx.from?.id || 0, 'get', '/api/clients', {}, params);
        const clients = response.data || [];
        if (clients.length === 0) {
            const msg = search ? `🔍 Không tìm thấy Client: "${search}"` : '👥 Bạn chưa có khách hàng nào.';
            return (0, helper_1.editOrReply)(ctx, msg, (0, menu_1.getBackToMenuKeyboard)());
        }
        let msg = `👥 *Danh Sách Khách Hàng* ${search ? `(Tìm: ${search})` : ''}\n\n`;
        clients.forEach((c) => {
            const name = `${c.first_name} ${c.last_name}`;
            msg += `👤 *${name}* (ID: ${c.id})\n`;
            msg += `   🏢 Công ty: ${c.company_name || 'N/A'}\n`;
            msg += `   📧 Email: ${c.email}\n`;
            msg += `   ----------------\n`;
        });
        (0, helper_1.editOrReply)(ctx, msg, getPaginationKeyboard('clients', clients.length, offset, limit, search));
    }
    catch (e) {
        (0, helper_1.handleError)(ctx, e);
    }
};
exports.handleClients = handleClients;
// LEADS
const handleLeads = async (ctx, offset = 0, limit = 5, search = '') => {
    try {
        search = parseSearchQuery(ctx, search);
        const params = { limit: limit, offset: offset };
        if (search)
            params.search = search;
        const response = await (0, api_1.authenticatedRequest)(ctx.from?.id || 0, 'get', '/api/leads/list', {}, params); // Corrected endpoint
        const leads = response.data || [];
        if (leads.length === 0) {
            const msg = search ? `🔍 Không tìm thấy Lead: "${search}"` : '🎯 Bạn chưa có khách hàng tiềm năng nào.';
            return (0, helper_1.editOrReply)(ctx, msg, (0, menu_1.getBackToMenuKeyboard)());
        }
        let msg = `🎯 *Danh Sách Leads* ${search ? `(Tìm: ${search})` : ''}\n\n`;
        leads.forEach((l) => {
            const name = l.first_name ? `${l.first_name} ${l.last_name}` : (l.name || 'No Name');
            msg += `🌟 *${name}* (ID: ${l.id})\n`;
            msg += `   🏢 Công ty: ${l.company || l.company_name || 'N/A'}\n`;
            msg += `   📊 Trạng thái: ${l.status || 'Mới'}\n`;
            msg += `   ----------------\n`;
        });
        (0, helper_1.editOrReply)(ctx, msg, getPaginationKeyboard('leads', leads.length, offset, limit, search));
    }
    catch (e) {
        (0, helper_1.handleError)(ctx, e);
    }
};
exports.handleLeads = handleLeads;
