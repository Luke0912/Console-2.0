import api from '@/lib/api';

export const instagramService = {
    async getOAuthUrl() {
        const response = await api.get('/instagram/oauth-url');
        return response.data.data;
    },

    async getAccountStatus() {
        const response = await api.get('/instagram/account');
        return response.data.data;
    },

    async disconnectAccount() {
        const response = await api.delete('/instagram/account');
        return response.data;
    },
};
