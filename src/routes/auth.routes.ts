import { AuthController } from "@/controllers/auth.controller";
import { AuthLimiter } from "@/middleware/ratelimit.middleware";
import { validateRequestBody } from "@/middleware/security.middleware";
import { RouterConfig } from "@/types/route.types"

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
  ],
};