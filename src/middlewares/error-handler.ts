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
 * Format Zod validation errors into a clean message
 */
const formatZodError = (error: ZodError): string => {
  return error.errors.map(err => {
    const field = err.path.join('.');
    return `${field}: ${err.message}`;
  }).join(', ');
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
  // Ensure request ID exists
  if (!req.id) {
    req.id = uuidv4();
  }

  // Log the error for debugging
  logger.error('Error:', {
    error: err,
    requestId: req.id,
    path: req.path,
    method: req.method,
    stack: err.stack
  });

  const timestamp = new Date().toISOString();
  // Check if path already includes /api/v1
  const path = req.path.startsWith('/api/v1') ? req.path : `/api/v1${req.path}`;

  // Handle ApiError (operational errors)
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      data: {
        code: err.name,
        message: err.message,
        details: err.details ? JSON.parse(err.details) : 'No additional details available',
        timestamp,
        path
      },
      requestId: req.id,
      documentation_url: 'https://api.example.com/docs/errors'
    });
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(status.BAD_REQUEST).json({
      status: 'error',
      statusCode: status.BAD_REQUEST,
      data: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: err.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        })),
        timestamp,
        path
      },
      requestId: req.id,
      documentation_url: 'https://api.example.com/docs/errors#VALIDATION_ERROR'
    });
  }

  // Handle programming errors (unexpected errors)
  return res.status(500).json({
    status: 'error',
    statusCode: 500,
    data: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong. Please try again later.',
      details: 'An unexpected error occurred on the server',
      timestamp,
      path
    },
    requestId: req.id,
    documentation_url: 'https://api.example.com/docs/errors#INTERNAL_SERVER_ERROR'
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