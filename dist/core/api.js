"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticatedRequest = void 0;
const axios_1 = __importDefault(require("axios"));
const session_1 = require("./session");
const config_1 = require("../config");
// Generic Authenticated Request Helper
const authenticatedRequest = async (userId, method, endpoint, data = {}, params = {}) => {
    const session = session_1.sessionStore.get(userId);
    if (!session) {
        throw new Error('UNAUTHORIZED');
    }
    try {
        const config = {
            method: method,
            url: `${config_1.API_BASE_URL}${endpoint}`,
            headers: {
                'Authorization': `Bearer ${session.token}`,
                'Accept': 'application/json',
                'workspace_id': session.user.workspace_id
            },
            data: data,
            params: params
        };
        const response = await (0, axios_1.default)(config);
        return response.data;
    }
    catch (error) {
        if (error.response && error.response.status === 401) {
            session_1.sessionStore.delete(userId);
            throw new Error('SESSION_EXPIRED');
        }
        throw error;
    }
};
exports.authenticatedRequest = authenticatedRequest;
