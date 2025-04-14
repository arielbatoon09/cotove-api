import { pgTable, varchar, timestamp, boolean, index, uuid, integer } from 'drizzle-orm/pg-core';
import { otp } from './otp.schema';
import { relations } from 'drizzle-orm';
import { tokens } from './token.schema';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }),
  isActive: boolean('is_active').default(true),
  lastLogin: timestamp('last_login'),
  verifiedAt: timestamp('verified_at'),
  tokenVersion: integer('token_version').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('users_id_idx').on(table.id),
  index('users_email_idx').on(table.email),
  index('users_created_at_idx').on(table.createdAt),
  index('users_last_login_idx').on(table.lastLogin),
  index('users_updated_at_idx').on(table.updatedAt),
  index('users_verified_at_idx').on(table.verifiedAt),
  index('users_token_version_idx').on(table.tokenVersion),
]);

// Relations
export const userRelations = relations(users, ({ many }) => ({
  otp: many(otp),
  tokens: many(tokens),
}));