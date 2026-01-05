import axios from 'axios';
import { sessionStore } from './session';
import { API_BASE_URL } from '../config';

// Generic Authenticated Request Helper
export const authenticatedRequest = async (userId: number, method: 'get' | 'post', endpoint: string, data: any = {}, params: any = {}) => {
    const session = sessionStore.get(userId);
    if (!session) {
        throw new Error('UNAUTHORIZED');
    }

    try {
        const config = {
            method: method,
            url: `${API_BASE_URL}${endpoint}`,
            headers: {
                'Authorization': `Bearer ${session.token}`,
                'Accept': 'application/json',
                'workspace_id': session.user.workspace_id
            },
            data: data,
            params: params
        };
        const response = await axios(config);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.status === 401) {
            sessionStore.delete(userId);
            throw new Error('SESSION_EXPIRED');
        }
        throw error;
    }
};
