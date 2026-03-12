import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

/**
 * Global error handler middleware
 * Catches all errors and sends appropriate responses
 */
export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        });
    }

    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: err.message,
        });
    }

    // Handle Mongoose CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format',
        });
    }

    // Handle MongoDB duplicate key error
    if (err.name === 'MongoServerError' && (err as any).code === 11000) {
        return res.status(409).json({
            success: false,
            message: 'Resource already exists',
        });
    }

    // Default error
    return res.status(500).json({
        success: false,
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { error: err.message }),
    });
};

/**
 * Handles 404 errors for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response) => {
    return res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
};
