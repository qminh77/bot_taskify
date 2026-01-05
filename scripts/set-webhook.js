#!/usr/bin/env node
const https = require('https');

const BOT_TOKEN = process.argv[2];
const WEBHOOK_URL = process.argv[3];

if (!BOT_TOKEN || !WEBHOOK_URL) {
    console.error('Usage: node set-webhook.js <BOT_TOKEN> <WEBHOOK_URL>');
    console.error('Example: node set-webhook.js 123456:ABC-DEF https://your-app.vercel.app/api/webhook');
    process.exit(1);
}

const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${encodeURIComponent(WEBHOOK_URL)}`;

console.log('Setting webhook to:', WEBHOOK_URL);
console.log('Request URL:', url);

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log('\nResponse:', data);
        const result = JSON.parse(data);
        if (result.ok) {
            console.log('\n✅ Webhook set successfully!');
            console.log('\nTo verify, run:');
            console.log(`node scripts/check-webhook.js ${BOT_TOKEN}`);
        } else {
            console.log('\n❌ Failed to set webhook:', result.description);
        }
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
