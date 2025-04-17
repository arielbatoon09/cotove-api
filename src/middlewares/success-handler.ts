import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Extend Express Request type to include id
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

/**
 * Success response handler middleware
 * Standardizes success responses across the application
 */
export const successHandler = (
  data: any,
  req: Request,
  res: Response,
  statusCode: number = 200
) => {
  // Ensure request ID exists
  if (!req.id) {
    req.id = uuidv4();
  }

  const timestamp = new Date().toISOString();
  const path = `/api/v1${req.path}`;
  const requestId = req.id;

  return res.status(statusCode).json({
    status: 'success',
    statusCode,
    data: {
      ...data,
      timestamp,
      path
    },
    requestId,
    documentation_url: 'https://api.example.com/docs'
  });
};

/**
 * Success response wrapper
 * Usage: wrap(async (req, res, next) => { ... })
 */
export const successWrapper = (fn: Function) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await fn(req, res, next);
      if (result) {
        successHandler(result, req, res);
      }
    } catch (error) {
      next(error);
    }
  };
}; 