import { ApiError } from '@/utils/api-error';
import { TokenRepository } from '@/repositories/token.repository';
import { TokenType } from '@/models/token-model';
import tokenService from '@/services/token';

interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

export class RefreshTokenService {
  constructor(
    private tokenRepository: TokenRepository
  ) {}

  async execute(refreshToken: string): Promise<RefreshTokenResult> {
    if (!refreshToken) {
      throw new ApiError(400, 'Refresh token is required');
    }
    
    // Verify refresh token
    const payload = await tokenService.verifyToken(refreshToken, TokenType.REFRESH);
    
    // Blacklist old refresh token
    await this.tokenRepository.update(refreshToken, { blacklisted: true });

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = await tokenService.generateAuthTokens(
      payload.userId,
      payload.email
    );
    
    // Store new refresh token
    await this.tokenRepository.create({
      userId: payload.userId,
      token: newRefreshToken,
      type: TokenType.REFRESH,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      blacklisted: false
    });

    return {
      accessToken,
      refreshToken: newRefreshToken
    };
  }
} 