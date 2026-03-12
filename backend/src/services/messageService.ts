import InstagramAccount from '../models/InstagramAccount';
import MessageEvent, { MessageEventType } from '../models/MessageEvent';
import Company from '../models/Company';
import { IProduct } from '../models/Product';
import {
    getProductsForCarousel,
    incrementProductImpressions,
} from './productService';
import { sendInstagramMessage, getDecryptedAccessToken } from './instagramService';
import { trackEvent } from './analyticsService';
import { AnalyticsEventType } from '../models/AnalyticsEvent';
import { NotFoundError } from '../utils/errors';
import logger from '../utils/logger';

interface IncomingMessage {
    senderId: string;
    recipientId: string;
    messageText: string;
    timestamp: number;
}

/**
 * Build product carousel message for Instagram
 */
const buildCarouselMessage = (products: IProduct[]) => {
    const elements = products.map((product) => ({
        title: product.name,
        subtitle: `${product.currency} ${product.price.toFixed(2)}\n${product.description.substring(0, 80)}${product.description.length > 80 ? '...' : ''}`,
        image_url: product.images[0],
        buttons: [
            {
                type: 'web_url',
                url: product.purchaseUrl,
                title: 'Buy Now',
            },
        ],
    }));

    return {
        attachment: {
            type: 'template',
            payload: {
                template_type: 'generic',
                elements,
            },
        },
    };
};

/**
 * Process incoming Instagram DM and send carousel response
 */
export const processIncomingMessage = async (
    message: IncomingMessage
): Promise<void> => {
    const { senderId, recipientId, messageText, timestamp } = message;

    try {
        // Find Instagram account by recipient ID (this is the Instagram Business Account ID)
        const instagramAccount = await InstagramAccount.findOne({
            instagramBusinessAccountId: recipientId,
            isActive: true,
        }).populate('company');

        if (!instagramAccount) {
            logger.warn(`Instagram account not found for recipient ${recipientId}`);
            return;
        }

        const company = instagramAccount.company as any;

        // Check if auto-reply is enabled
        if (!company.settings.autoReplyEnabled) {
            logger.info(`Auto-reply disabled for company ${company._id}`);
            return;
        }

        // Check monthly DM limit
        const currentMonth = new Date();
        currentMonth.setDate(1);
        currentMonth.setHours(0, 0, 0, 0);

        const monthlyDMCount = await MessageEvent.countDocuments({
            company: company._id,
            messageType: MessageEventType.OUTGOING_CAROUSEL,
            createdAt: { $gte: currentMonth },
        });

        if (monthlyDMCount >= company.maxMonthlyDMs) {
            logger.warn(`Monthly DM limit reached for company ${company._id}`);

            // Track event
            await trackEvent({
                company: company._id,
                eventType: AnalyticsEventType.WEBHOOK_FAILURE,
                metadata: { reason: 'monthly_limit_exceeded' },
            });

            return;
        }

        // Log incoming message
        const messageEvent = await MessageEvent.create({
            company: company._id,
            instagramAccount: instagramAccount._id,
            senderId,
            messageType: MessageEventType.INCOMING,
            messageText,
            responseStatus: 'pending',
        });

        // Track DM received event
        await trackEvent({
            company: company._id,
            eventType: AnalyticsEventType.DM_RECEIVED,
            messageEvent: messageEvent._id,
        });

        // Get products for carousel
        const products = await getProductsForCarousel(
            company._id.toString(),
            company.settings.maxProductsInCarousel
        );

        if (products.length === 0) {
            logger.warn(`No products available for company ${company._id}`);

            // Send a default text message
            const accessToken = await getDecryptedAccessToken(
                instagramAccount._id.toString()
            );

            await sendInstagramMessage(senderId, accessToken, {
                text: "Thank you for your message! We're currently updating our product catalog. Please check back soon!",
            });

            messageEvent.responseStatus = 'sent';
            await messageEvent.save();

            return;
        }

        // Build carousel message
        const carouselMessage = buildCarouselMessage(products);

        // Get decrypted access token
        const accessToken = await getDecryptedAccessToken(
            instagramAccount._id.toString()
        );

        // Send carousel
        await sendInstagramMessage(senderId, accessToken, carouselMessage);

        // Update message event
        messageEvent.messageType = MessageEventType.OUTGOING_CAROUSEL;
        messageEvent.products = products.map((p) => p._id);
        messageEvent.responseStatus = 'sent';
        await messageEvent.save();

        // Track carousel sent
        await trackEvent({
            company: company._id,
            eventType: AnalyticsEventType.CAROUSEL_SENT,
            messageEvent: messageEvent._id,
        });

        // Increment product impressions
        await incrementProductImpressions(products.map((p) => p._id.toString()));

        // Track individual product impressions
        for (const product of products) {
            await trackEvent({
                company: company._id,
                eventType: AnalyticsEventType.PRODUCT_IMPRESSION,
                product: product._id,
                messageEvent: messageEvent._id,
            });
        }

        logger.info(
            `Sent carousel with ${products.length} products to ${senderId} for company ${company._id}`
        );
    } catch (error: any) {
        logger.error('Failed to process incoming message:', error);

        // Track webhook failure
        try {
            const instagramAccount = await InstagramAccount.findOne({
                instagramBusinessAccountId: recipientId,
            });

            if (instagramAccount) {
                await trackEvent({
                    company: instagramAccount.company,
                    eventType: AnalyticsEventType.WEBHOOK_FAILURE,
                    metadata: {
                        error: error.message,
                        senderId,
                    },
                });
            }
        } catch (trackError) {
            logger.error('Failed to track webhook failure:', trackError);
        }
    }
};

/**
 * Get message history for a company
 */
export const getMessageHistory = async (
    companyId: string,
    page: number = 1,
    limit: number = 50
): Promise<{ messages: any[]; total: number; page: number; pages: number }> => {
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
        MessageEvent.find({ company: companyId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('products', 'name images price currency'),
        MessageEvent.countDocuments({ company: companyId }),
    ]);

    return {
        messages,
        total,
        page,
        pages: Math.ceil(total / limit),
    };
};
