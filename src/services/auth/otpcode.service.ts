import { IVerifyOTP } from "@/types/auth.types";
import { ApiResponse } from "@/utils/ApiResponse";
import { OTPCodeModel } from "@/models/otpcode.model";
import { AccountModel } from "@/models/account.model";

export class OTPService {
  private static OTP_EXPIRY_SECONDS = 600;

  public static async email(data: IVerifyOTP): Promise<ApiResponse> {
    return this.emailVerification(data);
  }

  public static async generate(accountId: string): Promise<boolean> {
    return this.generateOTP(accountId);
  }

  // Verification of OTP Handler
  private static async emailVerification(data: IVerifyOTP): Promise<ApiResponse> {
    const otp = new OTPCodeModel();
    const account = new AccountModel();
    const validOTP = await otp.findValidOTP(data.accountId);

    // Validate if it's expired or exist
    if (!validOTP) {
      return ApiResponse.error("The OTP code has expired or was not found. Please request a new OTP.", null, 401);
    }

    // Validate if it's valid otp code
    if (validOTP.code !== data.code) {
      return ApiResponse.error("The provided OTP code is invalid. Please try again.", null, 401);
    }
    
    // If Success and Valid OTP code
    await otp.markOTPAsSuccess(validOTP.id);
    await account.updateVerifiedAt(data.accountId);

    return ApiResponse.success("Account successfully verified.", null, 200);
  }

  // Generate OTP and Store it in the DB
  private static async generateOTP(accountId: string): Promise<boolean> {
    try {
      const otp = new OTPCodeModel();
      await otp.create({
        accountId: accountId,
        code: this.randomizedOTP(),
        expiresAt: new Date(new Date().setSeconds(new Date().getSeconds() + this.OTP_EXPIRY_SECONDS)),
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  private static randomizedOTP() {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp;
  }
}