import { Context } from 'telegraf';
import { authenticatedRequest } from '../core/api';
import { editOrReply, handleError } from '../utils/helper';
import { getBackToMenuKeyboard } from './menu';

export const handleStatistics = async (ctx: Context) => {
    try {
        // Fetch stats
        const response: any = await authenticatedRequest(ctx.from?.id || 0, 'get', '/api/dashboard/statistics');
        const data = response.data || {};

        if (!data || Object.keys(data).length === 0) {
            return editOrReply(ctx, '📊 Chưa có dữ liệu thống kê.', getBackToMenuKeyboard());
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
            data.status_wise_projects.forEach((s: any) => {
                msg += `   ▫️ ${s.title}: ${s.total_projects}\n`;
            });
            msg += `\n`;
        }

        // Task Status Breakdown
        if (data.status_wise_tasks && Array.isArray(data.status_wise_tasks)) {
            msg += `🔹 *Tasks theo trạng thái*\n`;
            data.status_wise_tasks.forEach((s: any) => {
                msg += `   ▫️ ${s.title}: ${s.total_tasks}\n`;
            });
        }

        editOrReply(ctx, msg, getBackToMenuKeyboard());

    } catch (e: any) { handleError(ctx, e); }
};
