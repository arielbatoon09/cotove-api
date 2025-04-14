import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const tokens = pgTable('tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull(),
  type: text('type', { enum: ['refresh', 'emailVerification', 'resetPassword'] }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}); 