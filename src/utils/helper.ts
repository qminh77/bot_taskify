import { Context } from 'telegraf';

// Helper to Edit (if button click) or Reply (if command)
export const editOrReply = async (ctx: Context, text: string, extra: any) => {
    try {
        if (ctx.callbackQuery) {
            // If it's a callback query, edit the message
            await ctx.editMessageText(text, { parse_mode: 'Markdown', ...extra });
        } else {
            // If it's a command, reply
            await ctx.replyWithMarkdown(text, extra);
        }
    } catch (e: any) {
        console.error('Edit/Reply Error:', e.message);
        // Fallback: If edit fails (e.g. content same), just ignore
        // Or if message to edit is too old, maybe reply new?
        if (e.message.includes('message is not modified')) {
            return;
        }
        // Optional: if edit fails mostly likely UI/UX issue, but ignoring for now to avoid spam.
    }
};

export const handleError = (ctx: Context, error: any) => {
    if (error.message === 'UNAUTHORIZED' || error.message === 'SESSION_EXPIRED') {
        return ctx.reply('🔒 Phiên đăng nhập hết hạn hoặc chưa đăng nhập. Vui lòng đăng nhập lại.');
    }
    console.error('Command Error:', error.response?.data || error.message);
    // Use reply for errors to make sure they are seen, or alert
    if (ctx.callbackQuery) {
        ctx.answerCbQuery('❌ Lỗi: Không thể tải dữ liệu.', { show_alert: true });
    } else {
        ctx.reply('❌ Không thể thực hiện yêu cầu.');
    }
};
