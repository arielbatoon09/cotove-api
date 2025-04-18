import { Request, Response, RequestHandler } from 'express';
import { asyncHandler } from '@/middlewares/error-handler';
import { successHandler } from '@/middlewares/success-handler';

export class StoreController {
  // Create Store Handler
  createStore: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    return successHandler({
      message: 'Store created successfully',
    }, req, res, 201);
  });
}

// Export a singleton instance
export const storeController = new StoreController();