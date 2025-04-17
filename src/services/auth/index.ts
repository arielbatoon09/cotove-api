import { LoginService } from '@/services/auth/login.service';
import { RefreshTokenService } from '@/services/auth/refresh-token.service';
import { SignupService } from '@/services/auth/signup.service';
import { VerifyEmailService } from '@/services/auth/verify-email.service';
import { PasswordResetService } from '@/services/auth/password-reset.service';
import { LogoutService } from '@/services/auth/logout.service';
import { UserRepository } from '@/repositories/user.repository';
import { TokenRepository } from '@/repositories/token.repository';

const userRepository = new UserRepository();
const tokenRepository = new TokenRepository();

// Initialize services with dependencies
export const authServices = {
  loginService: new LoginService(userRepository, tokenRepository),
  refreshTokenService: new RefreshTokenService(tokenRepository, userRepository),
  signupService: new SignupService(userRepository, tokenRepository),
  verifyEmailService: new VerifyEmailService(userRepository, tokenRepository),
  passwordResetService: new PasswordResetService(userRepository, tokenRepository),
  logoutService: new LogoutService(tokenRepository),
};