export interface UserSession {
    token: string;
    user: any;
    permissions: string[]; // Array of permission strings (e.g., 'manage_projects')
}

export const sessionStore = new Map<number, UserSession>();
