import { ApiError } from '@/utils/api-error';
import { TokenRepository } from '@/repositories/token.repository';
import { UserRepository } from '@/repositories/user.repository';
import { hashToken } from '@/utils/hash';
import { TokenType } from '@/models/token-model';
import tokenService from './token.service';
import { logger } from '@/config/logger';

export class LogoutService {
  constructor(
    private tokenRepository: TokenRepository,
    private userRepository: UserRepository
  ) {}

  async execute(refreshToken: string): Promise<void> {
    try {
      if (!refreshToken) {
        throw new ApiError(400, 'Refresh token is required');
      }

      // Verify the refresh token
      const payload = tokenService.verifyToken(refreshToken, TokenType.REFRESH);
      if (!payload) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      // Hash the token
      const hashedToken = hashToken(refreshToken);

      // Find and blacklist the token
      const tokenRecord = await this.tokenRepository.findByToken(hashedToken);
      if (!tokenRecord) {
        logger.warn(`Token not found for user ${payload.userId}`);
        throw new ApiError(404, 'Token not found');
      }

      await this.tokenRepository.update(tokenRecord.id!, { blacklisted: true });
      logger.info(`Token blacklisted for user ${payload.userId}`);

      // Get current user
      const user = await this.userRepository.findById(payload.userId);
      if (!user) {
        logger.error(`User not found: ${payload.userId}`);
        throw new ApiError(404, 'User not found');
      }

      // Increment token version to invalidate all tokens
      await this.userRepository.update(payload.userId, {
        tokenVersion: user.tokenVersion + 1
      });
      logger.info(`Token version incremented for user ${payload.userId}`);
    } catch (error) {
      logger.error('Logout failed:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to logout');
    }
  }
}

// Export a singleton instance
export const logoutService = new LogoutService(
  new TokenRepository(),
  new UserRepository()
); 