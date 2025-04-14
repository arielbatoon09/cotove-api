import { verify, JwtPayload, TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { db } from '@/config/database';
import { tokens } from '@/database/schema/token.schema';
import { eq, and, gt } from 'drizzle-orm';
import { TokenModel, TokenType } from '@/models/token-model';
import { ApiError } from '@/utils/api-error';
import { TokenPayload } from './generate-token-service';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

// Validate required environment variables
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET environment variables are required');
}

/**
 * Verify a token against both JWT and database
 * @param token The token to verify
 * @param type The expected token type
 * @returns The decoded token payload if valid
 */
export const verifyToken = async (token: string, type: TokenType): Promise<TokenPayload> => {
  try {
    // Select the appropriate secret based on token type
    const secret = type === TokenType.REFRESH ? JWT_REFRESH_SECRET : JWT_ACCESS_SECRET;
    
    // First verify JWT
    const decoded = verify(token, secret) as JwtPayload & TokenPayload;
    
    // For access tokens, we only verify the JWT
    if (type === TokenType.ACCESS) {
      return decoded;
    }
    
    // For other token types, check database
    const dbToken = await db.select().from(tokens).where(
      and(
        eq(tokens.token, token),
        eq(tokens.type, type),
        eq(tokens.blacklisted, false),
        gt(tokens.expiresAt, new Date())
      )
    ).limit(1);

    if (!dbToken.length) {
      throw new ApiError(401, 'Token is invalid or expired');
    }

    // Create token model from database record with proper type conversion
    const tokenData = {
      ...dbToken[0],
      type: dbToken[0].type as TokenType,
      blacklisted: dbToken[0].blacklisted || false,
      expiresAt: dbToken[0].expiresAt || new Date()
    };
    const tokenModel = new TokenModel(tokenData);
    
    // Validate token model
    if (!tokenModel.isValid()) {
      throw new ApiError(401, 'Token is invalid');
    }

    return decoded;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof TokenExpiredError) {
      throw new ApiError(401, 'Token has expired');
    }
    if (error instanceof JsonWebTokenError) {
      throw new ApiError(401, 'Invalid token');
    }
    throw new ApiError(401, 'Invalid token');
  }
};

/**
 * Blacklist a token
 * @param token The token to blacklist
 * @param tx Optional transaction object
 */
export const blacklistToken = async (token: string, tx?: NodePgDatabase): Promise<void> => {
  try {
    const dbClient = tx || db;
    
    // Find the token first
    const dbToken = await dbClient.select().from(tokens).where(
      eq(tokens.token, token)
    ).limit(1);

    if (!dbToken.length) {
      throw new ApiError(404, 'Token not found');
    }

    // Create token model with proper type conversion
    const tokenData = {
      ...dbToken[0],
      type: dbToken[0].type as TokenType,
      blacklisted: dbToken[0].blacklisted || false,
      expiresAt: dbToken[0].expiresAt || new Date()
    };
    const tokenModel = new TokenModel(tokenData);
    
    // Update blacklisted status
    tokenModel.blacklisted = true;
    
    // Save to database
    await dbClient.update(tokens)
      .set({ blacklisted: true })
      .where(eq(tokens.token, token));
  } catch (error) {
    console.error('Error blacklisting token:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Failed to blacklist token');
  }
}; 