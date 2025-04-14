import { ApiError } from '@/utils/api-error';
import { TokenRepository } from '@/repositories/token.repository';
import { TokenType } from '@/models/token-model';
import tokenService from '@/services/token';

export class LogoutService {
  constructor(
    private tokenRepository: TokenRepository
  ) {}

  async execute(refreshToken: string): Promise<void> {
    if (!refreshToken) {
      throw new ApiError(400, 'Refresh token is required');
    }

    // Verify refresh token
    await tokenService.verifyToken(refreshToken, TokenType.REFRESH);
    
    // Blacklist refresh token
    await this.tokenRepository.update(refreshToken, { blacklisted: true });
  }
} 