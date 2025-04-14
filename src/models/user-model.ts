import { z } from 'zod';
import { users } from '@/database/schema/user.schema';
import type { InferModel } from 'drizzle-orm';

// Zod schema for validation
export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  isActive: z.boolean().optional().default(true),
  lastLogin: z.date().optional(),
  verifiedAt: z.date().optional(),
});

export const loginUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

// TypeScript type derived from the schema
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;

// Database types from schema
export type DBUser = InferModel<typeof users>;
export type NewDBUser = InferModel<typeof users, 'insert'>;

// Safe user type (without password)
export type SafeUser = Omit<DBUser, 'password'>;

// User model class
export class UserModel {
  id?: string;
  name: string | null;
  email: string;
  password: string;
  isActive: boolean;
  lastLogin: Date | null;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: CreateUserInput) {
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.isActive = data.isActive ?? true;
    this.lastLogin = data.lastLogin ?? null;
    this.verifiedAt = data.verifiedAt ?? null;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // Convert to database format
  toDB(): NewDBUser {
    return {
      email: this.email,
      password: this.password,
      name: this.name,
      isActive: this.isActive,
      lastLogin: this.lastLogin,
      verifiedAt: this.verifiedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      ...(this.id && { id: this.id })
    };
  }

  // Create from database record
  static fromDB(data: DBUser): UserModel {
    const user = new UserModel({
      name: data.name || '',
      email: data.email,
      password: data.password,
      isActive: data.isActive || true
    });
    user.id = data.id;
    user.lastLogin = data.lastLogin;
    user.verifiedAt = data.verifiedAt;
    user.createdAt = data.createdAt;
    user.updatedAt = data.updatedAt;
    return user;
  }

  // Get safe user object (without password)
  toSafeJSON(): SafeUser {
    const { password, ...safeUser } = this.toDB();
    return safeUser as SafeUser;
  }
}