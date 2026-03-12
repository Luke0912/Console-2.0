import { Router } from 'express';
import * as instagramController from '../controllers/instagramController';
import { authenticate } from '../middleware/auth';
import { isOwnerOrAdmin } from '../middleware/authorize';

const router = Router();



// OAuth flow

// All routes require authentication
router.get('/callback', instagramController.handleOAuthCallback);

router.use(authenticate);
router.get('/oauth-url', instagramController.getOAuthUrl);

// Account management (owner/admin only)
router.get('/account', instagramController.getAccountStatus);// gets acc details on app
router.delete('/account', isOwnerOrAdmin, instagramController.disconnectAccount);

export default router;
