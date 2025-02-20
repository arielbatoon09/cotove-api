import prisma from "@/lib/prisma";
import { AuthToken } from "@prisma/client";
import { IAuthTokenRepository } from "@/types/auth.types";

export class AuthTokenModel implements IAuthTokenRepository {
  async create(data: {
    token: string;
    accountId: string;
    expiresAt: Date;
  }): Promise<AuthToken> {
    return prisma.authToken.create({
      data,
    });
  }

  async findValidToken(accountId: string, token: string): Promise<AuthToken | null> {
    return prisma.authToken.findFirst({
      where: {
        accountId,
        token,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  async deleteToken(id: string): Promise<void> {
    await prisma.authToken.delete({
      where: { id },
    });
  }

  async removeExpiredTokens(accountId: string): Promise<void> {
    await prisma.authToken.deleteMany({
      where: {
        accountId,
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  async countValidTokens(accountId: string): Promise<number> {
    return prisma.authToken.count({
      where: {
        accountId,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  async deleteOldestTokens(accountId: string, count: number): Promise<void> {
    const tokens = await prisma.authToken.findMany({
      where: {
        accountId,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: count,
    });

    await prisma.authToken.deleteMany({
      where: {
        id: {
          in: tokens.map(token => token.id),
        },
      },
    });
  }
}