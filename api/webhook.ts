import { bot } from '../src/core/bot';
import { setupBot } from '../src/setup';
import { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize bot logic once
setupBot(bot);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        if (req.method === 'POST') {
            const body = req.body;
            console.log('Received Update:', JSON.stringify(body, null, 2));

            if (!body) {
                console.error('Request body is empty');
                res.status(400).send('Bad Request: Empty Body');
                return;
            }

            // Process the update
            // Note: We do NOT pass 'res' here to avoid Webhook Reply optimization issues on Serverless.
            // We force Telegraf to make standard API calls.
            await bot.handleUpdate(body);

            res.status(200).send('OK');
        } else {
            // Basic greeting for GET
            res.status(200).send(`E-NG Telegram Bot is up and running! Timestamp: ${new Date().toISOString()}`);
        }
    } catch (e: any) {
        console.error('Webhook error:', e);
        res.status(500).send(`Error: ${e.message}`);
    }
}
