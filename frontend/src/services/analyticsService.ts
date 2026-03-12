import api from '@/lib/api';

export interface AnalyticsSummary {
    totalDMs: number;
    carouselsSent: number;
    productImpressions: number;
    productClicks: number;
    purchaseRedirects: number;
    webhookFailures: number;
    ctr: number;
    conversionRate: number;
}

export interface DailyStat {
    date: string;
    dms: number;
    carousels: number;
    impressions: number;
    clicks: number;
}

export const analyticsService = {
    async getSummary(params?: { startDate?: string; endDate?: string }) {
        const response = await api.get<{ success: boolean; data: AnalyticsSummary }>(
            '/analytics/summary',
            { params }
        );
        return response.data.data;
    },

    async getDailyStats(days: number = 30) {
        const response = await api.get<{ success: boolean; data: { stats: DailyStat[] } }>(
            '/analytics/daily-stats',
            { params: { days } }
        );
        return response.data.data.stats;
    },

    async getTopProducts(limit: number = 10) {
        const response = await api.get('/analytics/top-products', { params: { limit } });
        return response.data.data.products;
    },

    async getRecentActivity(limit: number = 20) {
        const response = await api.get('/analytics/recent-activity', { params: { limit } });
        return response.data.data.activity;
    },
};
