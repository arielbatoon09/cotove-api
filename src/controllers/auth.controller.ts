import { Request, Response, RequestHandler } from 'express';
import { ApiError } from '@/utils/api-error';
import { asyncHandler } from '@/middlewares/error-handler';
import { authServices } from '@/services/auth';
import { TokenType } from '@/models/token-model';

export class AuthController {
  // Login Handler
  login: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    const result = await authServices.loginService.execute({ email, password });
    
    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: authServices.loginService['tokenService'].getExpiresIn(TokenType.REFRESH) * 1000
    });
    
    res.json({
      message: 'Login successful',
      user: result.user,
    });
  });

  // Signup Handler
  signup: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name } = req.body;
    const result = await authServices.signupService.signup(email, password, name);
    
    res.status(201).json({
      message: 'User created successfully. Please verify your email.',
      user: result.user,
      verificationToken: result.verificationToken
    });
  });

  // Verify Email Handler
  verifyEmail: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { token, type, redirect_to } = req.query;
    if (!token || typeof token !== 'string') {
      throw new ApiError(400, 'Verification token is required');
    }

    if (!type || typeof type !== 'string') {
      throw new ApiError(400, 'Token type is required');
    }

    await authServices.verifyEmailService.execute(token);

    res.json({ 
      message: 'Email verified successfully'
    });
  });

  // Refresh Token Handler
  refreshToken: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new ApiError(401, 'Refresh token is missing');
    }
    const result = await authServices.refreshTokenService.execute(refreshToken);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: authServices.loginService['tokenService'].getExpiresIn(TokenType.REFRESH) * 1000
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: result.accessToken
      }
    });
  });

  // Request Password Reset Handler
  requestPasswordReset: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    await authServices.passwordResetService.requestPasswordReset(email);
    res.json({ message: 'If an account exists with this email, you will receive password reset instructions.' });
  });

  // Reset Password Handler
  resetPassword: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    
    await authServices.passwordResetService.resetPassword(token, newPassword);

    res.json({ message: 'Password reset successfully' });
  });

  // Logout Handler
  logout: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    await authServices.logoutService.execute(refreshToken);
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
export const authController = new AuthController();