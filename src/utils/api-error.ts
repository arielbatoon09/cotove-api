/**
 * Custom API Error class for handling operational and programming errors
 * 
 * @class ApiError
 * @extends {Error}
 */
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
   * Creates an instance of ApiError
   * 
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {boolean} [isOperational=true] - Whether the error is operational
   * @param {string} [requestId] - Request ID for tracking
   */
  constructor(
    statusCode: number,
    message: string,
    isOperational: boolean = true,
    requestId?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.requestId = requestId;
    
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype);
    
    // Capture stack trace
    if (!this.stack) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}