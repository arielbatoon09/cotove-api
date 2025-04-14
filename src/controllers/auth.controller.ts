import { Request, Response, RequestHandler } from 'express';
import userService from '@/services/user';
import tokenService from '@/services/token';
import { TokenType } from '@/models/token-model';
import { ApiError } from '@/utils/api-error';
import { verifyPassword } from '@/utils/hash';
import { and, eq } from 'drizzle-orm';
import { tokens } from '@/database/schema/token.schema';
import { db } from '@/config/database';
import { LoginService } from '@/services/auth/login.service';
import { RefreshTokenService } from '@/services/auth/refresh-token.service';
import { LogoutService } from '@/services/auth/logout.service';
import { UserRepository } from '@/repositories/user.repository';
import { TokenRepository } from '@/repositories/token.repository';

export class AuthController {
  private loginService: LoginService;
  private refreshTokenService: RefreshTokenService;
  private logoutService: LogoutService;

  constructor() {
    const userRepository = new UserRepository();
    const tokenRepository = new TokenRepository();
    this.loginService = new LoginService(userRepository, tokenRepository);
    this.refreshTokenService = new RefreshTokenService(tokenRepository);
    this.logoutService = new LogoutService(tokenRepository);

    // Bind methods to ensure proper 'this' context
    this.signup = this.signup.bind(this);
    this.verifyEmail = this.verifyEmail.bind(this);
    this.requestPasswordReset = this.requestPasswordReset.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
  }

  signup: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, name } = req.body;
      
      // Check if user already exists
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        throw new ApiError(409, 'Email already registered');
      }
      
      // Generate verification token first
      let verificationToken;
      try {
        // Generate token with a temporary user ID (will be updated after user creation)
        verificationToken = await tokenService.generateEmailVerificationToken('temp', email);
      } catch (tokenError) {
        console.error('Failed to generate verification token:', tokenError);
        throw new ApiError(500, 'Failed to generate verification token');
      }
      
      // Create user
      const newUser = await userService.addUser({ 
        email, 
        password, 
        name,
        is_active: true 
      });
      
      if (!newUser?.id || !newUser?.email) {
        throw new ApiError(500, 'Failed to create user');
      }

      try {
        // Store the verification token with the actual user ID
        await tokenService.storeToken(newUser.id, verificationToken, TokenType.EMAIL_VERIFICATION);
        
        // TODO: Send verification email
        
        res.status(201).json({
          message: 'User created successfully. Please verify your email.',
          user: newUser,
          verificationToken: verificationToken
        });
      } catch (tokenError) {
        // If token storage fails, we need to delete the user
        console.error('Failed to store verification token:', tokenError);
        
        // TODO: Add a method to delete the user if token storage fails
        // For now, we'll just throw an error
        throw new ApiError(500, 'Failed to complete registration. Please try again.');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ 
          message: error.message,
          error: error.name,
        });
      } else {
        console.error('Signup error:', error);
        res.status(500).json({ 
          message: 'An unexpected error occurred during signup',
          error: 'InternalServerError',
        });
      }
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = await this.loginService.execute({ email, password });

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };

  verifyEmail: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.body;
      
      if (!token) {
        throw new ApiError(400, 'Verification token is required');
      }
      
      // Verify token
      const payload = await tokenService.verifyToken(token, TokenType.EMAIL_VERIFICATION);
      
      // Blacklist token
      await tokenService.blacklistToken(token);

      // TODO: Update user email verification status

      res.json({ 
        message: 'Email verified successfully',
        userId: payload.userId
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ 
          message: error.message,
          error: error.name,
        });
      } else {
        console.error('Email verification error:', error);
        res.status(500).json({ 
          message: 'An unexpected error occurred during email verification',
          error: 'InternalServerError',
        });
      }
    }
  };

  refreshToken = async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      const result = await this.refreshTokenService.execute(refreshToken);

      // Set new refresh token in HTTP-only cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };

  requestPasswordReset: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      
      if (!email) {
        throw new ApiError(400, 'Email is required');
      }
      
      // Get user by email
      const user = await userService.getUserByEmail(email);
      
      if (!user) {
        // Don't reveal if user exists
        res.json({ message: 'If an account exists with this email, you will receive password reset instructions.' });
        return;
      }

      // Generate and store password reset token
      const resetToken = await tokenService.generatePasswordResetToken(user.id!, user.email);
      await tokenService.storeToken(user.id!, resetToken, TokenType.RESET_PASSWORD);

      // TODO: Send password reset email

      res.json({ message: 'If an account exists with this email, you will receive password reset instructions.' });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ 
          message: error.message,
          error: error.name,
        });
      } else {
        console.error('Password reset request error:', error);
        res.status(500).json({ 
          message: 'An unexpected error occurred while processing your request',
          error: 'InternalServerError',
        });
      }
    }
  };

  resetPassword: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        throw new ApiError(400, 'Token and new password are required');
      }
      
      // Verify token
      const payload = await tokenService.verifyToken(token, TokenType.RESET_PASSWORD);
      
      // Blacklist token
      await tokenService.blacklistToken(token);

      // TODO: Update user password

      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ 
          message: error.message,
          error: error.name,
        });
      } else {
        console.error('Password reset error:', error);
        res.status(500).json({ 
          message: 'An unexpected error occurred while resetting your password',
          error: 'InternalServerError',
        });
      }
    }
  };

  logout = async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      await this.logoutService.execute(refreshToken);

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };
}