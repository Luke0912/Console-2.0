import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import config from '../config';
import logger from '../utils/logger';
import { addToQueue } from '../workers/queue';

/**
 * Verify webhook signature from Meta
 */
const verifyWebhookSignature = (req: Request): boolean => {
    const signature = req.headers['x-hub-signature-256'] as string;
    console.log(signature, "signature")
    if (!signature) {
        logger.warn('No signature provided in webhook request');
        return false;
    }

    const [algorithm, hash] = signature.split('=');

    if (algorithm !== 'sha256') {
        logger.warn(`Unsupported hashing algorithm: ${algorithm}`);
        return false;
    }

    // Use rawBody if available (captured in express.json verify), otherwise fallback to stringified body
    // Ideally rawBody should always be available for webhooks
    const payload = (req as any).rawBody || JSON.stringify(req.body);

    const expectedHash = crypto
        .createHmac('sha256', config.meta.instaAppSecret)
        .update(payload)
        .digest('hex');

    if (hash !== expectedHash) {
        logger.warn('Webhook signature verification failed');
        return false;
    }

    return true;
};

/**
 * Handle webhook verification (GET request from Meta)
 */
export const verifyWebhook = (req: Request, res: Response) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === config.meta.webhookVerifyToken) {
        logger.info('Webhook verified successfully');
        res.status(200).send(challenge);
    } else {
        logger.warn('Webhook verification failed');
        res.status(403).send('Forbidden');
    }
};

/**
 * Handle incoming webhook events (POST request from Meta)
 */
export const handleWebhook = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Verify webhook signature
        if (!verifyWebhookSignature(req)) {
            return res.status(403).json({
                success: false,
                message: 'Invalid signature',
            });
        }

        const body = req.body;
        console.log(body, "body")
        // Immediately respond to Meta to avoid timeout
        res.status(200).send('EVENT_RECEIVED');

        // Process webhook asynchronously
        if (body.object === 'instagram') {
            for (const entry of body.entry || []) {
                const messaging = entry.messaging || [];

                for (const event of messaging) {
                    // Check if it's an incoming message
                    if (event.message && !event.message.is_echo) {
                        const messageData = {
                            senderId: event.sender.id,
                            recipientId: event.recipient.id,
                            messageText: event.message.text || '',
                            timestamp: event.timestamp,
                            webhookPayload: event,
                        };

                        // Add to queue for processing
                        await addToQueue('instagram-message', messageData);

                        logger.info(
                            `Queued Instagram message from ${messageData.senderId}`
                        );
                    }

                    // Handle postbacks (button clicks)
                    if (event.postback) {
                        const postbackData = {
                            senderId: event.sender.id,
                            recipientId: event.recipient.id,
                            payload: event.postback.payload,
                            title: event.postback.title,
                            timestamp: event.timestamp,
                        };

                        // Add to queue for processing
                        await addToQueue('instagram-postback', postbackData);

                        logger.info(
                            `Queued Instagram postback from ${postbackData.senderId}`
                        );
                    }
                }
            }
        }
    } catch (error) {
        logger.error('Webhook processing error:', error);
        // Don't call next(error) as we already responded to Meta
    }
};
