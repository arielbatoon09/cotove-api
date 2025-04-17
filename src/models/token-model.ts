import { z } from 'zod';
import { tokens } from '@/database/schema/token.schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// Token types enum
export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
  EMAIL_VERIFICATION = 'emailVerification',
  RESET_PASSWORD = 'resetPassword'
}

// Zod schema for validation
export const tokenSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid('Invalid user ID'),
  token: z.string().min(1, 'Token is required'),
  type: z.nativeEnum(TokenType, {
    errorMap: () => ({ message: 'Invalid token type' })
  }),
  expiresAt: z.date(),
  blacklisted: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const createTokenSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  token: z.string().min(1, 'Token is required'),
  type: z.nativeEnum(TokenType, {
    errorMap: () => ({ message: 'Invalid token type' })
  }),
  expiresAt: z.date(),
  blacklisted: z.boolean().optional().default(false)
});

export const verifyTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  type: z.nativeEnum(TokenType, {
    errorMap: () => ({ message: 'Invalid token type' })
  })
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

// TypeScript types derived from schemas
export type Token = z.infer<typeof tokenSchema>;
export type CreateTokenInput = z.infer<typeof createTokenSchema>;
export type VerifyTokenInput = z.infer<typeof verifyTokenSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

// Database types from schema
export type DBToken = InferSelectModel<typeof tokens>;
export type NewDBToken = InferInsertModel<typeof tokens>;

// Utility functions
export const isTokenExpired = (token: DBToken): boolean => {
  return token.expiresAt ? new Date() > token.expiresAt : true;
};

export const isTokenValid = (token: DBToken): boolean => {
  return !isTokenExpired(token) && !token.blacklisted;
};