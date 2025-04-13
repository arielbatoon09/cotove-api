import { z } from 'zod';

// Zod schema for validation
export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  is_active: z.boolean().optional().default(true),
  last_login: z.date().optional(),
  verified_at: z.date().optional(),
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

// User model class
export class UserModel {
  id?: string;
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  lastLogin?: Date;
  verifiedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: CreateUserInput) {
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.isActive = data.is_active ?? true;
    this.lastLogin = data.last_login;
    this.verifiedAt = data.verified_at;
  }

  // Convert to a plain object for database operations
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      password: this.password,
      is_active: this.isActive,
      last_login: this.lastLogin,
      verified_at: this.verifiedAt,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }

  // Method to create from database record
  static fromDB(data: any): UserModel {
    const user = new UserModel({
      name: data.name,
      email: data.email,
      password: data.password,
      is_active: data.is_active,
      last_login: data.last_login,
      verified_at: data.verified_at,
    });
    user.id = data.id;
    user.createdAt = data.created_at;
    user.updatedAt = data.updated_at;
    return user;
  }

  // Omit the password from the user object
  toSafeJSON() {
    const { password, ...safeUser } = this.toJSON();
    return safeUser;
  }
}