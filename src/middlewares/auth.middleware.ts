import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/utils/api-error';
import { TokenType } from '@/models/token-model';
import { UserModel } from '@/models/user-model';
import { UserRepository } from '@/repositories/user.repository';
import tokenService from '@/services/auth/token.service';

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

  constructor() {
    this.userRepository = new UserRepository();
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

      // Verify the access token
      const payload = tokenService.verifyToken(token, TokenType.ACCESS);
      if (!payload) {
        throw new ApiError(401, 'Invalid access token');
      }
      
      // Double check the token type from payload
      if (payload.type !== TokenType.ACCESS) {
        throw new ApiError(401, 'Invalid token type. Access token required');
      }
      
      // Get user from database
      const user = await this.userRepository.findById(payload.userId);
      if (!user) {
        throw new ApiError(401, 'User not found');
      }

      // Check token version
      if (payload.tokenVersion !== user.tokenVersion) {
        throw new ApiError(401, 'Token has been invalidated');
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