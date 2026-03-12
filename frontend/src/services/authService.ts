import api from '@/lib/api';

export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    companyName: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export const authService = {
    async register(data: RegisterData) {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    async login(data: LoginData) {
        const response = await api.post('/auth/login', data);
        return response.data;
    },

    async logout() {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    async getCurrentUser() {
        const response = await api.get('/auth/me');
        return response.data;
    },

    async refreshToken() {
        const response = await api.post('/auth/refresh-token');
        return response.data;
    },
};
