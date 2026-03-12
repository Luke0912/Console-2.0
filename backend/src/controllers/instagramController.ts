import { Request, Response, NextFunction } from 'express';
import * as instagramService from '../services/instagramService';
import crypto from 'crypto';

/**
 * Get Instagram OAuth URL
 */
export const getOAuthUrl = async (
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

        // Generate state for CSRF protection
        const state = crypto.randomBytes(16).toString('hex');

        // Store state in session/cache for verification
        // For production, use Redis or session store
        req.session = { state, companyId: req.companyId };

        const oauthUrl = instagramService.getOAuthUrl(state);

        res.json({
            success: true,
            data: {
                oauthUrl,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Handle OAuth callback
 */
export const handleOAuthCallback = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { code, state } = req.query;
        console.log(code,)
        if (!code || typeof code !== 'string') {
            return res.redirect(
                `${process.env.FRONTEND_URL}/dashboard?error=oauth_failed`
            );
        }

        // Verify state (CSRF protection)
        // In production, verify against stored state in Redis/session
        // For now, we'll skip this check in the callback

        // Extract companyId from state or session
        // For this example, we'll use the authenticated user's companyId
        // const companyId = req.companyId || req.session?.companyId;
        const companyId = "697a6f3396ec5e1c50835150"

        if (!companyId) {
            return res.redirect(
                `${process.env.FRONTEND_URL}/dashboard?error=not_authenticated`
            );
        }

        const instagramAccount = await instagramService.connectInstagramAccount(
            companyId,
            code
        );

        res.redirect(
            `${process.env.FRONTEND_URL}/dashboard?instagram_connected=true`
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get Instagram account status
 */
export const getAccountStatus = async (
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

        const instagramAccount = await instagramService.getInstagramAccount(
            req.companyId
        );

        if (!instagramAccount) {
            return res.json({
                success: true,
                data: {
                    connected: false,
                },
            });
        }

        res.json({
            success: true,
            data: {
                connected: true,
                account: {
                    id: instagramAccount._id,
                    username: instagramAccount.instagramUsername,
                    isActive: instagramAccount.isActive,
                    webhookSubscribed: instagramAccount.webhookSubscribed,
                    tokenExpiresAt: instagramAccount.tokenExpiresAt,
                    lastSyncAt: instagramAccount.lastSyncAt,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Disconnect Instagram account
 */
export const disconnectAccount = async (
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

        await instagramService.disconnectInstagramAccount(req.companyId);

        res.json({
            success: true,
            message: 'Instagram account disconnected successfully',
        });
    } catch (error) {
        next(error);
    }
};
