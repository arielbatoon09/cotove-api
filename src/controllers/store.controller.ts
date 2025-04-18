import { Request, Response, RequestHandler } from 'express';
import { asyncHandler } from '@/middlewares/error-handler';
import { successHandler } from '@/middlewares/success-handler';
import { storeServices } from '@/services/store';
import { CreateStoreInput } from '@/models/store.model';

export class StoreController {
  // Create Store Handler
  createStore: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const storeData: CreateStoreInput = {
      ...req.body,
      userId: req.user?.id
    };

    const result = await storeServices.createStoreService.create(storeData);
    return successHandler({
      message: 'Store created successfully',
      data: result,
    }, req, res, 201);
  });
}

// Export a singleton instance
export const storeController = new StoreController();