import { ApiError } from '@/utils/api-error';
import { verifyPassword } from '@/utils/hash';
import { UserRepository } from '@/repositories/user.repository';
import { TokenRepository } from '@/repositories/token.repository';
import { TokenType } from '@/models/token-model';
import { TokenService } from '@/services/auth/token.service';

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
  refreshToken: string;
  accessToken: string;
  expiresIn: number;
  expiresAt: number;
}

export class LoginService {
  private tokenService: TokenService;

  constructor(
    private userRepository: UserRepository,
    private tokenRepository: TokenRepository
  ) {
    this.tokenService = new TokenService();
  }

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
        throw new ApiError(403, 'Please verify your email address before logging in.');
      }

      // Ensure user has required properties
      if (!user.id || !user.email) {
        throw new ApiError(500, 'User data is incomplete');
      }

      // Generate refresh token for the user
      const refreshToken = this.tokenService.generateToken(
        user.id!,
        user.email,
        TokenType.REFRESH
      );

      // Generate access token for the user
      const accessToken = this.tokenService.generateToken(
        user.id!,
        user.email,
        TokenType.ACCESS
      );

      // Get expiration time from token service (in seconds)
      const refreshTokenExpiresIn = this.tokenService.getExpiresIn(TokenType.REFRESH);
      
      // Calculate refresh token expiration timestamp (in seconds)
      const now = Math.floor(Date.now() / 1000);
      const refreshTokenExpiresAt = now + refreshTokenExpiresIn;

      // Store refresh token only in the database
      await this.tokenRepository.create({
        userId: user.id!,
        token: refreshToken,
        type: TokenType.REFRESH,
        expiresAt: new Date(refreshTokenExpiresAt * 1000),
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
        refreshToken,
        accessToken,
        expiresIn: refreshTokenExpiresIn,
        expiresAt: refreshTokenExpiresAt
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to login');
    }
  }
}

// Export a singleton instance
export const loginService = new LoginService(
  new UserRepository(),
  new TokenRepository()
); 