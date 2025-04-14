import type { Router } from "express";
import { createRouter } from "@/utils/create-handler";
import { AuthController } from "@/controllers/auth.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
const authController = new AuthController();

export default createRouter((router: Router) => {
  router.post('/signup', authController.signup);
  router.post('/login', authController.login);
  router.post('/verify-email', authController.verifyEmail);
  router.post('/request-password-reset', authController.requestPasswordReset);
  router.post('/reset-password', authController.resetPassword);
  router.post('/refresh-token', authController.refreshToken);
  router.post('/logout', authController.logout);

  // Sample Protected Route
  router.post('/protected', authMiddleware, (req, res) => {
    res.json({ message: 'Protected route' });
  });
});