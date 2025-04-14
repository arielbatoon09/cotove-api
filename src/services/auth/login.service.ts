import { ApiError } from '@/utils/api-error';
import { verifyPassword, hashToken } from '@/utils/hash';
import { UserRepository } from '@/repositories/user.repository';
import { TokenRepository } from '@/repositories/token.repository';
import { TokenType } from '@/models/token-model';

import tokenService from './token.service';

interface LoginInput {
  email: string;
  password: string;
}

interface LoginResult {
  user: {
    id: string;
    email: string;
    name: string;
    isActive: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

export class LoginService {
  constructor(
    private userRepository: UserRepository,
    private tokenRepository: TokenRepository
  ) {}

  async execute(input: LoginInput): Promise<LoginResult> {
    try {
      const { email, password } = input;

      // Get user by email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new ApiError(401, 'Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await verifyPassword(password, user.password);
      if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new ApiError(403, 'User account is deactivated');
      }

      // Check if email is verified
      if (!user.verifiedAt) {
        throw new ApiError(403, 'Please verify your email address before logging in');
      }

      // Ensure user has required properties
      if (!user.id || !user.email) {
        throw new ApiError(500, 'User data is incomplete');
      }

      // Get and blacklist any existing refresh tokens for this user
      const existingTokens = await this.tokenRepository.findByUserIdAndType(user.id, TokenType.REFRESH);
      for (const token of existingTokens) {
        if (token.id) {
          await this.tokenRepository.update(token.id, { blacklisted: true });
        }
      }

      // Generate tokens
      const accessToken = tokenService.generateToken(
        user.id!,
        user.email,
        TokenType.ACCESS,
        user.tokenVersion
      );

      const refreshToken = tokenService.generateToken(
        user.id!,
        user.email,
        TokenType.REFRESH,
        user.tokenVersion
      );

      // Hash and store refresh token
      const hashedToken = hashToken(refreshToken);
      await this.tokenRepository.create({
        userId: user.id!,
        token: hashedToken,
        type: TokenType.REFRESH,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        blacklisted: false
      });

      // Update last login
      await this.userRepository.update(user.id!, {
        lastLogin: new Date()
      });

      return {
        user: {
          id: user.id!,
          email: user.email,
          name: user.name || '',
          isActive: user.isActive
        },
        accessToken,
        refreshToken
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to login');
    }
  }
} 