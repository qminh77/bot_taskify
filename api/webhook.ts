import { bot } from '../src/core/bot';
import { setupBot } from '../src/setup';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { BOT_TOKEN } from '../src/config';

// Initialize bot logic once
setupBot(bot);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        if (req.method === 'POST') {
            const body = req.body;
            console.log('LOG: Webhook triggered');

            // Check Token
            if (!BOT_TOKEN) {
                console.error('CRITICAL: BOT_TOKEN is missing in environment variables');
            } else {
                console.log('LOG: BOT_TOKEN is present (starts with ' + BOT_TOKEN.substring(0, 5) + '...)');
            }

            console.log('LOG: Update Body:', JSON.stringify(body, null, 2));

            if (!body) {
                console.error('LOG: Request body is empty');
                res.status(400).send('Bad Request: Empty Body');
                return;
            }

            // Process the update
            console.log('LOG: Handing update to bot...');
            await bot.handleUpdate(body);
            console.log('LOG: Update processed successfully');

            res.status(200).send('OK');
        } else {
            // Basic greeting for GET
            res.status(200).send(`E-NG Telegram Bot is up and running! Timestamp: ${new Date().toISOString()}`);
        }
    } catch (e: any) {
        console.error('CRITICAL: Webhook Handler Error:', e);
        console.error('Stack:', e.stack);
        res.status(500).send(`Error: ${e.message}`);
    }
}
