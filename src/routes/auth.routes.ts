import { AuthController } from "@/controllers/auth.controller";
import { AuthLimiter } from "@/middleware/ratelimit.middleware";
import { validateRequestBody } from "@/middleware/security.middleware";
import { RouterConfig } from "@/types/route.types";
import { isAuthenticated } from "@/middleware/jwt.middleware";

export const AuthRoutes: RouterConfig = {
  prefix: "/auth",
  routes: [
    {
      path: "/signup",
      method: "post",
      handler: AuthController.Signup,
      middlewares: [AuthLimiter, validateRequestBody],
    },
    {
      path: "/login",
      method: "post",
      handler: AuthController.Login,
      middlewares: [AuthLimiter, validateRequestBody],
    },
    {
      path: "/refresh",
      method: "post",
      handler: AuthController.RefreshToken,
      middlewares: [AuthLimiter, validateRequestBody],
    },
    {
      path: "/logout",
      method: "post",
      handler: AuthController.Logout,
      middlewares: [AuthLimiter, validateRequestBody],
    },
    {
      path: "/test",
      method: "post",
      handler: (req, res) => {
        res.json({ message: "Test Dashboard" })
      },
      middlewares: [AuthLimiter, validateRequestBody, isAuthenticated],
    },
  ],
};