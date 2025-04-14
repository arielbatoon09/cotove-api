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

      // Blacklist all active access tokens for this user
      const activeAccessTokens = await this.tokenRepository.findByUserIdAndType(payload.userId, TokenType.ACCESS);
      for (const token of activeAccessTokens) {
        if (!token.blacklisted) {
          await this.tokenRepository.update(token.id!, { blacklisted: true });
          logger.info(`Access token ${token.id} blacklisted for user ${payload.userId}`);
        }
      }

      // If a specific access token was provided, ensure it's blacklisted
      if (hashedAccessToken) {
        const accessTokenRecord = await this.tokenRepository.findByToken(hashedAccessToken);
        if (accessTokenRecord && !accessTokenRecord.blacklisted) {
          await this.tokenRepository.update(accessTokenRecord.id!, { blacklisted: true });
          logger.info(`Specific access token blacklisted for user ${payload.userId}`);
        }
      }

      // Increment token version to invalidate all tokens
      const user = await this.userRepository.findById(payload.userId);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

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