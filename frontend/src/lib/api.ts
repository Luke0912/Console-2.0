import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
    baseURL: `${API_URL}/api`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Don't retry logout or refresh-token requests
        if (
            originalRequest.url?.includes('/auth/logout') ||
            originalRequest.url?.includes('/auth/refresh-token') ||
            originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/register')
        ) {
            return Promise.reject(error);
        }

        // If 401 error, redirect to login immediately
        if (error.response?.status === 401) {
            // Clear any stored state
            localStorage.clear();
            sessionStorage.clear();

            // Redirect to login
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }

            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

export default api;
