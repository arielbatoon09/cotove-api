import { IAccountId, IVerifyOTP } from "@/types/auth.types";
import { ApiResponse } from "@/utils/ApiResponse";
import { OTPCodeModel } from "@/models/otpcode.model";
import { AccountModel } from "@/models/account.model";
import { OtpCode } from "@prisma/client";

export class OTP {
  private static OTP_EXPIRY_SECONDS = 600;

  public static async email(data: IVerifyOTP): Promise<ApiResponse> {
    return this.emailVerification(data);
  }

  public static async generate(accountId: string): Promise<OtpCode | null> {
    return this.generateOTP(accountId);
  }

  // To ask for new code
  public static async resend(data: IAccountId): Promise<ApiResponse> {
    const otp = new OTPCodeModel();
    const countValidOTP = await otp.countValidOTP(data.accountId);
    const countAllOTP = await otp.countAllOTP(data.accountId);

     // If no OTP exists at all, prevent resend
    if (countAllOTP === 0) {
      return ApiResponse.error("No OTP has been requested before.", null, 400);
    }
  
    // If a valid OTP exists, prevent generating a new one
    if (countValidOTP > 0) { 
      return ApiResponse.error("There's already a valid OTP code. Please use it before requesting a new one.", null, 400);
    }
  
    // Generate new OTP
    const generate = await this.generateOTP(data.accountId);
    const otpCode = generate?.code;
  
    if (!otpCode) {
      return ApiResponse.error("Failed to generate OTP code.", null, 400);
    }
  
    return ApiResponse.success("Sent new OTP code successfully", { otpCode }, 200);
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

    // Delete all unverified OTPs for this account
    await otp.deleteUnverifiedOTPs(data.accountId);

    return ApiResponse.success("Account successfully verified.", null, 200);
  }

  // Generate OTP and Store it in the DB
  private static async generateOTP(accountId: string): Promise<OtpCode | null> {
    try {
      const otpModel = new OTPCodeModel();
      const result = await otpModel.create({
        accountId: accountId,
        code: this.randomizedOTP(),
        expiresAt: new Date(Date.now() + this.OTP_EXPIRY_SECONDS * 1000),
      });

      return result;
    } catch (error) {
      return null;
    }
  }  

  private static randomizedOTP() {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp;
  }
}