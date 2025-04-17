import { Request, Response, RequestHandler } from 'express';
import { ApiError } from '@/utils/api-error';
import { asyncHandler } from '@/middlewares/error-handler';
import { successHandler } from '@/middlewares/success-handler';
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
    
    return successHandler({
      message: 'Login successful',
      user: result.user,
      accessToken: result.accessToken
    }, req, res);
  });

  // Signup Handler
  signup: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name } = req.body;
    const result = await authServices.signupService.signup(email, password, name);
    
    return successHandler({
      message: 'User created successfully. Please verify your email.',
      user: result.user,
      verificationUrl: result.verificationUrl
    }, req, res, 201);
  });

  // Verify Email Handler
  verifyEmail: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const token = req.params.token;
    const redirectUrl = req.query.redirect as string;
    
    await authServices.verifyEmailService.execute(token);
    
    if (redirectUrl) {
      res.redirect(redirectUrl);
    } else {
      return successHandler({ message: 'Email verified successfully' }, req, res);
    }
  });

  // Refresh Token Handler
  refreshToken: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new ApiError(401, 'Refresh token is missing');
    }
    const result = await authServices.refreshTokenService.execute(refreshToken);

    return successHandler({
      message: 'Token refreshed successfully',
      accessToken: result.accessToken
    }, req, res);
  });

  // Request Password Reset Handler
  requestPasswordReset: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    await authServices.passwordResetService.requestPasswordReset(email);
    return successHandler({
      message: 'If an account exists with this email, you will receive password reset instructions.'
    }, req, res);
  });

  // Reset Password Handler
  resetPassword: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    
    await authServices.passwordResetService.resetPassword(token, newPassword);

    return successHandler({
      message: 'Password reset successfully'
    }, req, res);
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

    return successHandler({
      message: 'Logged out successfully'
    }, req, res);
  });
}

// Export a singleton instance
export const authController = new AuthController();