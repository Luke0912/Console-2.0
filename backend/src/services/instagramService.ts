import axios, { AxiosInstance } from 'axios';
import config from '../config';
import InstagramAccount, { IInstagramAccount } from '../models/InstagramAccount';
import Company from '../models/Company';
import { encrypt, decrypt } from '../utils/encryption';
import { NotFoundError, ValidationError, InternalServerError } from '../utils/errors';
import logger from '../utils/logger';
import { addDays } from 'date-fns';

const META_GRAPH_API_URL = `https://graph.facebook.com/${config.meta.apiVersion}`;

interface OAuthTokenResponse {
    access_token: string;
    token_type: string;
    expires_in?: number;
}

interface LongLivedTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

interface FacebookPage {
    id: string;
    name: string;
    access_token: string;
    instagram_business_account?: {
        id: string;
    };
}

interface InstagramProfile {
    id: string;
    username: string;
}

/**
 * Generate Instagram OAuth URL for user authorization
 */
export const getOAuthUrl = (state: string): string => {
    const params = new URLSearchParams({
        client_id: config.meta.appId,
        redirect_uri: config.meta.oauthRedirectUri,
        scope: [
            'instagram_basic',
            'instagram_manage_messages',
            'pages_show_list',
            'business_management',
        ].join(','),
        response_type: 'code',
        state,
    });

    return `https://www.facebook.com/${config.meta.apiVersion}/dialog/oauth?${params.toString()}`;
};

/**
 * Exchange authorization code for access token
 */
const exchangeCodeForToken = async (code: string): Promise<string> => {
    try {
        const response = await axios.get<OAuthTokenResponse>(
            `${META_GRAPH_API_URL}/oauth/access_token`,
            {
                params: {
                    client_id: config.meta.appId,
                    client_secret: config.meta.appSecret,
                    redirect_uri: config.meta.oauthRedirectUri,
                    code,
                },
            }
        );

        return response.data.access_token;
    } catch (error: any) {
        logger.error('Failed to exchange code for token:', error.response?.data);
        throw new InternalServerError('Failed to authenticate with Instagram');
    }
};

/**
 * Convert short-lived token to long-lived token (60 days)
 */
const getLongLivedToken = async (shortToken: string): Promise<LongLivedTokenResponse> => {
    try {
        const response = await axios.get<LongLivedTokenResponse>(
            `${META_GRAPH_API_URL}/oauth/access_token`,
            {
                params: {
                    grant_type: 'fb_exchange_token',
                    client_id: config.meta.appId,
                    client_secret: config.meta.appSecret,
                    fb_exchange_token: shortToken,
                },
            }
        );

        return response.data;
    } catch (error: any) {
        logger.error('Failed to get long-lived token:', error.response?.data);
        throw new InternalServerError('Failed to get long-lived token');
    }
};

/**
 * Get Facebook Pages connected to the user account
 */
const getFacebookPages = async (accessToken: string): Promise<FacebookPage[]> => {
    try {
        const response = await axios.get(`${META_GRAPH_API_URL}/me/accounts`, {
            params: {
                access_token: accessToken,
                fields: 'id,name,access_token,instagram_business_account',
            },
        });

        return response.data.data || [];
    } catch (error: any) {
        logger.error('Failed to get Facebook pages:', error.response?.data);
        throw new InternalServerError('Failed to fetch Facebook pages');
    }
};

/**
 * Get Instagram Business Account profile
 */
const getInstagramProfile = async (
    igAccountId: string,
    accessToken: string
): Promise<InstagramProfile> => {
    try {
        const response = await axios.get(`${META_GRAPH_API_URL}/${igAccountId}`, {
            params: {
                access_token: accessToken,
                fields: 'id,username',
            },
        });

        return response.data;
    } catch (error: any) {
        logger.error('Failed to get Instagram profile:', error.response?.data);
        throw new InternalServerError('Failed to fetch Instagram profile');
    }
};

/**
 * Subscribe to Instagram webhooks for a page
 */
const subscribeToWebhooks = async (
    pageId: string,
    pageAccessToken: string
): Promise<boolean> => {
    try {
        await axios.post(
            `${META_GRAPH_API_URL}/${pageId}/subscribed_apps`,
            null,
            {
                params: {
                    access_token: pageAccessToken,
                    subscribed_fields: ['messages', 'messaging_postbacks'].join(','),
                },
            }
        );

        logger.info(`Subscribed to webhooks for page ${pageId}`);
        return true;
    } catch (error: any) {
        logger.error('Failed to subscribe to webhooks:', error.response?.data);
        return false;
    }
};

/**
 * Complete OAuth flow and save Instagram account
 */
export const connectInstagramAccount = async (
    companyId: string,
    code: string
): Promise<IInstagramAccount> => {
    // Exchange code for short-lived token
    const shortToken = await exchangeCodeForToken(code);

    // Get long-lived token
    const longLivedTokenData = await getLongLivedToken(shortToken);
    const accessToken = longLivedTokenData.access_token;
    const expiresIn = longLivedTokenData.expires_in || 5184000; // Default 60 days

    // Get Facebook pages
    const pages = await getFacebookPages(accessToken);
    console.log(pages,"---->")

    if (pages.length === 0) {
        throw new ValidationError('No Facebook pages found. Please create a Facebook page first.');
    }

    // Find first page with Instagram Business Account
    const pageWithInstagram = pages.find((page) => page.instagram_business_account);

    if (!pageWithInstagram || !pageWithInstagram.instagram_business_account) {
        throw new ValidationError(
            'No Instagram Business Account found. Please connect an Instagram Business Account to your Facebook page.'
        );
    }

    const pageId = pageWithInstagram.id;
    const pageAccessToken = pageWithInstagram.access_token;
    const igAccountId = pageWithInstagram.instagram_business_account.id;

    // Get Instagram profile
    const igProfile = await getInstagramProfile(igAccountId, pageAccessToken);

    // Subscribe to webhooks
    const webhookSubscribed = await subscribeToWebhooks(pageId, pageAccessToken);

    // Calculate token expiration
    const tokenExpiresAt = addDays(new Date(), expiresIn / 86400);

    // Encrypt access token before storing
    const encryptedToken = encrypt(pageAccessToken);

    // Check if account already exists
    const existingAccount = await InstagramAccount.findOne({ company: companyId });

    if (existingAccount) {
        // Update existing account
        existingAccount.facebookPageId = pageId;
        existingAccount.instagramBusinessAccountId = igAccountId;
        existingAccount.instagramUsername = igProfile.username;
        existingAccount.accessToken = encryptedToken;
        existingAccount.tokenType = 'long';
        existingAccount.tokenExpiresAt = tokenExpiresAt;
        existingAccount.isActive = true;
        existingAccount.webhookSubscribed = webhookSubscribed;
        existingAccount.lastSyncAt = new Date();

        await existingAccount.save();
        return existingAccount;
    }

    // Create new Instagram account record
    const instagramAccount = await InstagramAccount.create({
        company: companyId,
        facebookPageId: pageId,
        instagramBusinessAccountId: igAccountId,
        instagramUsername: igProfile.username,
        accessToken: encryptedToken,
        tokenType: 'long',
        tokenExpiresAt,
        webhookSubscribed,
        lastSyncAt: new Date(),
    });

    logger.info(`Connected Instagram account ${igProfile.username} for company ${companyId}`);

    return instagramAccount;
};

/**
 * Get Instagram account for a company
 */
export const getInstagramAccount = async (
    companyId: string
): Promise<IInstagramAccount | null> => {
    return InstagramAccount.findOne({ company: companyId });
};

/**
 * Get decrypted access token for Instagram account
 */
export const getDecryptedAccessToken = async (
    instagramAccountId: string
): Promise<string> => {
    const account = await InstagramAccount.findById(instagramAccountId).select('+accessToken');

    if (!account) {
        throw new NotFoundError('Instagram account not found');
    }

    return decrypt(account.accessToken);
};

/**
 * Disconnect Instagram account
 */
export const disconnectInstagramAccount = async (
    companyId: string
): Promise<void> => {
    const account = await InstagramAccount.findOne({ company: companyId });

    if (!account) {
        throw new NotFoundError('Instagram account not found');
    }

    account.isActive = false;
    await account.save();

    logger.info(`Disconnected Instagram account for company ${companyId}`);
};

/**
 * Refresh Instagram access token before expiration
 */
export const refreshInstagramToken = async (
    accountId: string
): Promise<void> => {
    const account = await InstagramAccount.findById(accountId).select('+accessToken');

    if (!account) {
        throw new NotFoundError('Instagram account not found');
    }

    const currentToken = decrypt(account.accessToken);

    try {
        const longLivedTokenData = await getLongLivedToken(currentToken);
        const newAccessToken = longLivedTokenData.access_token;
        const expiresIn = longLivedTokenData.expires_in || 5184000;

        const tokenExpiresAt = addDays(new Date(), expiresIn / 86400);
        const encryptedToken = encrypt(newAccessToken);

        account.accessToken = encryptedToken;
        account.tokenExpiresAt = tokenExpiresAt;
        await account.save();

        logger.info(`Refreshed access token for Instagram account ${accountId}`);
    } catch (error) {
        logger.error(`Failed to refresh token for account ${accountId}:`, error);
        throw error;
    }
};

/**
 * Send message via Instagram Messaging API
 */
export const sendInstagramMessage = async (
    recipientId: string,
    pageAccessToken: string,
    message: any
): Promise<void> => {
    try {
        await axios.post(
            `${META_GRAPH_API_URL}/me/messages`,
            {
                recipient: { id: recipientId },
                message,
            },
            {
                params: {
                    access_token: pageAccessToken,
                },
            }
        );

        logger.info(`Sent Instagram message to ${recipientId}`);
    } catch (error: any) {
        logger.error('Failed to send Instagram message:', error.response?.data);
        throw new InternalServerError('Failed to send Instagram message');
    }
};
