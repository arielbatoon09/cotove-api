import { Request, Response, RequestHandler } from 'express';
import { ApiError } from '@/utils/api-error';
import { UserRepository } from '@/repositories/user.repository';
import { TokenRepository } from '@/repositories/token.repository';
import { LoginService } from '@/services/auth/login.service';
import { signupService } from '@/services/auth/signup.service';
import { RefreshTokenService } from '@/services/auth/refresh-token.service';
import { logoutService } from '@/services/auth/logout.service';
import { verifyEmailService } from '@/services/auth/verify-email.service';
import { passwordResetService } from '@/services/auth/password-reset.service';

export class AuthController {
  private loginService: LoginService;
  private refreshTokenService: RefreshTokenService;

  constructor(
    private userRepository: UserRepository,
    private tokenRepository: TokenRepository
  ) {
    this.loginService = new LoginService(this.userRepository, this.tokenRepository);
    this.refreshTokenService = new RefreshTokenService(this.tokenRepository);
  }

  login: RequestHandler = async (req: Request, res: Response): Promise<void> => {
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
        message: 'Login successful',
        user: result.user,
        accessToken: result.accessToken
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

  signup: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, name } = req.body;
      
      const result = await signupService.signup(email, password, name);
      
      res.status(201).json({
        message: 'User created successfully. Please verify your email.',
        user: result.user,
        verificationToken: result.verificationToken
      });
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

  verifyEmail: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.body;
      
      await verifyEmailService.execute(token);

      res.json({ 
        message: 'Email verified successfully'
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
      if (!refreshToken) {
        throw new ApiError(401, 'Refresh token is missing');
      }

      const result = await this.refreshTokenService.execute(refreshToken);

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
        console.error('Refresh token error:', error);
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
      
      await passwordResetService.requestPasswordReset(email);
      
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
      
      await passwordResetService.resetPassword(token, newPassword);

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
      await logoutService.execute(refreshToken);

      // Clear refresh token cookie
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

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
        console.error('Logout error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };
}

// Export a singleton instance
export const authController = new AuthController(
  new UserRepository(),
  new TokenRepository()
);