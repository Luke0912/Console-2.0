import mongoose, { Schema, Document } from 'mongoose';

export enum MessageEventType {
    INCOMING = 'incoming',
    OUTGOING_CAROUSEL = 'outgoing_carousel',
    OUTGOING_TEXT = 'outgoing_text',
}

export interface IMessageEvent extends Document {
    company: mongoose.Types.ObjectId;
    instagramAccount: mongoose.Types.ObjectId;
    senderId: string; // Instagram User ID
    senderUsername?: string;
    messageType: MessageEventType;
    messageText?: string;
    products?: mongoose.Types.ObjectId[]; // Products sent in carousel
    webhookPayload?: Record<string, any>;
    responseStatus: 'pending' | 'sent' | 'failed';
    errorMessage?: string;
    createdAt: Date;
    updatedAt: Date;
}

const messageEventSchema = new Schema<IMessageEvent>(
    {
        company: {
            type: Schema.Types.ObjectId,
            ref: 'Company',
            required: true,
            index: true,
        },
        instagramAccount: {
            type: Schema.Types.ObjectId,
            ref: 'InstagramAccount',
            required: true,
        },
        senderId: {
            type: String,
            required: true,
            index: true,
        },
        senderUsername: {
            type: String,
        },
        messageType: {
            type: String,
            enum: Object.values(MessageEventType),
            required: true,
        },
        messageText: {
            type: String,
        },
        products: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Product',
            },
        ],
        webhookPayload: {
            type: Schema.Types.Mixed,
        },
        responseStatus: {
            type: String,
            enum: ['pending', 'sent', 'failed'],
            default: 'pending',
        },
        errorMessage: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for analytics queries
messageEventSchema.index({ company: 1, createdAt: -1 });
messageEventSchema.index({ company: 1, messageType: 1, createdAt: -1 });

const MessageEvent = mongoose.model<IMessageEvent>('MessageEvent', messageEventSchema);

export default MessageEvent;
