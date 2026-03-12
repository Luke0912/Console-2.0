import Queue from 'bull';
import config from '../config';
import logger from '../utils/logger';

// Create queues
export const instagramMessageQueue = new Queue('instagram-message', config.redis.url, {
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: false,
    },
});

export const instagramPostbackQueue = new Queue('instagram-postback', config.redis.url, {
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: false,
    },
});

/**
 * Add job to queue
 */
export const addToQueue = async (queueName: string, data: any): Promise<void> => {
    try {
        if (queueName === 'instagram-message') {
            await instagramMessageQueue.add(data);
        } else if (queueName === 'instagram-postback') {
            await instagramPostbackQueue.add(data);
        } else {
            logger.warn(`Unknown queue: ${queueName}`);
        }
    } catch (error) {
        logger.error(`Failed to add job to queue ${queueName}:`, error);
        throw error;
    }
};

/**
 * Get queue health status
 */
export const getQueueHealth = async () => {
    const [messageQueueCounts, postbackQueueCounts] = await Promise.all([
        instagramMessageQueue.getJobCounts(),
        instagramPostbackQueue.getJobCounts(),
    ]);

    return {
        instagram_message: messageQueueCounts,
        instagram_postback: postbackQueueCounts,
    };
};

// Event listeners for monitoring
instagramMessageQueue.on('completed', (job) => {
    logger.info(`Message job ${job.id} completed`);
});

instagramMessageQueue.on('failed', (job, err) => {
    logger.error(`Message job ${job?.id} failed:`, err);
});

instagramPostbackQueue.on('completed', (job) => {
    logger.info(`Postback job ${job.id} completed`);
});

instagramPostbackQueue.on('failed', (job, err) => {
    logger.error(`Postback job ${job?.id} failed:`, err);
});

export default {
    instagramMessageQueue,
    instagramPostbackQueue,
    addToQueue,
    getQueueHealth,
};
