import { Router } from 'express';
import * as webhookController from '../controllers/webhookController';
import { webhookLimiter } from '../middleware/rateLimiter';

const router = Router();

// Webhook verification (GET) and event handling (POST)
router.get('/', webhookController.verifyWebhook);
router.post('/', webhookLimiter, webhookController.handleWebhook);

export default router;
