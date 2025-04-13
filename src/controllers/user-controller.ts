import type { Request, Response, NextFunction } from "express";
import userService from "@/services/user";
import { createUserSchema, loginUserSchema } from "@/models/user-model";
import { ApiError } from "@/utils/api-error";
import { verifyPassword } from "@/utils/hash";
import otpService from "@/services/otp";

// Handle Create User
export async function handleCreateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedData = createUserSchema.parse(req.body);

    const existingUser = await userService.getUserByEmail(validatedData.email);
    if (existingUser) {
      throw new ApiError(409, 'Email already exists');
    }
    
    // Add user to database
    const newUser = await userService.addUser(validatedData);

    // Check if user was created successfully
    if (!newUser.id) {
      throw new ApiError(500, 'Failed to create user');
    }

    // Generate OTP if user was created successfully
    const otp = await otpService.generateOtpByUserService(newUser.id, 'emailVerification');
    
    if (!otp) {
      throw new ApiError(500, 'Failed to generate OTP');
    }

    res.status(201).json({
      success: true,
      data: {
        user: newUser,
        otp: otp
      },
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