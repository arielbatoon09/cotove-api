import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/token.service';
import { ApiError } from '../utils/api-error';
import { TokenType } from '../models/token-model';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided');
    }

    const token = authHeader.split(' ')[1];
    const tokenService = new TokenService();
    
    // Verify token signature and expiration
    const payload = tokenService.verifyToken(token);
    
    // Check if token is an access token
    if (payload.type !== TokenType.ACCESS) {
      throw new ApiError(401, 'Invalid token type');
    }

    // Attach user info to request
    req.user = {
      userId: payload.userId,
      email: payload.email,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(401, 'Invalid or expired token'));
    }
  }
};

export const requireVerifiedEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // First authenticate the user
    authenticate(req, res, async (err) => {
      if (err) {
        return next(err);
      }

      // Check if user has verified email
      const userService = (await import('../services/user.service')).default;
      const user = await userService.getUserById(req.user!.userId);
      
      if (!user?.isEmailVerified) {
        return next(new ApiError(403, 'Email verification required'));
      }
      
      next();
    });
  } catch (error) {
    next(error);
  }
}; 