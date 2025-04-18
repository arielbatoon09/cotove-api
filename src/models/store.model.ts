import { z } from 'zod';
import { stores } from '@/database/schema/store.schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// Zod schema for validation
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
export type CreateStoreInput = z.infer<typeof storeCreateSchema>;
export type UpdateStoreInput = z.infer<typeof storeUpdateSchema>;

// Database types from schema
export type DBStore = InferSelectModel<typeof stores>;
export type NewDBStore = InferInsertModel<typeof stores>;