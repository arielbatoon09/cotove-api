import { Request, Response } from "express";
import { ILoginInput, ISignupInput, IAuthTokens, IAccountId, IVerifyOTP } from "@/types/auth.types";
import { LoginSchema, SignupSchema, RefreshTokenSchema, LogoutSchema, OTPSchema, ResendOTPSchema } from "@/schema/auth.schema";
import { AuthService } from "@/services/auth";
import { ApiResponse } from "@/utils/ApiResponse";
import { ZodError } from "zod";
import Logger from "@/utils/Logger";

export class AuthController {
  public static async Signup(req: Request, res: Response): Promise<void> {
    try {
      const data: ISignupInput = SignupSchema.parse(req.body);
      const result = await AuthService.Signup(data);
      res.status(result.status).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        const errorResponse = ApiResponse.error("validationError", error.errors);
        res.status(400).json(errorResponse);

        // Log if there's missing schema
        Logger.warn("[Authentication]: Failed to validate payload!");
      } else {
        const errorResponse = ApiResponse.error("Network Error: Something went wrong!", null, 500);
        res.status(errorResponse.status).json(errorResponse);
        
        // Log if signup results server error
        Logger.error("[Authentication] Server network error!");
      }
    }
  }

  public static async Login(req: Request, res: Response): Promise<void> {
    try {
      const data: ILoginInput = LoginSchema.parse(req.body);
      const result = await AuthService.Login(data);
      res.status(result.status).json(result);

    } catch (error) {
      const errorResponse = ApiResponse.error("Network Error: Something went wrong!", null, 500);
      res.status(errorResponse.status).json(errorResponse);
      
      // Log if login results server error
      Logger.error("[Authentication] Server network error!");
    }
  }

  public static async RefreshToken(req: Request, res: Response): Promise<void> {
    try {
      const data: IAuthTokens = RefreshTokenSchema.parse(req.body);
      const result = await AuthService.Refresh(data);
      res.status(result.status).json(result);

    } catch (error) {
      if (error instanceof ZodError) {
        const errorResponse = ApiResponse.error("validationError", error.errors);
        res.status(400).json(errorResponse);

        // Log if there's missing schema
        Logger.warn("[Authentication]: Failed to validate payload!");
      } else {
        const errorResponse = ApiResponse.error("Network Error: Something went wrong!", null, 500);
        res.status(errorResponse.status).json(errorResponse);
        
        // Log if signup results server error
        Logger.error("[Authentication] Server network error!");
      }
    }
  }

  public static async VerifyOTP(req: Request, res: Response): Promise<void> {
    try {
      const data: IVerifyOTP = OTPSchema.parse(req.body);
      const result = await AuthService.VerifyOTP(data);
      res.status(result.status).json(result);
      
    } catch (error) {
      if (error instanceof ZodError) {
        const errorResponse = ApiResponse.error("validationError", error.errors);
        res.status(400).json(errorResponse);

        // Log if there's missing schema
        Logger.warn("[Authentication]: Failed to validate payload!");
      } else {
        const errorResponse = ApiResponse.error("Network Error: Something went wrong!", null, 500);
        res.status(errorResponse.status).json(errorResponse);
        
        // Log if signup results server error
        Logger.error("[Authentication] Server network error!");
      }
    }
  }

  public static async ResendOTP(req: Request, res: Response): Promise<void> {
    try {
      const data: IAccountId = ResendOTPSchema.parse(req.body);
      const result = await AuthService.ResendOTP(data);
      res.status(result.status).json(result);

    } catch (error) {
      if (error instanceof ZodError) {
        const errorResponse = ApiResponse.error("validationError", error.errors);
        res.status(400).json(errorResponse);

        // Log if there's missing schema
        Logger.warn("[Authentication]: Failed to validate payload!");
      } else {
        const errorResponse = ApiResponse.error("Network Error: Something went wrong!", null, 500);
        res.status(errorResponse.status).json(errorResponse);
        
        // Log if signup results server error
        Logger.error("[Authentication] Server network error!");
      }
    }
  }

  public static async Logout(req: Request, res: Response): Promise<void> {
    try {
      const data: IAccountId = LogoutSchema.parse(req.body);
      const result = await AuthService.Logout(data);
      res.status(result.status).json(result);
      
    } catch (error) {
      if (error instanceof ZodError) {
        const errorResponse = ApiResponse.error("validationError", error.errors);
        res.status(400).json(errorResponse);

        // Log if there's missing schema
        Logger.warn("[Authentication]: Failed to validate payload!");
      } else {
        const errorResponse = ApiResponse.error("Network Error: Something went wrong!", null, 500);
        res.status(errorResponse.status).json(errorResponse);
        
        // Log if signup results server error
        Logger.error("[Authentication] Server network error!");
      }
    }
  }
}