import { Telegraf } from 'telegraf';
import { BOT_TOKEN } from '../config';

// Remove explicit agent configuration to rely on Vercel's default networking
export const bot = new Telegraf(BOT_TOKEN);
