import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import config from './config';
import connectDatabase from './config/database';
import { connectRedis } from './config/redis';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import logger from './utils/logger';

// Extend Express Request for session (simple in-memory for demo)
declare module 'express-serve-static-core' {
    interface Request {
        session?: any;
        rawBody?: Buffer;
    }
}

/**
 * Create Express application
 */
const createApp = (): Application => {
    const app = express();

    // Trust proxy (required for running behind proxies like ngrok)
    app.set('trust proxy', 1);

    // Security middleware
    app.use(helmet());

    // CORS configuration (FIXED)
    const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'https://b69004b475ab.ngrok-free.app'  // Updated ngrok URL
    ];

    app.use(
        cors({
            origin: (origin, callback) => {
                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true,
        })
    );

    // Request parsing
    app.use(express.json({
        limit: '10mb',
        verify: (req: any, _res, buf) => {
            req.rawBody = buf;
        }
    }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    app.use(cookieParser());

    // Logging
    if (config.env === 'development') {
        app.use(morgan('dev'));
    } else {
        app.use(morgan('combined'));
    }

    // Rate limiting
    app.use('/api', apiLimiter);

    // Serve uploaded files statically
    app.use('/uploads', express.static('uploads'));

    // Serve public files (privacy policy, terms, etc.)
    app.use(express.static('public'));

    // Routes
    app.use('/api', routes);

    // 404 handler
    app.use(notFoundHandler);

    // Error handler
    app.use(errorHandler);

    return app;
};

/**
 * Start server
 */
const startServer = async (): Promise<void> => {
    try {
        await connectDatabase();
        await connectRedis();

        const app = createApp();

        const server = app.listen(config.port, () => {
            logger.info(`Server running on port ${config.port} in ${config.env} mode`);
            logger.info(`Frontend URL: ${config.frontend.url}`);
        });

        const gracefulShutdown = async () => {
            logger.info('Shutting down gracefully...');
            server.close(() => {
                logger.info('HTTP server closed');
                process.exit(0);
            });
            setTimeout(() => {
                logger.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);

        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
        });

        process.on('uncaughtException', (error) => {
            logger.error('Uncaught Exception:', error);
            gracefulShutdown();
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

if (require.main === module) {
    startServer();
}

export { createApp, startServer };
export default createApp;
