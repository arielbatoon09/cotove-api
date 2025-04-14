import { TokenType } from '@/models/token-model';
import { sign, verify } from 'jsonwebtoken';
import { ApiError } from '@/utils/api-error';

interface TokenPayload {
  userId: string;
  email: string;
  type: TokenType;
  iat: number;
}

export class TokenService {
  private readonly JWT_ACCESS_SECRET: string;
  private readonly JWT_REFRESH_SECRET: string;
  private readonly JWT_ACCESS_EXPIRES_IN: number;
  private readonly JWT_REFRESH_EXPIRES_IN: number;
  private readonly JWT_EMAIL_VERIFICATION_EXPIRES_IN: number;
  private readonly JWT_RESET_PASSWORD_EXPIRES_IN: number;

  constructor() {
    this.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your-access-secret-key';
    this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
    this.JWT_ACCESS_EXPIRES_IN = 15 * 60; // 15 minutes
    this.JWT_REFRESH_EXPIRES_IN = 7 * 24 * 60 * 60; // 7 days
    this.JWT_EMAIL_VERIFICATION_EXPIRES_IN = 7 * 24 * 60 * 60; // 7 days
    this.JWT_RESET_PASSWORD_EXPIRES_IN = 15 * 60; // 15 minutes
  }

  async generateAuthTokens(userId: string, email: string): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.generateToken(userId, email, TokenType.ACCESS);
    const refreshToken = await this.generateToken(userId, email, TokenType.REFRESH);
    return { accessToken, refreshToken };
  }

  async generateEmailVerificationToken(userId: string, email: string): Promise<string> {
    return this.generateToken(userId, email, TokenType.EMAIL_VERIFICATION);
  }

  async generatePasswordResetToken(userId: string, email: string): Promise<string> {
    return this.generateToken(userId, email, TokenType.RESET_PASSWORD);
  }

  public generateToken(userId: string, email: string, type: TokenType): string {
    const payload: TokenPayload = {
      userId,
      email,
      type,
      iat: Math.floor(Date.now() / 1000)
    };

    const secret = this.getSecret(type);
    return sign(payload, secret, { expiresIn: type === TokenType.ACCESS ? '15m' : '7d' });
  }

  public verifyToken(token: string, type: TokenType): TokenPayload | null {
    try {
      const secret = this.getSecret(type);
      const payload = verify(token, secret) as TokenPayload;
      
      if (payload.type !== type) {
        return null;
      }
      
      return payload;
    } catch (error) {
      return null;
    }
  }

  public verifyRefreshToken(token: string): TokenPayload | null {
    return this.verifyToken(token, TokenType.REFRESH);
  }

  private getExpiresIn(type: TokenType): number {
    switch (type) {
      case TokenType.ACCESS:
        return this.JWT_ACCESS_EXPIRES_IN;
      case TokenType.REFRESH:
        return this.JWT_REFRESH_EXPIRES_IN;
      case TokenType.EMAIL_VERIFICATION:
        return this.JWT_EMAIL_VERIFICATION_EXPIRES_IN;
      case TokenType.RESET_PASSWORD:
        return this.JWT_RESET_PASSWORD_EXPIRES_IN;
      default:
        return this.JWT_ACCESS_EXPIRES_IN;
    }
  }

  private getSecret(type: TokenType): string {
    switch (type) {
      case TokenType.ACCESS:
        return this.JWT_ACCESS_SECRET;
      case TokenType.REFRESH:
        return this.JWT_REFRESH_SECRET;
      case TokenType.EMAIL_VERIFICATION:
        return this.JWT_ACCESS_SECRET; // Using access secret for email verification
      case TokenType.RESET_PASSWORD:
        return this.JWT_ACCESS_SECRET; // Using access secret for password reset
      default:
        return this.JWT_ACCESS_SECRET;
    }
  }
}

export default new TokenService();