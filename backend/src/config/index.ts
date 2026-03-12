import dotenv from 'dotenv';

dotenv.config();

interface Config {
    env: string;
    port: number;
    mongodb: {
        uri: string;
    };
    redis: {
        url: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
        refreshSecret: string;
        refreshExpiresIn: string;
    };
    encryption: {
        key: string;
    };
    meta: {
        appId: string;
        appSecret: string;
        apiVersion: string;
        webhookVerifyToken: string;
        oauthRedirectUri: string;
        instaAppSecret: string;
    };
    aws: {
        accessKeyId: string;
        secretAccessKey: string;
        region: string;
        s3BucketName: string;
    };
    frontend: {
        url: string;
    };
    rateLimit: {
        windowMs: number;
        maxRequests: number;
    };
    log: {
        level: string;
    };
}

const config: Config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/instagram_dm_saas',
    },
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret',
        refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
    },
    encryption: {
        key: process.env.ENCRYPTION_KEY || '12345678901234567890123456789012',
    },
    meta: {
        appId: process.env.META_APP_ID || '',
        appSecret: process.env.META_APP_SECRET || '',
        apiVersion: process.env.META_API_VERSION || 'v18.0',
        webhookVerifyToken: process.env.META_WEBHOOK_VERIFY_TOKEN || '',
        oauthRedirectUri: process.env.OAUTH_REDIRECT_URI || 'https://perisarcal-indubitably-kanesha.ngrok-free.dev/api/instagram/callback',
        instaAppSecret: process.env.INSTA_APP_SECRET || '', 
    },
    aws: {  
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        region: process.env.AWS_REGION || 'us-east-1',
        s3BucketName: process.env.S3_BUCKET_NAME || '',
    },
    frontend: {
        url: process.env.FRONTEND_URL || 'http://localhost:5173',
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    },
    log: {
        level: process.env.LOG_LEVEL || 'info',
    },
};

export default config;
