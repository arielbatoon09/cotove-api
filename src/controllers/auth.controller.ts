import { Request, Response, RequestHandler } from 'express';
import { asyncHandler } from '@/middlewares/error-handler';
import { successHandler } from '@/middlewares/success-handler';
import { authServices } from '@/services/auth';

export class AuthController {
  // Login Handler
  login: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    const result = await authServices.loginService.execute({ email, password });
    
    return successHandler({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
      expiresAt: result.expiresAt,
      user: result.user,
    }, req, res);
  });

  // Signup Handler
  signup: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name } = req.body;
    const result = await authServices.signupService.signup(email, password, name);
    
    return successHandler({
      message: 'Please check your email to verify your account.',
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
    const { refreshToken } = req.body;
    const result = await authServices.refreshTokenService.execute(refreshToken);

    return successHandler({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
      expiresAt: result.expiresAt
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
    const { refreshToken } = req.body;
    await authServices.logoutService.execute(refreshToken);
    
    return successHandler({
      message: 'Logged out successfully'
    }, req, res);
  });
}

// Export a singleton instance
export const authController = new AuthController();