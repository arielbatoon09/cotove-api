import { CreateStoreService } from "@/services/store/create-store.service";
import { StoreRepository } from "@/repositories/store.repository";

const storeRepository = new StoreRepository();

export const storeServices = {
  createStoreService: new CreateStoreService(storeRepository),
};