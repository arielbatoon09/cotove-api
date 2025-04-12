import type { Request, Response, NextFunction } from "express";
import userService from "@/services/user";
import { createUserSchema } from "@/models/user-model-ts";
import { ApiError } from "@/utils/api-error";

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