import type { Request, Response, NextFunction } from "express";
import userService from "@/services/user";
import { createUserSchema, loginUserSchema } from "@/models/user-model-ts";
import { ApiError } from "@/utils/api-error";
import { verifyPassword } from "@/utils/hash";

// Handle Create User
export async function handleCreateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedData = createUserSchema.parse(req.body);

    const existingUser = await userService.getUserByEmail(validatedData.email);
    if (existingUser) {
      throw new ApiError(409, 'Email already exists');
    }
    
    const newUser = await userService.addUser(validatedData);
    
    res.status(201).json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    });
  } catch (error) {
    next(error);
  }
}

// Handle Logging in
export async function handleLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedData = loginUserSchema.parse(req.body);

    const isValidEmail = await userService.getUserByEmail(validatedData.email);
    if (!isValidEmail) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isPasswordValid = await verifyPassword(validatedData.password, isValidEmail.password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    res.status(200).json({
      success: true,
      message: 'Logged in successfully'
    });
  } catch (error) {
    next(error);
  }
}