import prisma from "@/lib/prisma";
import { Account } from "@prisma/client";
import { IAccountRepository, ISignupInput } from "@/types/auth.types";

export class AccountModel implements IAccountRepository {
  async create(data: ISignupInput): Promise<Omit<Account, "password">> {
    const account = await prisma.account.create({
      data: {
        ...data,
        verifiedAt: null,
      },
      select: {
        id: true,
        fullname: true,
        email: true,
        phone: true,
        role: true,
        verifiedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return account;
  }

  async findByEmail(email: string): Promise<Account | null> {
    return prisma.account.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<Account | null> {
    return prisma.account.findUnique({
      where: { id },
    });
  }

  async updateVerifiedAt(id: string): Promise<Account> {
    return prisma.account.update({
      where: { id: id },
      data: {
        verifiedAt: new Date(),
      },
    });
  }
}