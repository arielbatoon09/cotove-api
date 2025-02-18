import { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import hpp from "hpp";

// Middleware to validate and sanitize request body
export const validateRequestBody = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === "object") {
    // Remove any null or undefined values
    Object.keys(req.body).forEach(key => {
      if (req.body[key] === null || req.body[key] === undefined) {
        delete req.body[key];
      }
    });

    // Trim string values
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === "string") {
        req.body[key] = req.body[key].trim();
      }
    });
  }

  next();
}

// Security headers middleware using helmet
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https:", "wss:"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https:"],
      frameSrc: ["'self'"],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'", "blob:"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  // Allow embedding of resources
  crossOriginEmbedderPolicy: false,
  // Allow popups for auth flows
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  // Allow cross-origin resource sharing
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: true,
  frameguard: {
    action: "sameorigin"
  },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { 
    policy: ["strict-origin-when-cross-origin"]
  },
  xssFilter: true
});

// Prevent HTTP Parameter Pollution with custom options
export const preventPollution = hpp({
  whitelist: [
    'filters',
    'sort',
    'include'
  ]
});

// Additional security middleware for request validation
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  // Validate Content-Type for POST/PUT/PATCH requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.headers['content-type'] !== 'application/json') {
    return res.status(415).json({
      status: 'error',
      message: 'Content-Type must be application/json'
    });
  }

  // Validate request size
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  // 10MB limit
  if (contentLength > 10 * 1024 * 1024) {
    return res.status(413).json({
      status: 'error',
      message: 'Request entity too large'
    });
  }

  next();
};