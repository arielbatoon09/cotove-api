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
      if (!refreshToken) {
        throw new ApiError(400, 'Refresh token is required');
      }

      // Verify the refresh token
      const payload = this.tokenService.verifyToken(refreshToken, TokenType.REFRESH);
      if (!payload) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      // Find and blacklist the refresh token
      const refreshTokenRecord = await this.tokenRepository.findByToken(refreshToken);
      if (!refreshTokenRecord) {
        logger.warn(`Refresh token not found for user ${payload.userId}`);
        throw new ApiError(404, 'Token not found');
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