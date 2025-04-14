import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/utils/api-error';
import tokenService from '@/services/token';
import { TokenType } from '@/models/token-model';
import { UserModel } from '@/models/user-model';
import userService from '@/services/user';
import { db } from '@/config/database';
import { tokens } from '@/database/schema/token.schema';
import { eq, and } from 'drizzle-orm';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: UserModel;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new ApiError(401, 'Authorization header is missing');
    }

    // Check if it's a Bearer token
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new ApiError(401, 'Invalid authorization format. Use Bearer token');
    }

    // Check if token is blacklisted in the database
    const blacklistedToken = await db.select().from(tokens).where(
      and(
        eq(tokens.token, token),
        eq(tokens.blacklisted, true)
      )
    ).limit(1);

    if (blacklistedToken.length > 0) {
      throw new ApiError(401, 'Token has been revoked');
    }

    // Verify the access token
    const payload = await tokenService.verifyToken(token, TokenType.ACCESS);
    
    // Double check the token type from payload
    if (payload.type !== TokenType.ACCESS) {
      throw new ApiError(401, 'Invalid token type. Access token required');
    }
    
    // Get user from database
    const user = await userService.getUserById(payload.userId);
    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new ApiError(403, 'User account is deactivated');
    }

    // Attach user to request object
    req.user = user;
    
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        message: error.message,
        error: error.name
      });
    } else {
      console.error('Auth middleware error:', error);
      res.status(500).json({
        message: 'An unexpected error occurred during authentication',
        error: 'InternalServerError'
      });
    }
  }
};

