import { ApiError } from '@/utils/api-error';
import { TokenRepository } from '@/repositories/token.repository';
import { TokenType } from '@/models/token-model';
import { TokenService } from '@/services/auth/token.service';
import { logger } from '@/config/logger';

export class LogoutService {
  private tokenService: TokenService;
  constructor(
    private tokenRepository: TokenRepository
  ) {
    this.tokenService = new TokenService();
  }

  async execute(refreshToken: string, accessToken?: string): Promise<void> {
    try {
      // If no refresh token, just clear the cookie and return
      if (!refreshToken) {
        logger.info('No refresh token provided for logout - clearing cookie only');
        return;
      }

      // Verify the refresh token
      const payload = this.tokenService.verifyToken(refreshToken, TokenType.REFRESH);
      if (!payload) {
        logger.warn('Invalid refresh token during logout');
        return;
      }

      // Find and blacklist the refresh token
      const refreshTokenRecord = await this.tokenRepository.findByToken(refreshToken);
      if (!refreshTokenRecord) {
        logger.warn(`Refresh token not found for user ${payload.userId}`);
        return;
      }

      await this.tokenRepository.update(refreshTokenRecord.id!, { blacklisted: true });
      logger.info(`Refresh token blacklisted for user ${payload.userId}`);

      logger.info(`User ${payload.userId} logged out successfully`);
    } catch (error) {
      logger.error('Logout error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to logout');
    }
  }
}

// Export a singleton instance
export const logoutService = new LogoutService(
  new TokenRepository()
);