import { ApiError } from '@/utils/api-error';
import { UserRepository } from '@/repositories/user.repository';
import { TokenRepository } from '@/repositories/token.repository';
import tokenService from '@/services/auth/token.service';
import { TokenType } from '@/models/token-model';
import { SafeUser } from '@/models/user-model';
import { hashPassword, hashToken } from '@/utils/hash';

export class SignupService {
  constructor(
    private userRepository: UserRepository,
    private tokenRepository: TokenRepository
  ) {}

  async signup(email: string, password: string, name: string): Promise<{
    user: SafeUser;
    verificationToken: string;
  }> {
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
      isActive: true 
    });
    
    if (!newUser?.id || !newUser?.email) {
      throw new ApiError(500, 'Failed to create user');
    }

    try {
      // Generate verification token with the actual user ID
      const verificationToken = await tokenService.generateEmailVerificationToken(newUser.id, email);
      
      // Hash the verification token before storing
      const hashedVerificationToken = hashToken(verificationToken);
      
      // Store the hashed verification token with the actual user ID
      await this.tokenRepository.create({
        userId: newUser.id,
        token: hashedVerificationToken,
        type: TokenType.EMAIL_VERIFICATION,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        blacklisted: false
      });
      
      // TODO: Send verification email
      
      return {
        user: newUser.toSafeJSON(),
        verificationToken
      };
    } catch (tokenError) {
      // If token storage fails, we need to delete the user
      console.error('Failed to store verification token:', tokenError);
      
      // TODO: Add a method to delete the user if token storage fails
      // For now, we'll just throw an error
      throw new ApiError(500, 'Failed to complete registration. Please try again.');
    }
  }
}

// Export a singleton instance
export const signupService = new SignupService(
  new UserRepository(),
  new TokenRepository()
);

