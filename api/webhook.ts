import { bot } from '../src/core/bot';
import { setupBot } from '../src/setup';
import { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize bot logic once
setupBot(bot);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        if (req.method === 'POST') {
            // Process the update
            await bot.handleUpdate(req.body, res);
            // Assuming handleUpdate handles the response, or we just return ok
            if (!res.headersSent) {
                res.status(200).send('OK');
            }
        } else {
            // Basic greeting for GET
            res.status(200).send('E-NG Telegram Bot is up and running!');
        }
    } catch (e) {
        console.error('Webhook error:', e);
        res.status(500).send('Error');
    }
}
