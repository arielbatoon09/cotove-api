import bcrypt from "bcryptjs";
import Logger from "@/utils/Logger";
import { AccountModel } from "@/models/account.model";
import { ISignupInput } from "@/types/auth.types";
import { ApiResponse } from "@/utils/ApiResponse";
import { TokenService } from "@/services/auth/tokens.service";

export class SignupService {
  public static async create(data: ISignupInput): Promise<ApiResponse> {
    return this.processSignup(data);
  }
  
  // Private function/s
  private static async isEmailTaken(email: string): Promise<boolean> {
    const account = new AccountModel();
    const existingEmail = await account.findByEmail(email);
    return existingEmail != null;
  }

  private static async processSignup(data: ISignupInput): Promise<ApiResponse> {
    const emailTaken = await this.isEmailTaken(data.email);
    if (emailTaken) {
      Logger.error(`[Authentication] ${data.fullname} is trying to sign up with an existing email.`);
      return ApiResponse.error("Email already exists", null, 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const account = new AccountModel();
    const newAccount = await account.create({
      ...data,
      password: hashedPassword,
    });

    const { accessToken } = await TokenService.getTokens(newAccount.id);

    Logger.success(`[Authentication] This ${data.email} is newly created account.`);

    return ApiResponse.success("Signup successfully", {
      ...newAccount,
      accessToken,
    }, 201);
  }
}