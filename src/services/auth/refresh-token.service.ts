import { ApiError } from '@/utils/api-error';
import { TokenRepository } from '@/repositories/token.repository';
import { TokenType } from '@/models/token-model';
import tokenService from './token.service';
import { hashToken } from '@/utils/hash';

interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

export class RefreshTokenService {
  constructor(
    private tokenRepository: TokenRepository
  ) {}

  async execute(refreshToken: string): Promise<RefreshTokenResult> {
    try {
      if (!refreshToken) {
        throw new ApiError(400, 'Refresh token is required');
      }
      
      // Verify the token signature
      const payload = tokenService.verifyRefreshToken(refreshToken);
      if (!payload) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      // Hash the refresh token for database lookup
      const hashedToken = hashToken(refreshToken);

      // Check if token exists in database and is not blacklisted
      const token = await this.tokenRepository.findByTokenAndUserId(hashedToken, payload.userId);
      if (!token) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      if (token.blacklisted) {
        console.error('Token is blacklisted:', token.id);
        throw new ApiError(401, 'Refresh token has been revoked');
      }

      // Check if token has expired
      if (token.expiresAt < new Date()) {
        console.error('Token has expired:', token.id);
        throw new ApiError(401, 'Refresh token has expired');
      }

      // Verify the payload matches the stored token
      if (payload.userId !== token.userId) {
        console.error('Token user ID mismatch:', payload.userId, token.userId);
        throw new ApiError(401, 'Invalid refresh token');
      }
      
      // Get all active refresh tokens for this user
      const userTokens = await this.tokenRepository.findByUserIdAndType(payload.userId, TokenType.REFRESH);
      
      // Blacklist all existing refresh tokens for this user
      for (const token of userTokens) {
        if (token.id) {
          await this.tokenRepository.update(token.id, { blacklisted: true });
        }
      }

      // Generate new tokens
      const newAccessToken = tokenService.generateToken(payload.userId, payload.email, TokenType.ACCESS);
      const newRefreshToken = tokenService.generateToken(payload.userId, payload.email, TokenType.REFRESH);
      
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
      console.error('Refresh token service error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to refresh token');
    }
  }
} 