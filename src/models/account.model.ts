import { PrismaClient, Account } from '@prisma/client';
import { IAccountRepository, ISignupInput } from '@/types/auth.types';

const prisma = new PrismaClient();

export class AccountModel implements IAccountRepository {
  async findByEmail(email: string): Promise<Account | null> {
    return prisma.account.findUnique({
      where: { email },
    });
  }

  async create(data: ISignupInput): Promise<Omit<Account, 'password'>> {
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
}