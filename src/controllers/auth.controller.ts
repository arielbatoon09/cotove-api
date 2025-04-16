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
import { asyncHandler } from '@/middlewares/error-handler';

export class AuthController {
  private loginService: LoginService;
  private refreshTokenService: RefreshTokenService;

  constructor(
    private userRepository: UserRepository,
    private tokenRepository: TokenRepository
  ) {
    this.loginService = new LoginService(this.userRepository, this.tokenRepository);
    this.refreshTokenService = new RefreshTokenService(this.tokenRepository, this.userRepository);
  }

  login: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
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
  });

  signup: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name } = req.body;
    const result = await signupService.signup(email, password, name);
    
    res.status(201).json({
      message: 'User created successfully. Please verify your email.',
      user: result.user,
      verificationToken: result.verificationToken
    });
  });

  verifyEmail: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { token, type, redirect_to } = req.query;
    if (!token || typeof token !== 'string') {
      throw new ApiError(400, 'Verification token is required');
    }

    if (!type || typeof type !== 'string') {
      throw new ApiError(400, 'Token type is required');
    }

    await verifyEmailService.execute(token);

    res.json({ 
      message: 'Email verified successfully'
    });
  });

  refreshToken: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
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
  });

  requestPasswordReset: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    await passwordResetService.requestPasswordReset(email);
    res.json({ message: 'If an account exists with this email, you will receive password reset instructions.' });
  });

  resetPassword: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    
    await passwordResetService.resetPassword(token, newPassword);

    res.json({ message: 'Password reset successfully' });
  });

  logout: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
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
  });
}

// Export a singleton instance
export const authController = new AuthController(
  new UserRepository(),
  new TokenRepository()
);