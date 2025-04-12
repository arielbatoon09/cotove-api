import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError, z } from 'zod';
import { logger } from '../config/logger';
import { ApiError } from '../utils/api-error';
import status from 'http-status';

/**
 * Schema for request validation
 */
type RequestSchema = {
  params?: AnyZodObject;
  query?: AnyZodObject;
  body?: AnyZodObject;
};

/**
 * Validation middleware for request parameters, query, and body
 * 
 * @param {RequestSchema} schema - Zod schema for validation
 * @returns {Function} Express middleware function
 */
export const validate = (schema: RequestSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the incoming request details
      logger.info('Validating request:', {
        path: req.path,
        method: req.method,
        requestId: req.id
      });
      
      // Validate each part separately
      if (schema.params) {
        await schema.params.parseAsync(req.params);
      }
      
      if (schema.query) {
        await schema.query.parseAsync(req.query);
      }
      
      if (schema.body) {
        await schema.body.parseAsync(req.body);
      }
      
      return next();
    } catch (error) {
      // Log the full error for debugging
      logger.error('Validation error:', {
        error,
        requestId: req.id,
        path: req.path,
        method: req.method
      });
      
      if (error instanceof ZodError) {
        const errorMessage = error.errors.map((err) => err.message).join(', ');
        return next(new ApiError(
          status.BAD_REQUEST, 
          errorMessage,
          true,
          req.id
        ));
      }
      
      // Log unexpected errors with stack trace
      logger.error('Unexpected validation error:', {
        error,
        stack: error instanceof Error ? error.stack : 'No stack trace available',
        requestId: req.id
      });
      
      return next(new ApiError(
        status.INTERNAL_SERVER_ERROR, 
        'Internal server error',
        false,
        req.id
      ));
    }
  };
};