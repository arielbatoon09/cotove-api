import { db } from '@/config/database';
import { tokens } from '@/database/schema/token.schema';
import { eq, and } from 'drizzle-orm';
import { TokenModel, TokenType } from '@/models/token-model';
import { ApiError } from '@/utils/api-error';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

/**
 * Store a refresh token in the database
 */
export const storeRefreshToken = async (
  userId: string, 
  token: string,
  tx?: NodePgDatabase
): Promise<void> => {
  try {
    const dbClient = tx || db;
    
    // Delete any existing refresh tokens for this user
    await dbClient.delete(tokens)
      .where(and(
        eq(tokens.userId, userId),
        eq(tokens.type, TokenType.REFRESH)
      ));

    // Create token model
    const tokenModel = new TokenModel({
      userId,
      token,
      type: TokenType.REFRESH,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      blacklisted: false
    });

    // Store the new refresh token using the model's toJSON method
    const tokenData = tokenModel.toJSON();
    await dbClient.insert(tokens).values({
      userId: tokenData.user_id,
      token: tokenData.token,
      type: tokenData.type,
      expiresAt: tokenData.expires_at,
      blacklisted: tokenData.blacklisted
    });
  } catch (error) {
    console.error('Error storing refresh token:', error);
    throw new ApiError(500, 'Failed to store refresh token');
  }
};

/**
 * Store a token in the database
 */
export const storeToken = async (
  userId: string, 
  token: string, 
  type: TokenType.EMAIL_VERIFICATION | TokenType.RESET_PASSWORD,
  tx?: NodePgDatabase
): Promise<void> => {
  try {
    const dbClient = tx || db;
    
    // Delete any existing tokens of this type for this user
    await dbClient.delete(tokens)
      .where(and(
        eq(tokens.userId, userId),
        eq(tokens.type, type)
      ));

    // Calculate expiration based on token type
    const expiresAt = new Date(Date.now() + (
      type === TokenType.EMAIL_VERIFICATION 
        ? 24 * 60 * 60 * 1000  // 24 hours for email verification
        : 60 * 60 * 1000       // 1 hour for password reset
    ));

    // Create token model
    const tokenModel = new TokenModel({
      userId,
      token,
      type,
      expiresAt,
      blacklisted: false
    });

    // Store the new token using the model's toJSON method
    const tokenData = tokenModel.toJSON();
    await dbClient.insert(tokens).values({
      userId: tokenData.user_id,
      token: tokenData.token,
      type: tokenData.type,
      expiresAt: tokenData.expires_at,
      blacklisted: tokenData.blacklisted
    });
  } catch (error) {
    console.error('Error storing token:', error);
    throw new ApiError(500, 'Failed to store token');
  }
}; 