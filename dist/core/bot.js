"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bot = void 0;
const telegraf_1 = require("telegraf");
const config_1 = require("../config");
// Remove explicit agent configuration to rely on Vercel's default networking
exports.bot = new telegraf_1.Telegraf(config_1.BOT_TOKEN);
