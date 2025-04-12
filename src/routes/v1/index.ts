import express from 'express';
import authRoute from './auth.route';
import { ApiResponse } from '../../types';

const router = express.Router();

/**
 * @route GET /api/v1/health
 * @desc Health check endpoint
 * @access Public
 */
router.get('/health', (req, res) => {
  const response: ApiResponse = {
    status: 'success',
    message: 'API is running',
    data: {
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0'
    },
    requestId: req.id
  };
  
  res.status(200).json(response);
});

// Mount routes
router.use('/auth', authRoute);

export default router; 