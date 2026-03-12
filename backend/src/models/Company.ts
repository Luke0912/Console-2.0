import mongoose, { Schema, Document } from 'mongoose';

export enum SubscriptionStatus {
    TRIAL = 'trial',
    ACTIVE = 'active',
    CANCELLED = 'cancelled',
    EXPIRED = 'expired',
}

export interface ICompany extends Document {
    name: string;
    description?: string;
    website?: string;
    logo?: string;
    industry?: string;
    subscriptionStatus: SubscriptionStatus;
    subscriptionEndsAt?: Date;
    maxProducts: number;
    maxMonthlyDMs: number;
    settings: {
        autoReplyEnabled: boolean;
        maxProductsInCarousel: number;
        carouselProductSelectionStrategy: 'featured' | 'random' | 'newest' | 'top_sellers';
    };
    createdAt: Date;
    updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        description: {
            type: String,
            trim: true,
        },
        website: {
            type: String,
            trim: true,
        },
        logo: {
            type: String, // S3 URL
        },
        industry: {
            type: String,
            trim: true,
        },
        subscriptionStatus: {
            type: String,
            enum: Object.values(SubscriptionStatus),
            default: SubscriptionStatus.TRIAL,
        },
        subscriptionEndsAt: {
            type: Date,
        },
        maxProducts: {
            type: Number,
            default: 50,
        },
        maxMonthlyDMs: {
            type: Number,
            default: 1000,
        },
        settings: {
            autoReplyEnabled: {
                type: Boolean,
                default: true,
            },
            maxProductsInCarousel: {
                type: Number,
                default: 5,
                min: 1,
                max: 10,
            },
            carouselProductSelectionStrategy: {
                type: String,
                enum: ['featured', 'random', 'newest', 'top_sellers'],
                default: 'featured',
            },
        },
    },
    {
        timestamps: true,
    }
);

const Company = mongoose.model<ICompany>('Company', companySchema);

export default Company;
