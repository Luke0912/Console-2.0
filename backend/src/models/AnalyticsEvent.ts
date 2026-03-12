import mongoose, { Schema, Document } from 'mongoose';

export enum AnalyticsEventType {
    DM_RECEIVED = 'dm_received',
    CAROUSEL_SENT = 'carousel_sent',
    PRODUCT_IMPRESSION = 'product_impression',
    PRODUCT_CLICK = 'product_click',
    PURCHASE_REDIRECT = 'purchase_redirect',
    WEBHOOK_FAILURE = 'webhook_failure',
    TOKEN_EXPIRED = 'token_expired',
}

export interface IAnalyticsEvent extends Document {
    company: mongoose.Types.ObjectId;
    eventType: AnalyticsEventType;
    product?: mongoose.Types.ObjectId;
    messageEvent?: mongoose.Types.ObjectId;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}

const analyticsEventSchema = new Schema<IAnalyticsEvent>(
    {
        company: {
            type: Schema.Types.ObjectId,
            ref: 'Company',
            required: true,
            index: true,
        },
        eventType: {
            type: String,
            enum: Object.values(AnalyticsEventType),
            required: true,
            index: true,
        },
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
        },
        messageEvent: {
            type: Schema.Types.ObjectId,
            ref: 'MessageEvent',
        },
        metadata: {
            type: Schema.Types.Mixed,
        },
        ipAddress: {
            type: String,
        },
        userAgent: {
            type: String,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// Compound indexes for efficient analytics queries
analyticsEventSchema.index({ company: 1, eventType: 1, createdAt: -1 });
analyticsEventSchema.index({ company: 1, product: 1, eventType: 1 });

// TTL index - keep analytics data for 90 days
analyticsEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

const AnalyticsEvent = mongoose.model<IAnalyticsEvent>(
    'AnalyticsEvent',
    analyticsEventSchema
);

export default AnalyticsEvent;
