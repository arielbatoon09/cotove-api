import { ApiError } from '@/utils/api-error';
import { TokenRepository } from '@/repositories/token.repository';
import { TokenType } from '@/models/token-model';
import tokenService from './token.service';
import { hashToken } from '@/utils/hash';

export class LogoutService {
  constructor(
    private tokenRepository: TokenRepository
  ) {}

  async execute(refreshToken: string): Promise<void> {
    if (!refreshToken) {
      throw new ApiError(401, 'Refresh token is required');
    }

    // Verify refresh token
    const payload = await tokenService.verifyToken(refreshToken, TokenType.REFRESH);
    
    // Hash the token before looking it up
    const hashedToken = hashToken(refreshToken);
    
    // Find the token in database
    const tokenRecord = await this.tokenRepository.findByToken(hashedToken);
    if (!tokenRecord) {
      throw new ApiError(401, 'Invalid refresh token');
    }
    
    // Blacklist the refresh token using its ID
    await this.tokenRepository.update(tokenRecord.id!, { blacklisted: true });
  }
}

// Export a singleton instance
export const logoutService = new LogoutService(new TokenRepository()); 