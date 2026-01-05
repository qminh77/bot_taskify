#!/usr/bin/env node
const https = require('https');

const BOT_TOKEN = process.argv[2];

if (!BOT_TOKEN) {
    console.error('Usage: node check-webhook.js <BOT_TOKEN>');
    console.error('Example: node check-webhook.js 123456:ABC-DEF');
    process.exit(1);
}

const url = `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`;

console.log('Checking webhook status...\n');

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        const result = JSON.parse(data);
        if (result.ok) {
            const info = result.result;
            console.log('✅ Webhook Info:');
            console.log('  URL:', info.url || '(not set)');
            console.log('  Pending Updates:', info.pending_update_count);
            console.log('  Last Error Date:', info.last_error_date ? new Date(info.last_error_date * 1000).toISOString() : 'None');
            console.log('  Last Error Message:', info.last_error_message || 'None');

            if (!info.url) {
                console.log('\n⚠️  Webhook is not set! Please run set-webhook.js first.');
            } else if (info.last_error_message) {
                console.log('\n❌ There are errors with the webhook. Check the message above.');
            } else {
                console.log('\n✅ Webhook is healthy!');
            }
        } else {
            console.log('❌ Failed to get webhook info:', result.description);
        }
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
