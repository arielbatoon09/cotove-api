import { pgTable, varchar, timestamp, index, boolean, uuid } from "drizzle-orm/pg-core";
import { users } from "./user.schema";
import { relations } from "drizzle-orm";

export const tokens = pgTable('tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  token: varchar('token', { length: 1000 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  expiresAt: timestamp('expires_at'),
  blacklisted: boolean('blacklisted').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('tokens_id_idx').on(table.id),
  index('tokens_user_id_idx').on(table.userId),
  index('tokens_created_at_idx').on(table.createdAt),
  index('tokens_updated_at_idx').on(table.updatedAt),
  index('tokens_token_idx').on(table.token),
  index('tokens_type_idx').on(table.type),
]);

export const tokenRelations = relations(tokens, ({ one }) => ({
  user: one(users, {
    fields: [tokens.userId],
    references: [users.id],
  }),
}));