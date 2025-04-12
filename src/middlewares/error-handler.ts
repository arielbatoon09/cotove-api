import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';
import { logger } from '../config/logger';
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
 * 
 * @param {Error} err - The error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const errorHandler = (
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