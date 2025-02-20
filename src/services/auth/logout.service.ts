import { IAccountId } from "@/types/auth.types";
import { ApiResponse } from "@/utils/ApiResponse";
import { TokenService } from "./tokens.service";
import { AuthTokenModel } from "@/models/authtoken.model";

export class LogoutService {
  public static async process(data: IAccountId): Promise<ApiResponse> {
    const token = new AuthTokenModel();
    await token.removeTokens(data.accountId);
    await TokenService.cleanupTokens(data.accountId);
    return ApiResponse.success("Logout successfully");
  }
}