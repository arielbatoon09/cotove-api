import { generateOtpExpiration } from "@/utils/otp-helper";
import { OtpModel } from "@/models/otp-model";
import { generateOtp } from "@/utils/otp-helper";
import { db } from "@/config/database";
import { otp } from "@/database/schema/otp.schema";
import { ApiError } from "@/utils/api-error";

// Define valid OTP types
export type OtpType = 'emailVerification' | 'phoneVerification' | 'resetPassword';

export const generateOtpByUserService = async (userId: string, type: OtpType) => {
  try {
    // Check if userId is valid
    if (!userId) {
      throw new ApiError(400, 'Invalid user ID');
    }

    const token = generateOtp(6);
    const expiration = generateOtpExpiration();

    // Create OTP model with userId
    const otpModel = new OtpModel({
      userId,
      token,
      type,
      expiresAt: expiration,
      blacklisted: false,
      attempts: 0
    });

    const otpData = {
      userId: userId,
      token: otpModel.token,
      type: otpModel.type,
      expiresAt: otpModel.expiresAt || expiration,
      blacklisted: otpModel.blacklisted,
      attempts: otpModel.attempts
    };

    const [newOtp] = await db.insert(otp)
      .values(otpData)
      .returning();
    
    const createdOtp = OtpModel.fromDB(newOtp);
    
    return createdOtp;
  } catch (error) {
    throw error;
  }
}