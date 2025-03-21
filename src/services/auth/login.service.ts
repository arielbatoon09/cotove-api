import bcrypt from "bcryptjs";
import Logger from "@/utils/Logger";
import { AccountModel } from "@/models/account.model";
import { ILoginInput } from "@/types/auth.types";
import { ApiResponse } from "@/utils/ApiResponse";
import { TokenService } from "@/services/auth/tokens.service";

export class LoginService {
  public static async process(data: ILoginInput): Promise<ApiResponse> {
    return this.processLogin(data);
  }
  
  // Private function/s
  private static async processLogin(data: ILoginInput): Promise<ApiResponse> {
    const account = new AccountModel();
    const existingAccount = await account.findByEmail(data.email);

    if (!existingAccount) {
      return ApiResponse.error("Invalid credentials", null, 401);
    }

    const isValidPassword = await bcrypt.compare(data.password, existingAccount.password);
    if (!isValidPassword) {
      return ApiResponse.error("Invalid credentials", null, 401);
    }

    // clean unused and expired tokens
    await TokenService.cleanupTokens(existingAccount.id);

    const { accessToken } = await TokenService.getTokens(existingAccount.id);

    const { password: _, ...userWithoutPassword } = existingAccount;

    Logger.success(`[Authentication] ${data.email} is successfuly logged in.`)
    return ApiResponse.success("Login successfully", {
      ...userWithoutPassword,
      accessToken
    });
  }
}