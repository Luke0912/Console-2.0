import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import { z } from 'zod';
import config from '../config';

// Validation schemas
const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    companyName: z.string().min(1, 'Company name is required'),
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

/**
 * Register a new user and company
 */
export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const validatedData = registerSchema.parse(req.body);

        const result = await authService.register(validatedData);

        // Set HTTP-only cookies
        res.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            secure: false, // Must be false in dev for ngrok
            sameSite: 'lax', // 'lax' works with ngrok
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: result.user,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Login user
 */
export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const validatedData = loginSchema.parse(req.body);

        const result = await authService.login(validatedData);

        // Set HTTP-only cookies  
        res.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: result.user,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Refresh access token
 */
export const refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token not provided',
            });
        }

        const result = await authService.refreshAccessToken(refreshToken);

        // Set new access token cookie
        res.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({
            success: true,
            message: 'Token refreshed successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Logout user
 */
export const logout = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            await authService.logout(refreshToken);
        }

        // Clear cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        res.json({
            success: true,
            message: 'Logout successful',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current user
 */
export const getCurrentUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
        }

        const user = await authService.getUserById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    company: user.company,
                    lastLogin: user.lastLogin,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};
