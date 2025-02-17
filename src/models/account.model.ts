import { PrismaClient, Account } from '@prisma/client';
import { IAccountInterface, ISignupInput } from '@/types/auth.types';

const prisma = new PrismaClient();

export class AccountModel implements IAccountInterface {
  async findByEmail(email: string): Promise<Account | null> {
    return prisma.account.findUnique({
      where: { email },
    });
  }

  async create(data: ISignupInput): Promise<Omit<Account, 'password'>> {
    const account = await prisma.account.create({
      data: {
        ...data,
        verified_at: null,
      },
      select: {
        id: true,
        fullname: true,
        email: true,
        phone: true,
        role: true,
        verified_at: true,
        created_at: true,
        updated_at: true,
      },
    });

    return account;
  }
}