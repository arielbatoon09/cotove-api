import { ApiError } from '@/utils/api-error';
import { UserRepository } from '@/repositories/user.repository';
import { TokenRepository } from '@/repositories/token.repository';
import { TokenService } from '@/services/auth/token.service';
import { TokenType, isTokenExpired } from '@/models/token.model';

export class VerifyEmailService {
  private tokenService: TokenService;

  constructor(
    private userRepository: UserRepository,
    private tokenRepository: TokenRepository
  ) {
    this.tokenService = new TokenService();
  }

  async execute(token: string): Promise<void> {
    try {
      if (!token) {
        throw new ApiError(400, 'Verification token is required');
      }

      // First verify the token signature
      const payload = this.tokenService.verifyToken(token, TokenType.EMAIL_VERIFICATION);
      if (!payload) {
        throw new ApiError(400, 'Invalid verification token');
      }

      // Check if token exists in database
      const tokenRecord = await this.tokenRepository.findByToken(token);
      if (!tokenRecord) {
        throw new ApiError(400, 'Invalid verification token');
      }

      // Check if token is blacklisted
      if (tokenRecord.blacklisted) {
        throw new ApiError(400, 'Verification token has been used');
      }

      // Check if token has expired
      if (isTokenExpired(tokenRecord)) {
        throw new ApiError(400, 'Verification token has expired');
      }

      // Verify the payload matches the stored token
      if (payload.userId !== tokenRecord.userId) {
        console.log('Token userId mismatch:', {
          payloadUserId: payload.userId,
          tokenRecordUserId: tokenRecord.userId
        });
        throw new ApiError(400, 'Invalid verification token');
      }

      // Get user from database
      const user = await this.userRepository.findById(payload.userId);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Check if user is already verified
      if (user.verifiedAt) {
        throw new ApiError(400, 'Email already verified');
      }

      // Update user verification status
      await this.userRepository.update(payload.userId, {
        verifiedAt: new Date()
      });

      // Blacklist the verification token
      await this.tokenRepository.update(tokenRecord.id!, {
        blacklisted: true
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to verify email');
    }
  }
}

// Export a singleton instance
export const verifyEmailService = new VerifyEmailService(
  new UserRepository(),
  new TokenRepository()
); 