import { z } from 'zod';

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const SignupSchema = z.object({
  fullname: z.string().min(2),
  email: z.string().email(),
  password: passwordSchema,
  phone: z.string().regex(/^63\d{10}$/, 'Invalid phone number format'),
});