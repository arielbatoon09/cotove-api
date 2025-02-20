import { AuthTokenModel } from "@/models/authtoken.model";
import { IRefreshToken } from "@/types/auth.types";
import { ApiResponse } from "@/utils/ApiResponse";
import { ITokenPayload } from "@/types/auth.types";
import { TokenService } from "@/services/auth/tokens.service";
import jwt from "jsonwebtoken";

export class RefreshTokenService {
  public static async process(data: IRefreshToken): Promise<ApiResponse> {
    return this.processRefreshToken(data);
  }
  
  // Private function/s
  private static async processRefreshToken(data: IRefreshToken): Promise<ApiResponse> {
    const token = new AuthTokenModel();
    const decoded = jwt.verify(data.refreshToken, process.env.JWT_REFRESH_SECRET!) as ITokenPayload;

    const storedToken = await token.findValidToken(
      decoded.accountId,
      data.refreshToken
    );

    if (!storedToken) {
      return ApiResponse.error("Invalid refresh token", null, 401);
    }

    // Delete token
    await token.deleteToken(storedToken.id);
    await TokenService.cleanupTokens(decoded.accountId);
    const { accessToken, refreshToken } = await TokenService.getTokens(decoded.accountId);

    return ApiResponse.success("Refresh token successfully", {
      accessToken,
      refreshToken
    });
  }
}