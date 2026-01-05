"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStatistics = void 0;
const api_1 = require("../core/api");
const helper_1 = require("../utils/helper");
const menu_1 = require("./menu");
const handleStatistics = async (ctx) => {
    try {
        // Fetch stats
        const response = await (0, api_1.authenticatedRequest)(ctx.from?.id || 0, 'get', '/api/dashboard/statistics');
        const data = response.data || {};
        if (!data || Object.keys(data).length === 0) {
            return (0, helper_1.editOrReply)(ctx, '📊 Chưa có dữ liệu thống kê.', (0, menu_1.getBackToMenuKeyboard)());
        }
        let msg = `📊 *BÁO CÁO THỐNG KÊ (DASHBOARD)*\n\n`;
        // General Counts
        msg += `🔹 *Tổng quan*\n`;
        msg += `   📂 Projects: *${data.total_projects || 0}*\n`;
        msg += `   📝 Tasks: *${data.total_tasks || 0}*\n`;
        msg += `   👥 Clients: *${data.total_clients || 0}*\n`;
        msg += `   👤 Users: *${data.total_users || 0}*\n`;
        msg += `   📅 Meetings: *${data.total_meetings || 0}*\n`;
        msg += `\n`;
        // Todos status
        msg += `🔹 *Todos (Cá nhân)*\n`;
        msg += `   ✅ Hoàn thành: ${data.completed_todos || 0}\n`;
        msg += `   ⏳ Đang chờ: ${data.pending_todos || 0}\n`;
        msg += `   📌 Tổng: ${data.total_todos || 0}\n`;
        msg += `\n`;
        // Project Status Breakdown
        if (data.status_wise_projects && Array.isArray(data.status_wise_projects)) {
            msg += `🔹 *Projects theo trạng thái*\n`;
            data.status_wise_projects.forEach((s) => {
                msg += `   ▫️ ${s.title}: ${s.total_projects}\n`;
            });
            msg += `\n`;
        }
        // Task Status Breakdown
        if (data.status_wise_tasks && Array.isArray(data.status_wise_tasks)) {
            msg += `🔹 *Tasks theo trạng thái*\n`;
            data.status_wise_tasks.forEach((s) => {
                msg += `   ▫️ ${s.title}: ${s.total_tasks}\n`;
            });
        }
        (0, helper_1.editOrReply)(ctx, msg, (0, menu_1.getBackToMenuKeyboard)());
    }
    catch (e) {
        (0, helper_1.handleError)(ctx, e);
    }
};
exports.handleStatistics = handleStatistics;
