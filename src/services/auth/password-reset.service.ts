import { ApiError } from '@/utils/api-error';
import { UserRepository } from '@/repositories/user.repository';
import { TokenRepository } from '@/repositories/token.repository';
import tokenService from '@/services/auth/token.service';
import { TokenType } from '@/models/token-model';
import { hashPassword, hashToken } from '@/utils/hash';

export class PasswordResetService {
  constructor(
    private userRepository: UserRepository,
    private tokenRepository: TokenRepository
  ) {}

  async requestPasswordReset(email: string): Promise<void> {
    if (!email) {
      throw new ApiError(400, 'Email is required');
    }
    
    // Get user by email
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      // Don't reveal if user exists
      return;
    }

    // Generate and store password reset token
    const resetToken = tokenService.generateToken(user.id!, user.email, TokenType.RESET_PASSWORD);
    const hashedToken = hashToken(resetToken);
    
    await this.tokenRepository.create({
      userId: user.id!,
      token: hashedToken,
      type: TokenType.RESET_PASSWORD,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      blacklisted: false
    });

    // TODO: Send password reset email with resetToken
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      if (!token || !newPassword) {
        throw new ApiError(400, 'Token and new password are required');
      }
      
      // Hash the token before verification
      const hashedToken = hashToken(token);
      
      // Check if token exists in database
      const tokenRecord = await this.tokenRepository.findByToken(hashedToken);
      if (!tokenRecord) {
        throw new ApiError(400, 'Invalid password reset token');
      }

      // Check if token is blacklisted
      if (tokenRecord.blacklisted) {
        throw new ApiError(400, 'Password reset token has been used');
      }

      // Check if token has expired
      if (tokenRecord.expiresAt < new Date()) {
        throw new ApiError(400, 'Password reset token has expired');
      }
      
      // Verify token
      const payload = tokenService.verifyToken(token, TokenType.RESET_PASSWORD);
      if (!payload) {
        throw new ApiError(400, 'Invalid password reset token');
      }

      // Verify the payload matches the stored token
      if (payload.userId !== tokenRecord.userId) {
        throw new ApiError(400, 'Invalid password reset token');
      }
      
      // Blacklist token
      await this.tokenRepository.update(tokenRecord.id!, { blacklisted: true });

      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);

      // Update user password
      await this.userRepository.update(payload.userId, {
        password: hashedPassword
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to reset password');
    }
  }
}

// Export a singleton instance
export const passwordResetService = new PasswordResetService(
  new UserRepository(),
  new TokenRepository()
); 