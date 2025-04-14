import { sign, SignOptions } from 'jsonwebtoken';
import { TokenType } from '@/models/token-model';
import { ApiError } from '@/utils/api-error';

export interface TokenPayload {
  userId: string;
  email: string;
  type: TokenType;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Validate required environment variables
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET environment variables are required');
}

// Token expiration times from environment variables
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';
const EMAIL_VERIFICATION_EXPIRY = process.env.EMAIL_VERIFICATION_EXPIRY || '24h';
const RESET_PASSWORD_EXPIRY = process.env.RESET_PASSWORD_EXPIRY || '1h';

/**
 * Generate a JWT token with the given payload and expiration
 */
export const generateToken = (payload: TokenPayload, secret: string, expiresIn: string): string => {
  try {
    const options: SignOptions = { expiresIn: expiresIn as SignOptions['expiresIn'] };
    return sign(payload, secret, options);
  } catch (error) {
    console.error('Error generating token:', error);
    throw new ApiError(500, 'Failed to generate token');
  }
};

/**
 * Generate access and refresh tokens for a user
 */
export const generateAuthTokens = async (userId: string, email: string): Promise<AuthTokens> => {
  try {
    // Generate access token
    const accessToken = generateToken(
      { userId, email, type: TokenType.ACCESS },
      JWT_ACCESS_SECRET,
      ACCESS_TOKEN_EXPIRY
    );

    // Generate refresh token
    const refreshToken = generateToken(
      { userId, email, type: TokenType.REFRESH },
      JWT_REFRESH_SECRET,
      REFRESH_TOKEN_EXPIRY
    );

    return { accessToken, refreshToken };
  } catch (error) {
    console.error('Error generating auth tokens:', error);
    throw new ApiError(500, 'Failed to generate authentication tokens');
  }
};

/**
 * Generate an email verification token
 */
export const generateEmailVerificationToken = async (userId: string, email: string): Promise<string> => {
  try {
    return generateToken(
      { userId, email, type: TokenType.EMAIL_VERIFICATION },
      JWT_ACCESS_SECRET,
      EMAIL_VERIFICATION_EXPIRY
    );
  } catch (error) {
    console.error('Error generating email verification token:', error);
    throw new ApiError(500, 'Failed to generate email verification token');
  }
};

/**
 * Generate a password reset token
 */
export const generatePasswordResetToken = async (userId: string, email: string): Promise<string> => {
  try {
    return generateToken(
      { userId, email, type: TokenType.RESET_PASSWORD },
      JWT_ACCESS_SECRET,
      RESET_PASSWORD_EXPIRY
    );
  } catch (error) {
    console.error('Error generating password reset token:', error);
    throw new ApiError(500, 'Failed to generate password reset token');
  }
}; 