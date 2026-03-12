import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Analytics endpoints
router.get('/summary', analyticsController.getAnalyticsSummary);
router.get('/daily-stats', analyticsController.getDailyStats);
router.get('/top-products', analyticsController.getTopProducts);
router.get('/recent-activity', analyticsController.getRecentActivity);

export default router;
