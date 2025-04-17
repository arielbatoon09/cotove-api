/**
 * Custom API Error class for handling operational and programming errors
 * 
 * @class ApiError
 * @extends {Error}
 */
import { ZodError } from 'zod';

export class ApiError extends Error {
  /**
   * HTTP status code for the error
   */
  public readonly statusCode: number;
  
  /**
   * Whether the error is operational (expected) or programming (unexpected)
   */
  public readonly isOperational: boolean;
  
  /**
   * Request ID for tracking and debugging
   */
  public readonly requestId?: string;

  /**
   * Additional error details
   */
  public readonly details?: string;

  /**
   * Creates an instance of ApiError
   * 
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {boolean} [isOperational=true] - Whether the error is operational
   * @param {string} [requestId] - Request ID for tracking
   * @param {string} [details] - Additional error details
   */
  constructor(
    statusCode: number,
    message: string,
    isOperational: boolean = true,
    requestId?: string,
    details?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.requestId = requestId;
    this.details = details;
    
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype);
    
    // Capture stack trace
    if (!this.stack) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static fromZodError(error: ZodError, requestId?: string): ApiError {
    const validationErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }));
    
    return new ApiError(
      400,
      'Validation error',
      true,
      requestId,
      JSON.stringify(validationErrors)
    );
  }
}