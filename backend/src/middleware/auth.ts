import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { UnauthorizedError } from '../utils/errors';
import User, { IUser } from '../models/User';

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: IUser;
            userId?: string;
            companyId?: string;
        }
    }
}

/**
 * Middleware to verify JWT token from cookies or Authorization header
 */
export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Extract token from cookie or Authorization header
        let token = req.cookies?.accessToken;

        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            throw new UnauthorizedError('No authentication token provided');
        }

        // Verify token
        const decoded = jwt.verify(token, config.jwt.secret) as {
            userId: string;
            companyId: string;
        };

        // Fetch user from database
        const user = await User.findById(decoded.userId);

        if (!user || !user.isActive) {
            throw new UnauthorizedError('Invalid or inactive user');
        }

        // Attach user to request
        req.user = user;
        req.userId = user._id.toString();
        req.companyId = user.company.toString();

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(new UnauthorizedError('Invalid authentication token'));
        } else if (error instanceof jwt.TokenExpiredError) {
            next(new UnauthorizedError('Authentication token has expired'));
        } else {
            next(error);
        }
    }
};
