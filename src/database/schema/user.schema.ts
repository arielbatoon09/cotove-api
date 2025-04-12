import { pgTable, serial, varchar, timestamp, boolean, index } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }),
  isActive: boolean('is_active').default(true),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('users_id_idx').on(table.id),
  index('users_email_idx').on(table.email),
  index('users_created_at_idx').on(table.createdAt),
  index('users_last_login_idx').on(table.lastLogin),
  index('users_updated_at_idx').on(table.updatedAt),
]);