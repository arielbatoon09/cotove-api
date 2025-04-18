import { db } from "@/config/database";
import { stores } from "@/database/schema/store.schema";
import { eq } from "drizzle-orm";
import { DBStore, CreateStoreInput } from "@/models/store-model";

export class StoreRepository {
  async create(storeData: CreateStoreInput): Promise<DBStore> {
    const result = await db.insert(stores).values(storeData).returning();
    return result[0];
  }

  async findByUserId(userId: string): Promise<DBStore[]> {
    return db.query.stores.findMany({
      where: eq(stores.userId, userId),
    });
  }
}