import { AuthTokenModel } from "@/models/authtoken.model";
import { ITokenPayload, IAuthTokens } from "@/types/auth.types";
import jwt, { SignOptions } from 'jsonwebtoken';

export class TokenService {
  private static ACCESS_TOKEN_EXPIRY = 86400;// 24 hours
  private static REFRESH_TOKEN_EXPIRY = 604800; // 7 days
  private static MAX_REFRESH_TOKENS_PER_USER = 5;

  private constructor() {}

  public static async getTokens(accountId: string): Promise<IAuthTokens> {
    return this.generateTokens(accountId);
  }

  public static async cleanupTokens(accountId: string): Promise<void> {
    return this.processCleanupTokens(accountId);
  }

  // Private function/s
  private static async generateTokens(accountId: string): Promise<IAuthTokens> {
    const token = new AuthTokenModel();

    const accessTokenOptions: SignOptions = {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
      jwtid: crypto.randomUUID(),
    };

    const accessToken = jwt.sign(
      { accountId } as ITokenPayload,
      process.env.JWT_ACCESS_SECRET!,
      accessTokenOptions
    );

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + this.ACCESS_TOKEN_EXPIRY);    

    await token.create({
      token: accessToken,
      accountId,
      expiresAt,
    });

    return { accessToken };
  }

  private static async processCleanupTokens(accountId: string): Promise<void> {
    const token = new AuthTokenModel();
    await token.removeExpiredTokens(accountId);
    const tokenCount = await token.countValidTokens(accountId);

    if (tokenCount > this.MAX_REFRESH_TOKENS_PER_USER) {
      await token.deleteOldestTokens(
        accountId,
        tokenCount - this.MAX_REFRESH_TOKENS_PER_USER,
      );
    }

  }
}