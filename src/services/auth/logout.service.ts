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

  async execute(refreshToken: string, accessToken?: string): Promise<void> {
    try {
      if (!refreshToken) {
        throw new ApiError(400, 'Refresh token is required');
      }

      // Verify the refresh token
      const payload = tokenService.verifyToken(refreshToken, TokenType.REFRESH);
      if (!payload) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      // Hash the tokens
      const hashedRefreshToken = hashToken(refreshToken);
      const hashedAccessToken = accessToken ? hashToken(accessToken) : null;

      // Find and blacklist the refresh token
      const refreshTokenRecord = await this.tokenRepository.findByToken(hashedRefreshToken);
      if (!refreshTokenRecord) {
        logger.warn(`Refresh token not found for user ${payload.userId}`);
        throw new ApiError(404, 'Token not found');
      }

      await this.tokenRepository.update(refreshTokenRecord.id!, { blacklisted: true });
      logger.info(`Refresh token blacklisted for user ${payload.userId}`);

      // If access token is provided, blacklist only that specific token
      if (hashedAccessToken) {
        const accessTokenRecord = await this.tokenRepository.findByToken(hashedAccessToken);
        if (accessTokenRecord && !accessTokenRecord.blacklisted) {
          await this.tokenRepository.update(accessTokenRecord.id!, { blacklisted: true });
          logger.info(`Access token blacklisted for user ${payload.userId}`);
        }
      }

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
  new TokenRepository(),
  new UserRepository()
); 