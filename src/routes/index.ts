import { Router } from "express";
import { createRouter } from "@/middleware/composer.middleware";
import { AuthRoutes } from "@/routes/auth.routes";


const routes = [
  AuthRoutes
];

const router = Router();
routes.forEach(routeGroup => {
  router.use(routeGroup.prefix, createRouter(routeGroup))
});

export default router;