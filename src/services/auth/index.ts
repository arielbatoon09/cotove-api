import { SignupService } from "@/services/auth/signup.service";
import { LoginService } from "@/services/auth/login.service";
import { RefreshTokenService } from "@/services/auth/refreshtoken.service";
import { OTP } from "@/services/auth/otp.service";
import { ISignupInput, ILoginInput, IAuthTokens, IAccountId, IVerifyOTP } from "@/types/auth.types";
import { ApiResponse } from "@/utils/ApiResponse";
import { LogoutService } from "@/services/auth/logout.service";

export class AuthService {
  static async Signup(data: ISignupInput): Promise<ApiResponse> {
    return await SignupService.create(data);
  }
  static async Login(data: ILoginInput): Promise<ApiResponse> {
    return await LoginService.process(data);
  }
  static async Refresh(data: IAuthTokens): Promise<ApiResponse> {
    return await RefreshTokenService.process(data);
  }
  static async VerifyOTP(data: IVerifyOTP): Promise<ApiResponse> {
    return OTP.email(data);
  }
  static async ResendOTP(data: IAccountId): Promise<ApiResponse> {
    return OTP.resend(data);
  }
  static async Logout(data: IAccountId): Promise<ApiResponse> {
    return await LogoutService.process(data);
  }
}