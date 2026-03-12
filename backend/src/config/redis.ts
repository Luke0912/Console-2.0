import { createClient } from 'redis';
import config from './index';
import logger from '../utils/logger';

const redisClient = createClient({
    url: config.redis.url,
});

redisClient.on('error', (err) => {
    logger.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
    logger.info('Redis connected successfully');
});

redisClient.on('ready', () => {
    logger.info('Redis client ready');
});

redisClient.on('reconnecting', () => {
    logger.warn('Redis client reconnecting');
});

export const connectRedis = async (): Promise<void> => {
    try {
        await redisClient.connect();
    } catch (error) {
        logger.error('Redis connection failed:', error);
        throw error;
    }
};

export default redisClient;
