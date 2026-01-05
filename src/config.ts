import * as dotenv from 'dotenv';
dotenv.config();

export const BOT_TOKEN = process.env.BOT_TOKEN || '';
export const API_BASE_URL = (process.env.API_BASE_URL || 'https://dev-taskify.taskhub.company').replace(/\/$/, '');
