import jwt from "jsonwebtoken";
import logger from "@/utils/Logger";
import { Request, Response, NextFunction } from "express";
import { ITokenPayload } from "@/types/auth.types";
import { ApiResponse } from "@/utils/ApiResponse";
import { AuthTokenModel } from "@/models/authtoken.model";

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
    const token = new AuthTokenModel();

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json(ApiResponse.error("Unauthorized: No token provided.", null, 401));
    }

    const authToken = authHeader.split(" ")[1];

    if (!process.env.JWT_ACCESS_SECRET) {
      logger.error("JWT secret is missing in environment variables.");
      return res.status(500).json(ApiResponse.error("Internal server error", null, 500));
    }

    let decodedToken: ITokenPayload;

    try {
      // verify if the JWT token is valid
      decodedToken = jwt.verify(authToken, process.env.JWT_ACCESS_SECRET) as ITokenPayload;
      // Validate if the token is revoked - logouted
      const storedToken = await token.findValidToken(decodedToken.accountId, authToken);
      if (!storedToken) {
        return res.status(401).json(ApiResponse.error("Unauthorized: Token not found or revoked.", null, 401));
      }

      // Ensure the token access only let the account holder use it
      const accountId = req.params.accountId || req.body.accountId;
      if (accountId && decodedToken.accountId !== accountId) {
        return res.status(403).json(ApiResponse.error("Access Denied: Unauthorized account access.", null, 403));
      }

    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json(ApiResponse.error("Unauthorized: The token has expired.", null, 401));
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json(ApiResponse.error("Unauthorized: The token is invalid.", null, 401));
      }
      throw error;
    }
    
    next();
  } catch (error) {
    logger.error(`[JWT] Internal server error: ${error}`);
    return res.status(500).json(ApiResponse.error("Internal server error"));
  }
};
