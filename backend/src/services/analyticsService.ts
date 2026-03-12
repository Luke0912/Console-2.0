import AnalyticsEvent, {
    IAnalyticsEvent,
    AnalyticsEventType,
} from '../models/AnalyticsEvent';
import MessageEvent from '../models/MessageEvent';
import Product from '../models/Product';
import { startOfDay, endOfDay, subDays } from 'date-fns';

interface TrackEventData {
    company: string;
    eventType: AnalyticsEventType;
    product?: string;
    messageEvent?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}

interface AnalyticsSummary {
    totalDMs: number;
    carouselsSent: number;
    productImpressions: number;
    productClicks: number;
    purchaseRedirects: number;
    webhookFailures: number;
    ctr: number; // Click-through rate
    conversionRate: number;
}

interface DailyStats {
    date: string;
    dms: number;
    carousels: number;
    impressions: number;
    clicks: number;
}

/**
 * Track an analytics event
 */
export const trackEvent = async (data: TrackEventData): Promise<IAnalyticsEvent> => {
    const event = await AnalyticsEvent.create(data);
    return event;
};

/**
 * Get analytics summary for a company
 */
export const getAnalyticsSummary = async (
    companyId: string,
    startDate?: Date,
    endDate?: Date
): Promise<AnalyticsSummary> => {
    const filter: any = { company: companyId };

    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = startOfDay(startDate);
        if (endDate) filter.createdAt.$lte = endOfDay(endDate);
    }

    const [
        totalDMs,
        carouselsSent,
        productImpressions,
        productClicks,
        purchaseRedirects,
        webhookFailures,
    ] = await Promise.all([
        AnalyticsEvent.countDocuments({
            ...filter,
            eventType: AnalyticsEventType.DM_RECEIVED,
        }),
        AnalyticsEvent.countDocuments({
            ...filter,
            eventType: AnalyticsEventType.CAROUSEL_SENT,
        }),
        AnalyticsEvent.countDocuments({
            ...filter,
            eventType: AnalyticsEventType.PRODUCT_IMPRESSION,
        }),
        AnalyticsEvent.countDocuments({
            ...filter,
            eventType: AnalyticsEventType.PRODUCT_CLICK,
        }),
        AnalyticsEvent.countDocuments({
            ...filter,
            eventType: AnalyticsEventType.PURCHASE_REDIRECT,
        }),
        AnalyticsEvent.countDocuments({
            ...filter,
            eventType: AnalyticsEventType.WEBHOOK_FAILURE,
        }),
    ]);

    const ctr = productImpressions > 0 ? (productClicks / productImpressions) * 100 : 0;
    const conversionRate =
        productClicks > 0 ? (purchaseRedirects / productClicks) * 100 : 0;

    return {
        totalDMs,
        carouselsSent,
        productImpressions,
        productClicks,
        purchaseRedirects,
        webhookFailures,
        ctr: parseFloat(ctr.toFixed(2)),
        conversionRate: parseFloat(conversionRate.toFixed(2)),
    };
};

/**
 * Get daily analytics stats
 */
export const getDailyStats = async (
    companyId: string,
    days: number = 30
): Promise<DailyStats[]> => {
    const startDate = startOfDay(subDays(new Date(), days));
    const endDate = endOfDay(new Date());

    const aggregation = await AnalyticsEvent.aggregate([
        {
            $match: {
                company: companyId,
                createdAt: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    eventType: '$eventType',
                },
                count: { $sum: 1 },
            },
        },
        {
            $group: {
                _id: '$_id.date',
                events: {
                    $push: {
                        type: '$_id.eventType',
                        count: '$count',
                    },
                },
            },
        },
        {
            $sort: { _id: 1 },
        },
    ]);

    const stats: DailyStats[] = aggregation.map((item) => {
        const eventMap = item.events.reduce((acc: any, event: any) => {
            acc[event.type] = event.count;
            return acc;
        }, {});

        return {
            date: item._id,
            dms: eventMap[AnalyticsEventType.DM_RECEIVED] || 0,
            carousels: eventMap[AnalyticsEventType.CAROUSEL_SENT] || 0,
            impressions: eventMap[AnalyticsEventType.PRODUCT_IMPRESSION] || 0,
            clicks: eventMap[AnalyticsEventType.PRODUCT_CLICK] || 0,
        };
    });

    return stats;
};

/**
 * Get top performing products
 */
export const getTopProducts = async (
    companyId: string,
    limit: number = 10
): Promise<any[]> => {
    const products = await Product.find({
        company: companyId,
        isActive: true,
    })
        .sort({ 'metadata.conversions': -1, 'metadata.clicks': -1 })
        .limit(limit)
        .select('name images price currency metadata');

    return products.map((product) => ({
        id: product._id,
        name: product.name,
        image: product.images[0],
        price: product.price,
        currency: product.currency,
        impressions: product.metadata.impressions,
        clicks: product.metadata.clicks,
        conversions: product.metadata.conversions,
        ctr:
            product.metadata.impressions > 0
                ? ((product.metadata.clicks / product.metadata.impressions) * 100).toFixed(2)
                : '0.00',
    }));
};

/**
 * Get recent activity
 */
export const getRecentActivity = async (
    companyId: string,
    limit: number = 20
): Promise<any[]> => {
    const events = await AnalyticsEvent.find({
        company: companyId,
    })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('product', 'name images')
        .populate('messageEvent');

    return events.map((event) => ({
        id: event._id,
        type: event.eventType,
        createdAt: event.createdAt,
        product: event.product,
        metadata: event.metadata,
    }));
};
