import mongoose, { Schema, Document } from 'mongoose';

export interface IRefreshToken extends Document {
    user: mongoose.Types.ObjectId;
    token: string;
    expiresAt: Date;
    isRevoked: boolean;
    createdAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        token: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: true,
        },
        isRevoked: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// TTL index to automatically delete expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema);

export default RefreshToken;
