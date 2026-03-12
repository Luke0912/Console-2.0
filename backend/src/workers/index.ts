import { instagramMessageQueue, instagramPostbackQueue } from './queue';
import { processIncomingMessage } from '../services/messageService';
import { incrementProductClicks } from '../services/productService';
import { trackEvent } from '../services/analyticsService';
import { AnalyticsEventType } from '../models/AnalyticsEvent';
import logger from '../utils/logger';
import connectDatabase from '../config/database';
import { connectRedis } from '../config/redis';

/**
 * Process Instagram message jobs
 */
instagramMessageQueue.process(async (job) => {
    logger.info(`Processing Instagram message job ${job.id}`);

    const { senderId, recipientId, messageText, timestamp } = job.data;

    await processIncomingMessage({
        senderId,
        recipientId,
        messageText,
        timestamp,
    });

    return { processed: true };
});

/**
 * Process Instagram postback jobs (button clicks)
 */
instagramPostbackQueue.process(async (job) => {
    logger.info(`Processing Instagram postback job ${job.id}`);

    const { senderId, recipientId, payload, title, timestamp } = job.data;

    try {
        // Parse payload (should contain product ID)
        const payloadData = JSON.parse(payload || '{}');

        if (payloadData.productId && payloadData.companyId) {
            // Track product click
            await incrementProductClicks(payloadData.productId);

            await trackEvent({
                company: payloadData.companyId,
                eventType: AnalyticsEventType.PRODUCT_CLICK,
                product: payloadData.productId,
                metadata: {
                    senderId,
                    title,
                },
            });

            logger.info(`Tracked product click for ${payloadData.productId}`);
        }
    } catch (error) {
        logger.error('Failed to process postback:', error);
        throw error;
    }

    return { processed: true };
});

/**
 * Start worker process
 */
const startWorker = async () => {
    try {
        logger.info('Starting worker...');

        // Connect to database
        await connectDatabase();

        // Connect to Redis
        await connectRedis();

        logger.info('Worker started successfully');
        logger.info('Listening for jobs...');

        // Graceful shutdown
        process.on('SIGTERM', async () => {
            logger.info('SIGTERM received, shutting down gracefully...');
            await instagramMessageQueue.close();
            await instagramPostbackQueue.close();
            process.exit(0);
        });

        process.on('SIGINT', async () => {
            logger.info('SIGINT received, shutting down gracefully...');
            await instagramMessageQueue.close();
            await instagramPostbackQueue.close();
            process.exit(0);
        });
    } catch (error) {
        logger.error('Failed to start worker:', error);
        process.exit(1);
    }
};

// Start worker if this file is executed directly
if (require.main === module) {
    startWorker();
}

export default startWorker;
