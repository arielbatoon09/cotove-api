import { pgTable, varchar, timestamp, boolean, index, uuid, integer } from 'drizzle-orm/pg-core';
import { users } from './user.schema';
import { relations } from 'drizzle-orm';

export const otp = pgTable('otp', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  token: varchar('token', { length: 6 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  blacklisted: boolean('blacklisted').default(false),
  attempts: integer('attempts').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('otp_id_idx').on(table.id),
  index('otp_user_id_idx').on(table.userId),
  index('otp_token_idx').on(table.token),
  index('otp_type_idx').on(table.type),
  index('otp_expires_at_idx').on(table.expiresAt),
  index('otp_created_at_idx').on(table.createdAt),
  index('otp_updated_at_idx').on(table.updatedAt),
]);

// Relations
export const otpRelations = relations(otp, ({ one }) => ({
  user: one(users, {
    fields: [otp.userId],
    references: [users.id],
  }),
}));