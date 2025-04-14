import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/utils/api-error';
import { TokenType } from '@/models/token-model';
import { UserModel } from '@/models/user-model';
import { UserRepository } from '@/repositories/user.repository';
import { TokenRepository } from '@/repositories/token.repository';
import tokenService from '@/services/auth/token.service';
import { hashToken } from '@/utils/hash';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: UserModel;
    }
  }
}

export class AuthMiddleware {
  private userRepository: UserRepository;
  private tokenRepository: TokenRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.tokenRepository = new TokenRepository();
  }

  authenticate = async (req: Request, res: Response, next: NextFunction) => {
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

      // Hash the token to check against stored hashed tokens
      const hashedToken = hashToken(token);

      // Check if token exists in database
      const tokenRecord = await this.tokenRepository.findByToken(hashedToken);
      if (!tokenRecord) {
        throw new ApiError(401, 'Invalid access token');
      }

      // Check if token is blacklisted
      if (tokenRecord.blacklisted) {
        throw new ApiError(401, 'Token has been revoked');
      }

      // Check if token has expired
      if (tokenRecord.expiresAt < new Date()) {
        throw new ApiError(401, 'Token has expired');
      }

      // Verify the access token
      const payload = tokenService.verifyToken(token, TokenType.ACCESS);
      if (!payload) {
        throw new ApiError(401, 'Invalid access token');
      }
      
      // Double check the token type from payload
      if (payload.type !== TokenType.ACCESS) {
        throw new ApiError(401, 'Invalid token type. Access token required');
      }

      // Verify the payload matches the stored token
      if (payload.userId !== tokenRecord.userId) {
        throw new ApiError(401, 'Invalid access token');
      }
      
      // Get user from database
      const user = await this.userRepository.findById(payload.userId);
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
}

// Export a singleton instance
export const authMiddleware = new AuthMiddleware().authenticate;

