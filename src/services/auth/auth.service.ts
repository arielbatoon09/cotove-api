import { SignupService } from "@/services/auth/signup.service";
import { ISignupInput } from "@/types/auth.types";
import { ApiResponse } from "@/utils/ApiResponse";

export class AuthService {
  static async Signup(data: ISignupInput): Promise<ApiResponse> {
    return await SignupService.create(data);
  }
}
