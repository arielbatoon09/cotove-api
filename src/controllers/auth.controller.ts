import { Request, Response, RequestHandler } from 'express';
import userService from '@/services/user';
import tokenService from '@/services/token';
import { TokenType } from '@/models/token-model';
import { ApiError } from '@/utils/api-error';
import { verifyPassword } from '@/utils/hash';

export class AuthController {
  constructor() {
    // Bind methods to ensure proper 'this' context
    this.signup = this.signup.bind(this);
    this.login = this.login.bind(this);
    this.verifyEmail = this.verifyEmail.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
    this.requestPasswordReset = this.requestPasswordReset.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.logout = this.logout.bind(this);
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
          user: newUser
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

  login: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      
      // Get user by email
      const user = await userService.getUserByEmail(email);
      
      if (!user) {
        throw new ApiError(401, 'Invalid email or password');
      }

      // Verify password using hash utility
      const isPasswordValid = await verifyPassword(password, user.password);
      if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid email or password');
      }

      // Generate tokens
      const { accessToken, refreshToken } = await tokenService.generateAuthTokens(user.id!, user.email);
      
      // Store refresh token
      await tokenService.storeRefreshToken(user.id!, refreshToken);

      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: this.parseExpiryToMilliseconds(process.env.REFRESH_TOKEN_EXPIRY)
      });

      res.json({
        message: 'Login successful',
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          is_active: user.isActive,
          verified_at: user.verifiedAt,
        }
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ 
          message: error.message,
          error: error.name,
        });
      } else {
        console.error('Login error:', error);
        res.status(500).json({ 
          message: 'An unexpected error occurred during login',
          error: 'InternalServerError',
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

  refreshToken: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken;
      
      if (!refreshToken) {
        throw new ApiError(400, 'Refresh token is required');
      }
      
      // Verify refresh token
      const payload = await tokenService.verifyToken(refreshToken, TokenType.REFRESH);
      
      // Blacklist old refresh token
      await tokenService.blacklistToken(refreshToken);

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = await tokenService.generateAuthTokens(
        payload.userId,
        payload.email
      );
      
      // Store new refresh token
      await tokenService.storeRefreshToken(payload.userId, newRefreshToken);

      // Set new refresh token as HTTP-only cookie
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: this.parseExpiryToMilliseconds(process.env.REFRESH_TOKEN_EXPIRY)
      });

      res.json({
        message: 'Token refreshed successfully',
        accessToken
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ 
          message: error.message,
          error: error.name,
        });
      } else {
        console.error('Token refresh error:', error);
        res.status(500).json({ 
          message: 'An unexpected error occurred while refreshing token',
          error: 'InternalServerError',
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

  logout: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken;
      
      if (!refreshToken) {
        throw new ApiError(400, 'Refresh token is required');
      }
      
      // Blacklist refresh token
      await tokenService.blacklistToken(refreshToken);

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ 
          message: error.message,
          error: error.name,
        });
      } else {
        console.error('Logout error:', error);
        res.status(500).json({ 
          message: 'An unexpected error occurred during logout',
          error: 'InternalServerError',
        });
      }
    }
  };

  private parseExpiryToMilliseconds(expiry: string | undefined): number {
    if (!expiry) {
      throw new ApiError(500, 'REFRESH_TOKEN_EXPIRY environment variable is not set');
    }

    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1));
    
    if (isNaN(value)) {
      throw new ApiError(500, 'Invalid REFRESH_TOKEN_EXPIRY format');
    }
    
    switch (unit) {
      case 'd':
        return value * 24 * 60 * 60 * 1000; // days to milliseconds
      case 'h':
        return value * 60 * 60 * 1000; // hours to milliseconds
      case 'm':
        return value * 60 * 1000; // minutes to milliseconds
      case 's':
        return value * 1000; // seconds to milliseconds
      default:
        throw new ApiError(500, 'Invalid time unit in REFRESH_TOKEN_EXPIRY. Use d, h, m, or s');
    }
  }
}