import { Request, Response, NextFunction } from 'express';
import * as analyticsService from '../services/analyticsService';

/**
 * Get analytics summary
 */
export const getAnalyticsSummary = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.companyId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
        }

        const startDate = req.query.startDate
            ? new Date(req.query.startDate as string)
            : undefined;
        const endDate = req.query.endDate
            ? new Date(req.query.endDate as string)
            : undefined;

        const summary = await analyticsService.getAnalyticsSummary(
            req.companyId,
            startDate,
            endDate
        );

        res.json({
            success: true,
            data: summary,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get daily stats
 */
export const getDailyStats = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.companyId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
        }

        const days = req.query.days ? parseInt(req.query.days as string) : 30;

        const stats = await analyticsService.getDailyStats(req.companyId, days);

        res.json({
            success: true,
            data: { stats },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get top products
 */
export const getTopProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.companyId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
        }

        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

        const products = await analyticsService.getTopProducts(req.companyId, limit);

        res.json({
            success: true,
            data: { products },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get recent activity
 */
export const getRecentActivity = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.companyId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
        }

        const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

        const activity = await analyticsService.getRecentActivity(
            req.companyId,
            limit
        );

        res.json({
            success: true,
            data: { activity },
        });
    } catch (error) {
        next(error);
    }
};
