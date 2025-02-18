import { Request, Response, NextFunction } from 'express';

export type Middleware = (req: Request, res: Response, next: NextFunction) => void;
export type RouteHandler = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;

export interface RouteConfig {
  path: string;
  method: 'get' | 'post' | 'put' | 'delete';
  handler: RouteHandler;
  middlewares?: Middleware[];
}

export interface RouterConfig {
  prefix: string;
  routes: RouteConfig[];
  middlewares?: Middleware[];
}