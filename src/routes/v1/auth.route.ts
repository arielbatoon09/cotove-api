import type { Router } from "express";
import { createRouter } from "@/utils/create-handler";
import { authController } from "@/controllers/auth.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";

export default createRouter((router: Router) => {
  router.post('/signup', authController.signup);
  router.post('/login', authController.login);
  router.get('/verify-email/:token', authController.verifyEmail);
  router.post('/request-password-reset', authController.requestPasswordReset);
  router.post('/reset-password', authController.resetPassword);
  router.post('/refresh-token', authController.refreshToken);
  router.post('/logout', authMiddleware, authController.logout);

  // Sample Protected Route
  router.post('/protected', authMiddleware, (req, res) => {
    res.json({ message: 'Protected route' });
  });
});