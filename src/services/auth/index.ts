import { SignupService } from "@/services/auth/signup.service";
import { LoginService } from "./login.service";
import { RefreshTokenService } from "./refreshtoken.service";
import { ISignupInput, ILoginInput, IAuthTokens, IAccountId } from "@/types/auth.types";
import { ApiResponse } from "@/utils/ApiResponse";
import { LogoutService } from "./logout.service";

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
  static async Logout(data: IAccountId): Promise<ApiResponse> {
    return await LogoutService.process(data);
  }
}