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
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// Token expiration times from environment variables
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY;
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY;
const EMAIL_VERIFICATION_EXPIRY = process.env.EMAIL_VERIFICATION_EXPIRY;
const RESET_PASSWORD_EXPIRY = process.env.RESET_PASSWORD_EXPIRY;

// Validate required expiration times
if (!ACCESS_TOKEN_EXPIRY || !REFRESH_TOKEN_EXPIRY || !EMAIL_VERIFICATION_EXPIRY || !RESET_PASSWORD_EXPIRY) {
  throw new Error('Token expiration environment variables are required');
}

/**
 * Generate a JWT token with the given payload and expiration
 */
export const generateToken = (payload: TokenPayload, expiresIn: string): string => {
  try {
    const options: SignOptions = { expiresIn: expiresIn as SignOptions['expiresIn'] };
    return sign(payload, JWT_SECRET, options);
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
    // Generate tokens
    const accessToken = generateToken(
      { userId, email, type: TokenType.ACCESS },
      ACCESS_TOKEN_EXPIRY
    );

    const refreshToken = generateToken(
      { userId, email, type: TokenType.REFRESH },
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
      RESET_PASSWORD_EXPIRY
    );
  } catch (error) {
    console.error('Error generating password reset token:', error);
    throw new ApiError(500, 'Failed to generate password reset token');
  }
}; 