import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/utils/api-error';
import { logger } from '@/config/logger';
import status from 'http-status';
import { v4 as uuidv4 } from 'uuid';
import { ZodError } from 'zod';

// Extend Express Request type to include id
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

/**
 * Request ID middleware to add a unique ID to each request
 */
export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  req.id = uuidv4();
  next();
};

/**
 * Global error handler middleware
 * Handles both operational (ApiError) and programming errors
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error
  logger.error('Error:', {
    error: err,
    requestId: req.id,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    user: req.user,
    stack: err.stack
  });

  // Handle ApiError (operational errors)
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: err.name,
      requestId: err.requestId || req.id,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Handle programming errors (unexpected errors)
  return res.status(500).json({
    success: false,
    message: 'An unexpected error occurred',
    error: 'InternalServerError',
    requestId: req.id,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Async handler wrapper to catch async errors
 * Usage: wrap(async (req, res, next) => { ... })
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Global error handler middleware
 * 
 * @param {Error} err - The error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const errorHandlerOld = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error with request ID if available
  const requestId = req.id;
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    requestId,
    path: req.path,
    method: req.method
  });
  
  // Handle API errors
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      requestId: err.requestId || requestId
    });
    return;
  }
  
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(status.BAD_REQUEST).json({
      status: 'error',
      message: 'Validation error',
      errors: err.errors.map(error => ({
        field: error.path.join('.'),
        message: error.message
      })),
      requestId
    });
    return;
  }
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    res.status(status.BAD_REQUEST).json({
      status: 'error',
      message: err.message,
      requestId
    });
    return;
  }
  
  // Handle database errors
  if (err.name === 'PostgresError' || err.name === 'DatabaseError') {
    // Check for unique constraint violations
    if (err.message.includes('duplicate key')) {
      res.status(status.CONFLICT).json({
        status: 'error',
        message: 'Resource already exists',
        requestId
      });
      return;
    }
    
    // Handle other database errors
    res.status(status.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Database error',
      requestId
    });
    return;
  }
  
  // Handle unknown errors
  res.status(status.INTERNAL_SERVER_ERROR).json({
    status: 'error',
    message: 'Internal server error',
    requestId
  });
}; 