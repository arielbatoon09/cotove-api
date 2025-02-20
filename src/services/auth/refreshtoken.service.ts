import { AuthTokenModel } from "@/models/authtoken.model";
import { IAuthTokens } from "@/types/auth.types";
import { ApiResponse } from "@/utils/ApiResponse";
import { ITokenPayload } from "@/types/auth.types";
import { TokenService } from "@/services/auth/tokens.service";
import jwt from "jsonwebtoken";

export class RefreshTokenService {
  public static async process(data: IAuthTokens): Promise<ApiResponse> {
    return this.processRefreshToken(data);
  }
  
  // Private function/s
  private static async processRefreshToken(data: IAuthTokens): Promise<ApiResponse> {
    const token = new AuthTokenModel();
    const decoded = jwt.verify(data.accessToken, process.env.JWT_ACCESS_SECRET!) as ITokenPayload;

    const storedToken = await token.findValidToken(
      decoded.accountId,
      data.accessToken
    );

    if (!storedToken) {
      return ApiResponse.error("Unauthorized: Invalid access token", null, 401);
    }

    // Delete token
    await token.deleteToken(storedToken.id);
    await TokenService.cleanupTokens(decoded.accountId);
    const { accessToken } = await TokenService.getTokens(decoded.accountId);

    return ApiResponse.success("Refresh token successfully", {
      accessToken
    });
  }
}