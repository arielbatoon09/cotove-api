import { ApiError } from '@/utils/api-error';
import { TokenRepository } from '@/repositories/token.repository';
import { UserRepository } from '@/repositories/user.repository';
import { TokenType } from '@/models/token-model';
import { TokenService } from '@/services/auth/token.service';
import { logger } from '@/config/logger';

interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

export class RefreshTokenService {
  private tokenService: TokenService;

  constructor(
    private tokenRepository: TokenRepository,
    private userRepository: UserRepository
  ) {
    this.tokenService = new TokenService();
  }

  async execute(refreshToken: string): Promise<RefreshTokenResult> {
    try {
      if (!refreshToken) {
        throw new ApiError(400, 'Refresh token is required');
      }
      
      // Verify the token signature
      const payload = this.tokenService.verifyRefreshToken(refreshToken);
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

      // Get all refresh tokens for this user
      const userTokens = await this.tokenRepository.findByUserIdAndType(payload.userId, TokenType.REFRESH);
      
      // Find the matching token
      const token = userTokens.find(t => t.token === refreshToken);
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
        await this.tokenRepository.update(token.id!, { blacklisted: true });
        throw new ApiError(401, 'Refresh token has expired');
      }

      // Generate new access token
      const newAccessToken = this.tokenService.generateToken(
        payload.userId, 
        payload.email,
        TokenType.ACCESS
      );

      // Generate new refresh token
      const newRefreshToken = this.tokenService.generateToken(
        payload.userId,
        payload.email,
        TokenType.REFRESH
      );

      // Get expiration time from token service
      const refreshTokenExpiresIn = this.tokenService.getExpiresIn(TokenType.REFRESH);

      // Store new refresh token in the database
      await this.tokenRepository.create({
        userId: payload.userId,
        token: newRefreshToken,
        type: TokenType.REFRESH,
        expiresAt: new Date(Date.now() + refreshTokenExpiresIn * 1000),
        blacklisted: false
      });

      logger.info(`New access token generated for user ${payload.userId}`);

      // Return the new access token and the same refresh token
      return {
        accessToken: newAccessToken,
        refreshToken: refreshToken
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
export const refreshTokenService = new RefreshTokenService(
  new TokenRepository(),
  new UserRepository()
);