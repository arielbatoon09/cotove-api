import { integer, pgTable, serial, varchar, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { users } from "./user.schema";
import { relations } from "drizzle-orm";

export const otp = pgTable('otp', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  token: varchar('token', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  expiresAt: timestamp('expires_at'),
  blacklisted: boolean('blacklisted').default(false),
  attempts: integer('attempts').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('otp_expires_at_idx').on(table.expiresAt),
  index('otp_user_id_idx').on(table.userId),
  index('otp_token_idx').on(table.token),
  index('otp_type_idx').on(table.type),
  index('otp_attempts_idx').on(table.attempts),
]);

export const otpRelations = relations(otp, ({ one }) => ({
  user: one(users, {
    fields: [otp.userId],
    references: [users.id],
  }),
}));