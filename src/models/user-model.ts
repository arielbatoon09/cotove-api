import { z } from 'zod';
import { users } from '@/database/schema/user.schema';
import type { InferModel } from 'drizzle-orm';

// Zod schema for validation
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  password: z.string(),
  name: z.string().nullable(),
  isActive: z.boolean().default(true),
  lastLogin: z.date().nullable(),
  verifiedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const userCreateSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  name: z.string().nullable(),
  isActive: z.boolean().default(true),
  lastLogin: z.date().nullable().optional(),
  verifiedAt: z.date().nullable().optional()
});

export const userUpdateSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().optional(),
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
export type DBUser = InferModel<typeof users>;
export type NewDBUser = InferModel<typeof users, 'insert'>;

// Safe user type (without password)
export type SafeUser = Omit<DBUser, 'password'>;

// User model class
export class UserModel {
  id: string;
  email: string;
  password: string;
  name: string | null;
  isActive: boolean;
  lastLogin: Date | null;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: User) {
    this.id = data.id;
    this.email = data.email;
    this.password = data.password;
    this.name = data.name;
    this.isActive = data.isActive;
    this.lastLogin = data.lastLogin;
    this.verifiedAt = data.verifiedAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Convert to database format
  toDB(): User {
    return {
      id: this.id,
      email: this.email,
      password: this.password,
      name: this.name,
      isActive: this.isActive,
      lastLogin: this.lastLogin,
      verifiedAt: this.verifiedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Create from database record
  static fromDB(data: User): UserModel {
    return new UserModel(data);
  }

  // Get safe user object (without password)
  toSafeJSON(): Omit<User, 'password'> {
    const { password, ...safeData } = this.toDB();
    return safeData;
  }
}