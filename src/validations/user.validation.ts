import { z } from 'zod';

// Base user schema
const userSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

// Create user validation
export const createUserSchema = z.object({
  body: userSchema,
});

// Update user validation
export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'User ID must be a number'),
  }),
  body: userSchema.partial(),
});

// Get user by ID validation
export const getUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'User ID must be a number'),
  }),
});

// List users validation
export const listUsersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
    search: z.string().optional(),
  }),
}); 