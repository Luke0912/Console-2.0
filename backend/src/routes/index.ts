import { Router } from 'express';
import authRoutes from './authRoutes';
import instagramRoutes from './instagramRoutes';
import webhookRoutes from './webhookRoutes';
import productRoutes from './productRoutes';
import analyticsRoutes from './analyticsRoutes';
import uploadRoutes from './uploadRoutes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/instagram', instagramRoutes);
router.use('/webhooks/instagram', webhookRoutes);
router.use('/products', productRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/upload', uploadRoutes);

// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is healthy',
        timestamp: new Date().toISOString(),
    });
});

export default router;
