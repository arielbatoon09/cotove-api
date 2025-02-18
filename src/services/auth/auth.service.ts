import { SignupService } from "@/services/auth/signup.service";
import { LoginService } from "./login.service";
import { ISignupInput, ILoginInput } from "@/types/auth.types";
import { ApiResponse } from "@/utils/ApiResponse";

export class AuthService {
  static async Signup(data: ISignupInput): Promise<ApiResponse> {
    return await SignupService.create(data);
  }
  static async Login(data: ILoginInput): Promise<ApiResponse> {
    return await LoginService.process(data);
  }
}
