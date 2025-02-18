import { Router, Request, Response, NextFunction } from "express";

type Middleware = (req: Request, res: Response, next: NextFunction) => void;
type RouteHandler = (req: Request, res: Response, next: NextFunction) => void;

interface RouteConfig {
  path: string;
  method: "get" | "post" | "put" | "delete";
  handler: RouteHandler;
  middlewares?: Middleware[];
}

interface RouterConfig {
  prefix: string;
  routes: RouteConfig[];
  middlewares?: Middleware[];
}

export const composeMiddleware = (middlewares: Middleware[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return middlewares.reduce((promise, middleware) => {
      return promise.then(() => new Promise((resolve) => {
        middleware(req, res, () => resolve());
      }));
    }, Promise.resolve())
      .then(() => next())
      .catch((error) => next(error));
  };
};

export const createRouter = (config: RouterConfig): Router => {
  const router = Router();
  const baseMiddlewares = config.middlewares || [];

  config.routes.forEach((route) => {
    const routeMiddlewares = route.middlewares || [];
    const combinedMiddlewares = [...baseMiddlewares, ...routeMiddlewares];
    
    if (combinedMiddlewares.length > 0) {
      router[route.method](
        route.path,
        composeMiddleware(combinedMiddlewares),
        route.handler
      );
    } else {
      router[route.method](route.path, route.handler);
    }
  });

  return router;
};