import rateLimit from "express-rate-limit";

// Global Requests
export const GlobalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: { 
    sucess: false,
    message: 'Too many requests from this IP, please try again later.',
    data: null
   },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false,
  skipSuccessfulRequests: false,
});


// Isolated for auth routes
export const AuthLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 100, // need to update lol for prod
  message: { 
    sucess: false,
    message: 'Too many authentication attempts, please try again later.',
    data: null
   },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false,
  skipSuccessfulRequests: false,
});