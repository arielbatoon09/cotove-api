import { StoreRepository } from "@/repositories/store.repository";
import { CreateStoreInput, DBStore, createStoreSchema } from "@/models/store.model";
import { ApiError } from "@/utils/api-error";
import { ZodError } from "zod";

export class CreateStoreService {
  constructor(private storeRepository: StoreRepository) {}

  // Create a new store service
  async create(storeData: CreateStoreInput): Promise<DBStore> {
    try {
      // Validate input data
      const validatedData = await createStoreSchema.parseAsync(storeData);

      // Check if subdomain is already taken
      const existingStore = await this.storeRepository.findBySubdomain(validatedData.storeSubdomain);
      if (existingStore) {
        throw new ApiError(409, 'Store subdomain is already taken');
      }

      const result = await this.storeRepository.create(validatedData);
      return result;
    } catch (error) {
      if (error instanceof ZodError) {
        throw ApiError.fromZodError(error);
      }
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to create store');
    }
  }
}

// Export a singleton instance
export const createStoreService = new CreateStoreService(
  new StoreRepository()
);
