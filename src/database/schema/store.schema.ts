import { pgTable, varchar, timestamp, boolean, index, uuid } from "drizzle-orm/pg-core";
import { users } from "./user.schema";
import { relations } from "drizzle-orm";

export const stores = pgTable('stores', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id),
    storeName: varchar('store_name', { length: 255 }).notNull(),
    storeSubdomain: varchar('store_subdomain', { length: 255 }).notNull().unique(),
    storeCustomDomain: varchar('store_custom_domain', { length: 255 }).unique(),
    storeDescription: varchar('store_description', { length: 255 }).notNull(),
    storeLogo: varchar('store_logo', { length: 255 }).notNull(),
    storeCurrency: varchar('store_currency', { length: 255 }).notNull(),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('stores_id_idx').on(table.id),
    index('stores_user_id_idx').on(table.userId),
]);

export const storeRelations = relations(stores, ({ one }) => ({
    user: one(users, {
        fields: [stores.userId],
        references: [users.id],
    }),
}));