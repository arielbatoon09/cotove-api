import { z } from 'zod';
import { users } from '@/database/schema/user.schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// Zod schema for validation
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().nullable(),
  isActive: z.boolean().default(true),
  lastLogin: z.date().nullable(),
  verifiedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const userCreateSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name is required'),
  isActive: z.boolean().default(true).optional(),
  lastLogin: z.date().nullable().optional(),
  verifiedAt: z.date().nullable().optional()
});

export const userUpdateSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  name: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  lastLogin: z.date().nullable().optional(),
  verifiedAt: z.date().nullable().optional()
});

// TypeScript types derived from schemas
export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof userCreateSchema>;
export type UpdateUserInput = z.infer<typeof userUpdateSchema>;

// Database types from schema
export type DBUser = InferSelectModel<typeof users>;
export type NewDBUser = InferInsertModel<typeof users>;

// Safe user type (without password)
export type SafeUser = Omit<DBUser, 'password'>;