import express from 'express';
import { validate } from '../../middlewares/validate';
import { z } from 'zod';
import { ApiResponse } from '../../types';

const router = express.Router();

/**
 * @route GET /api/v1/auth/hello
 * @desc Simple Hello World route for testing
 * @access Public
 */
router.get('/hello', (req, res) => {
  const response: ApiResponse = {
    status: 'success',
    message: 'Hello World from Auth Route!',
    data: {
      timestamp: new Date().toISOString()
    },
    requestId: req.id
  };
  
  res.status(200).json(response);
});

/**
 * @route GET /api/v1/auth/hello-validated
 * @desc Hello World route with validation
 * @access Public
 */
router.get('/hello-validated', 
  validate({
    query: z.object({
      name: z.string().optional()
    })
  }), 
  (req, res) => {
    const name = req.query.name || 'World';
    
    const response: ApiResponse = {
      status: 'success',
      message: `Hello ${name} from Validated Auth Route!`,
      data: {
        name,
        timestamp: new Date().toISOString()
      },
      requestId: req.id
    };
    
    res.status(200).json(response);
  }
);

export default router;

