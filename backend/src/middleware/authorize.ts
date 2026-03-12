import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

/**
 * Middleware to check if user has required role
 */
export const authorize = (...allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new UnauthorizedError('User not authenticated'));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(
                new ForbiddenError('You do not have permission to perform this action')
            );
        }

        next();
    };
};

/**
 * Middleware to check if user is owner or admin
 */
export const isOwnerOrAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return next(new UnauthorizedError('User not authenticated'));
    }

    if (req.user.role !== UserRole.OWNER && req.user.role !== UserRole.ADMIN) {
        return next(
            new ForbiddenError('Only owners and admins can perform this action')
        );
    }

    next();
};
