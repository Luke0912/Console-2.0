import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';
import User, { IUser, UserRole } from '../models/User';
import Company from '../models/Company';
import RefreshToken from '../models/RefreshToken';
import { ConflictError, UnauthorizedError, ValidationError } from '../utils/errors';
import { addDays } from 'date-fns';

interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    companyName: string;
}

interface LoginData {
    email: string;
    password: string;
}

interface AuthResponse {
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: UserRole;
        company: string;
    };
    accessToken: string;
    refreshToken: string;
}

/**
 * Hash password using bcrypt
 */
const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

/**
 * Compare password with hash
 */
const comparePassword = async (
    password: string,
    hash: string
): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};

/**
 * Generate JWT access token
 */
const generateAccessToken = (userId: string, companyId: string): string => {
    return jwt.sign({ userId, companyId }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
    });
};

/**
 * Generate refresh token
 */
const generateRefreshToken = async (userId: string): Promise<string> => {
    const token = uuidv4();
    const expiresAt = addDays(new Date(), 30);

    await RefreshToken.create({
        user: userId,
        token,
        expiresAt,
    });

    return token;
};

/**
 * Register a new user and company
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
    const { email, password, firstName, lastName, companyName } = data;

    // Validate password strength
    if (password.length < 8) {
        throw new ValidationError('Password must be at least 8 characters long');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        throw new ConflictError('User with this email already exists');
    }

    // Create company first
    const company = await Company.create({
        name: companyName,
    });

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user as owner
    const user = await User.create({
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        role: UserRole.OWNER,
        company: company._id,
    });

    // Generate tokens
    const accessToken = generateAccessToken(
        user._id.toString(),
        company._id.toString()
    );
    const refreshToken = await generateRefreshToken(user._id.toString());

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return {
        user: {
            id: user._id.toString(),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            company: company._id.toString(),
        },
        accessToken,
        refreshToken,
    };
};

/**
 * Login user
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
    const { email, password } = data;

    // Find user with password
    const user = await User.findOne({ email: email.toLowerCase() }).select(
        '+password'
    );

    if (!user) {
        throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
        throw new UnauthorizedError('Your account has been deactivated');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const accessToken = generateAccessToken(
        user._id.toString(),
        user.company.toString()
    );
    const refreshToken = await generateRefreshToken(user._id.toString());

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return {
        user: {
            id: user._id.toString(),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            company: user.company.toString(),
        },
        accessToken,
        refreshToken,
    };
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (
    refreshTokenString: string
): Promise<{ accessToken: string }> => {
    // Find refresh token
    const refreshToken = await RefreshToken.findOne({
        token: refreshTokenString,
        isRevoked: false,
    }).populate('user');

    if (!refreshToken) {
        throw new UnauthorizedError('Invalid refresh token');
    }

    if (refreshToken.expiresAt < new Date()) {
        throw new UnauthorizedError('Refresh token has expired');
    }

    const user = refreshToken.user as unknown as IUser;

    if (!user.isActive) {
        throw new UnauthorizedError('User account is inactive');
    }

    // Generate new access token
    const accessToken = generateAccessToken(
        user._id.toString(),
        user.company.toString()
    );

    return { accessToken };
};

/**
 * Logout user (revoke refresh token)
 */
export const logout = async (refreshTokenString: string): Promise<void> => {
    await RefreshToken.updateOne(
        { token: refreshTokenString },
        { isRevoked: true }
    );
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<IUser | null> => {
    return User.findById(userId).populate('company');
};
