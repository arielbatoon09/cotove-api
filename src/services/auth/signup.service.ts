import { ApiError } from '@/utils/api-error';
import { UserRepository } from '@/repositories/user.repository';
import { TokenRepository } from '@/repositories/token.repository';
import { TokenType } from '@/models/token-model';
import { SafeUser } from '@/models/user-model';
import { hashPassword } from '@/utils/hash';
import { logger } from '@/config/logger';
import { TokenService } from '@/services/auth/token.service';
import { userCreateSchema } from '@/models/user-model';
import { ZodError } from 'zod';

export class SignupService {
  private tokenService: TokenService;

  constructor(
    private userRepository: UserRepository,
    private tokenRepository: TokenRepository
  ) {
    this.tokenService = new TokenService();
  }

  async signup(email: string, password: string, name: string): Promise<{
    user: SafeUser;
    verificationUrl: string;
  }> {
    // Validate input using schema
    try {
      await userCreateSchema.parseAsync({ email, password, name });
    } catch (error) {
      if (error instanceof ZodError) {
        throw ApiError.fromZodError(error);
      }
      throw new ApiError(400, 'Invalid input data');
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ApiError(409, 'Email already registered');
    }
    
    // Hash the password before storing
    const hashedPassword = await hashPassword(password);
    
    // Create user with hashed password
    const newUser = await this.userRepository.create({ 
      email, 
      password: hashedPassword, 
      name,
      isActive: true,
      lastLogin: null,
      verifiedAt: null
    });
    
    if (!newUser?.id || !newUser?.email) {
      throw new ApiError(500, 'Failed to create user');
    }

    try {
      // Generate verification token with the actual user ID
      const verificationToken = await this.tokenService.generateEmailVerificationToken(newUser.id, email);

      // Get expiration time from token service
      const verificationTokenExpiresIn = this.tokenService.getExpiresIn(TokenType.EMAIL_VERIFICATION);
      
      // Store the hashed verification token with the actual user ID
      await this.tokenRepository.create({
        userId: newUser.id,
        token: verificationToken,
        type: TokenType.EMAIL_VERIFICATION,
        expiresAt: new Date(Date.now() + verificationTokenExpiresIn * 1000),
        blacklisted: false
      });
      
      // TODO: Send verification email
      
      return {
        user: newUser as SafeUser,
        verificationUrl: `${process.env.BACKEND_URL}/api/v1/auth/verify-email/${verificationToken}?redirect=${encodeURIComponent(process.env.FRONTEND_URL + '/login')}`
      };
    } catch (error) {
      logger.error('Failed to store verification token:', error);
      throw new ApiError(500, 'Failed to complete registration. Please try again.');
    }
  }
}

// Export a singleton instance
export const signupService = new SignupService(
  new UserRepository(),
  new TokenRepository()
);

