import { db } from "@/config/database";
import { stores } from "@/database/schema/store.schema";
import { eq } from "drizzle-orm";
import { DBStore, CreateStoreInput } from "@/models/store.model";

export class StoreRepository {
  async create(storeData: CreateStoreInput): Promise<DBStore> {
    const result = await db.insert(stores).values(storeData).returning();
    return result[0];
  }

  async findById(id: string): Promise<DBStore | null> {
    const result = await db.query.stores.findFirst({
      where: eq(stores.id, id),
    });
    return result ?? null;
  }

  async findByUserId(userId: string): Promise<DBStore[]> {
    return db.query.stores.findMany({
      where: eq(stores.userId, userId),
    });
  }

  async findBySubdomain(subdomain: string): Promise<DBStore | null> {
    const result = await db.query.stores.findFirst({
      where: eq(stores.storeSubdomain, subdomain),
    });
    return result ?? null;
  }

  async update(id: string, data: Partial<CreateStoreInput>): Promise<DBStore> {
    const result = await db
      .update(stores)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(stores.id, id))
      .returning();
    return result[0];
  }

  async delete(id: string): Promise<void> {
    await db.delete(stores).where(eq(stores.id, id));
  }
}