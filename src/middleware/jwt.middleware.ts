import jwt from "jsonwebtoken";
import logger from "@/utils/Logger";
import prisma from "@/lib/prisma";
import { Request, Response, NextFunction } from "express";
import { ITokenPayload } from "@/types/auth.types";
import { ApiResponse } from "@/utils/ApiResponse";
import { AccountModel } from "@/models/account.model";

declare global {
  namespace Express {
    interface Request {
      accountId?: string;
      account?: {
        id: string;
        role: string;
        email: string;
      };
    }
  }
}

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json(ApiResponse.error( "Unauthorized: No token provided"));
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_ACCESS_SECRET) {
      logger.error("JWT secret is missing in environment variables");
      return res.status(500).json(ApiResponse.error("Internal server error"));
    }

    let decodedToken: ITokenPayload;

    try {
      decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET) as ITokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json(ApiResponse.error("Unauthorized: Token has expired"));
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json(ApiResponse.error("Unauthorized: Invalid token"));
      }
      throw error;
    }
    
    next();
  } catch (error) {
    logger.error(`[JWT] Internal server error: ${error}`);
    return res.status(500).json(ApiResponse.error("Internal server error"));
  }
};
