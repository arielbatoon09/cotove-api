import prisma from "@/lib/prisma";
import { OtpCode } from "@prisma/client";
import { IOtpCodeRepository } from "@/types/auth.types";

export class OTPCodeModel implements IOtpCodeRepository {
  async create(data: {
    accountId: string;
    code: number;
    expiresAt: Date;
  }): Promise<OtpCode> {
    return prisma.otpCode.create({
      data: {
        accountId: data.accountId,
        code: data.code,
        expiresAt: data.expiresAt,
      }
    });
  }

  async findValidOTP(accountId: string): Promise<OtpCode | null> {
    return prisma.otpCode.findFirst({
      where: {
        accountId,
        isSuccess: 0,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async markOTPAsSuccess(otpId: string): Promise<OtpCode> {
    return prisma.otpCode.update({
      where: { id: otpId },
      data: {
        isSuccess: 1,
      },
    });
  }

  async countValidOTP(accountId: string): Promise<number> {
    return prisma.otpCode.count({
      where: {
        accountId,
        isSuccess: 0,
        expiresAt: {
          gt: new Date(),
        }
      }
    })
  }

  async countAllOTP(accountId: string): Promise<number> {
    return prisma.otpCode.count({
      where: {
        accountId,
        isSuccess: 0,
      }
    })
  }

  async deleteUnverifiedOTPs(accountId: string): Promise<void> {
    await prisma.otpCode.deleteMany({
      where: {
        accountId,
        isSuccess: 0,
      }
    })
  }
}