import { Telegraf } from 'telegraf';
import * as https from 'https';
import { BOT_TOKEN } from '../config';

export const bot = new Telegraf(BOT_TOKEN, {
    telegram: {
        agent: new https.Agent({ family: 4 })
    }
});
