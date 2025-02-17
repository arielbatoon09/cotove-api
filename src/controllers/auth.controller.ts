import { Request, Response } from "express";
import { ISignupInput } from "@/types/auth.types";
import { SignupSchema } from "@/schema/auth.schema";
import { AuthService } from "@/services/auth/auth.service";
import { ApiResponse } from "@/utils/ApiResponse";
import { ZodError } from "zod";
import Logger from "@/utils/Logger";

export class AuthController {
  /**
   * Handles user signup request.
   * 
   * - Validates the incoming request body using Zod schema.
   * - Calls the AuthService to create a new user.
   * - Returns appropriate response based on success or failure.
   * 
   * @param req - Express Request object containing the signup data.
   * @param res - Express Response object to send the result back to the client.
   */

  public static async signup(req: Request, res: Response): Promise<void> {
    try {
      const data: ISignupInput = SignupSchema.parse(req.body);
      const result = await AuthService.Signup(data);
      res.status(result.success ? 201 : 400).json(result);

      // Log successful signup event
      Logger.success("[Authentication] New user has joined!");
    } catch (error) {
      if (error instanceof ZodError) {
        const errorResponse = ApiResponse.error("error", error.errors);
        res.status(400).json(errorResponse);

        // Log if there's missing schema
        Logger.warn("[Authentication]: Failed to validate payload!");
      } else {
        const errorResponse = ApiResponse.error("Network Error: Something went wrong!");
        res.status(500).json(errorResponse);
        
        // Log if signup results server error
        Logger.error("[Authentication] Server network error!");
      }
    }
  }
}