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
    // Get user by email
    const user = await this.userRepository.findByEmail(input.email);
    
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await verifyPassword(input.password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
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

    // Generate new tokens
    const { accessToken, refreshToken } = await tokenService.generateAuthTokens(user.id, user.email);
    
    // Hash the refresh token before storing
    const hashedRefreshToken = hashToken(refreshToken);
    
    // Store hashed refresh token in database
    await this.tokenRepository.create({
      userId: user.id,
      token: hashedRefreshToken,
      type: TokenType.REFRESH,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      blacklisted: false
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name || '',
        isActive: user.isActive
      },
      accessToken,
      refreshToken
    };
  }
} 