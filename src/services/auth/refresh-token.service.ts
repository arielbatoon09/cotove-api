import { ApiError } from '@/utils/api-error';
import { TokenRepository } from '@/repositories/token.repository';
import { UserRepository } from '@/repositories/user.repository';
import { TokenType } from '@/models/token-model';
import tokenService from './token.service';
import { hashToken } from '@/utils/hash';
import { logger } from '@/config/logger';

interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

export class RefreshTokenService {
  constructor(
    private tokenRepository: TokenRepository,
    private userRepository: UserRepository
  ) {}

  async execute(refreshToken: string): Promise<RefreshTokenResult> {
    try {
      if (!refreshToken) {
        throw new ApiError(400, 'Refresh token is required');
      }
      
      // Verify the token signature
      const payload = tokenService.verifyRefreshToken(refreshToken);
      if (!payload || !payload.userId || !payload.email) {
        logger.error('Invalid token payload:', payload);
        throw new ApiError(401, 'Invalid refresh token');
      }

      // Get the user first to verify existence
      const user = await this.userRepository.findById(payload.userId);
      if (!user) {
        logger.error(`User not found: ${payload.userId}`);
        throw new ApiError(401, 'Invalid refresh token');
      }

      // Hash the refresh token for database lookup
      const hashedToken = hashToken(refreshToken);
      logger.debug(`Looking up hashed token: ${hashedToken}`);

      // Get all refresh tokens for this user
      const userTokens = await this.tokenRepository.findByUserIdAndType(payload.userId, TokenType.REFRESH);
      
      // Find the matching token
      const token = userTokens.find(t => t.token === hashedToken);
      if (!token) {
        logger.error('Token not found in database');
        throw new ApiError(401, 'Invalid refresh token');
      }

      if (token.blacklisted) {
        logger.error('Token is blacklisted:', token.id);
        throw new ApiError(401, 'Refresh token has been revoked');
      }

      // Check if token has expired
      if (token.expiresAt < new Date()) {
        logger.error('Token has expired:', token.id);
        throw new ApiError(401, 'Refresh token has expired');
      }

      // Blacklist the current refresh token
      await this.tokenRepository.update(token.id!, { blacklisted: true });
      logger.info(`Blacklisted token: ${token.id}`);

      // Generate new tokens with the user's token version
      const newAccessToken = tokenService.generateToken(
        payload.userId, 
        payload.email, 
        TokenType.ACCESS,
        user.tokenVersion
      );
      const newRefreshToken = tokenService.generateToken(
        payload.userId, 
        payload.email, 
        TokenType.REFRESH,
        user.tokenVersion
      );
      
      // Hash the new refresh token before storing
      const hashedNewRefreshToken = hashToken(newRefreshToken);
      
      // Store new refresh token
      await this.tokenRepository.create({
        userId: payload.userId,
        token: hashedNewRefreshToken,
        type: TokenType.REFRESH,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        blacklisted: false
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      logger.error('Refresh token service error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to refresh token');
    }
  }
}

// Export a singleton instance
const tokenRepository = new TokenRepository();
const userRepository = new UserRepository();
export const refreshTokenService = new RefreshTokenService(
  tokenRepository,
  userRepository
); 