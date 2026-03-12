import mongoose, { Schema, Document } from 'mongoose';

export interface IInstagramAccount extends Document {
    company: mongoose.Types.ObjectId;
    facebookPageId: string;
    instagramBusinessAccountId: string;
    instagramUsername: string;
    accessToken: string; // Encrypted
    tokenType: 'short' | 'long';
    tokenExpiresAt: Date;
    isActive: boolean;
    webhookSubscribed: boolean;
    lastSyncAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const instagramAccountSchema = new Schema<IInstagramAccount>(
    {
        company: {
            type: Schema.Types.ObjectId,
            ref: 'Company',
            required: true,
            unique: true, // One Instagram account per company
            index: true,
        },
        facebookPageId: {
            type: String,
            required: true,
            index: true,
        },
        instagramBusinessAccountId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        instagramUsername: {
            type: String,
            required: true,
        },
        accessToken: {
            type: String,
            required: true,
            select: false, // Don't include in queries by default
        },
        tokenType: {
            type: String,
            enum: ['short', 'long'],
            default: 'long',
        },
        tokenExpiresAt: {
            type: Date,
            required: true,
            index: true, // For finding soon-to-expire tokens
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        webhookSubscribed: {
            type: Boolean,
            default: false,
        },
        lastSyncAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient lookups by Instagram Business Account ID
instagramAccountSchema.index({ instagramBusinessAccountId: 1 });

const InstagramAccount = mongoose.model<IInstagramAccount>(
    'InstagramAccount',
    instagramAccountSchema
);

export default InstagramAccount;
