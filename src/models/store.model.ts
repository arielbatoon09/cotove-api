import { z } from 'zod';
import { stores } from '@/database/schema/store.schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export enum StoreCurrency {
    USD = 'USD',
    EUR = 'EUR',
    GBP = 'GBP',
    CAD = 'CAD',
    AUD = 'AUD',
    INR = 'INR',
    PHP = 'PHP',
    // Add more currencies as needed
}

// Zod schema for store creation
export const createStoreSchema = z.object({
  storeName: z.string().min(1, 'Store name is required').max(255),
  storeSubdomain: z.string()
    .min(1, 'Store subdomain is required')
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens'),
  storeCustomDomain: z.string().max(255).optional(),
  storeDescription: z.string().min(1, 'Store description is required').max(255),
  storeLogo: z.string().min(1, 'Store logo is required').max(255),
  storeCurrency: z.nativeEnum(StoreCurrency, {
    errorMap: () => ({ message: 'Invalid store currency' })
  }),
  userId: z.string().uuid('Invalid user ID'),
});

// Type for store creation input
export type CreateStoreInput = z.infer<typeof createStoreSchema>;

// Type for database store
export type DBStore = InferSelectModel<typeof stores>;

export const storeSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    storeName: z.string().min(1, 'Store name is required'),
    storeSubdomain: z.string().min(1, 'Store subdomain is required'),
    storeCustomDomain: z.string().optional(),
    storeDescription: z.string().min(1, 'Store description is required'),
    storeLogo: z.string().min(1, 'Store logo is required'),
    storeCurrency: z.string().min(1, 'Store currency is required'),
    isActive: z.boolean().default(true),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const storeCreateSchema = storeSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export const storeUpdateSchema = storeCreateSchema.partial();

// TypeScript types derived from schemas
export type Store = z.infer<typeof storeSchema>;
export type UpdateStoreInput = z.infer<typeof storeUpdateSchema>;

// Database types from schema
export type NewDBStore = InferInsertModel<typeof stores>;