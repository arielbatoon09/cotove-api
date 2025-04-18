import { z } from 'zod';
import { users } from '@/database/schema/user.schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// Zod schema for validation
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  isActive: z.boolean().default(true),
  lastLogin: z.date().nullable(),
  verifiedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const userCreateSchema = userSchema.omit({
  id: true,
  lastLogin: true,
  verifiedAt: true,
  createdAt: true,
  updatedAt: true
});

export const userUpdateSchema = userCreateSchema.partial();

// TypeScript types derived from schemas
export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof userCreateSchema>;
export type UpdateUserInput = z.infer<typeof userUpdateSchema>;

// Database types from schema
export type DBUser = InferSelectModel<typeof users>;
export type NewDBUser = InferInsertModel<typeof users>;

// Safe user type (without password)
export type SafeUser = Omit<DBUser, 'password'>;