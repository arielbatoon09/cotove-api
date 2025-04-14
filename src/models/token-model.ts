import { z } from 'zod';

// Token types enum
export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
  EMAIL_VERIFICATION = 'emailVerification',
  RESET_PASSWORD = 'resetPassword'
}

// Zod schema for validation
export const createTokenSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  token: z.string().min(1, 'Token is required'),
  type: z.nativeEnum(TokenType, {
    errorMap: () => ({ message: 'Invalid token type' })
  }),
  expiresAt: z.date(),
  blacklisted: z.boolean().optional().default(false),
});

export const verifyTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  type: z.nativeEnum(TokenType, {
    errorMap: () => ({ message: 'Invalid token type' })
  }),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// TypeScript types derived from the schemas
export type CreateTokenInput = z.infer<typeof createTokenSchema>;
export type VerifyTokenInput = z.infer<typeof verifyTokenSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

// Token model class
export class TokenModel {
  id?: string;
  userId: string;
  token: string;
  type: TokenType;
  expiresAt: Date;
  blacklisted: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: CreateTokenInput) {
    this.userId = data.userId;
    this.token = data.token;
    this.type = data.type;
    this.expiresAt = data.expiresAt;
    this.blacklisted = data.blacklisted ?? false;
  }

  // Convert to a plain object for database operations
  toJSON() {
    return {
      id: this.id,
      user_id: this.userId,
      token: this.token,
      type: this.type,
      expires_at: this.expiresAt,
      blacklisted: this.blacklisted,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }

  // Method to create from database record
  static fromDB(data: any): TokenModel {
    const token = new TokenModel({
      userId: data.user_id || data.userId,
      token: data.token,
      type: data.type as TokenType,
      expiresAt: data.expires_at || data.expiresAt,
      blacklisted: data.blacklisted,
    });
    token.id = data.id;
    token.createdAt = data.created_at || data.createdAt;
    token.updatedAt = data.updated_at || data.updatedAt;
    return token;
  }

  // Check if token is expired
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  // Check if token is valid (not expired and not blacklisted)
  isValid(): boolean {
    return !this.isExpired() && !this.blacklisted;
  }
}