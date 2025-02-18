import { Account, AuthToken } from "@prisma/client";

export interface ISignupInput {
  fullname: string;
  email: string;
  password: string;
  phone: string;
}

export interface ILoginInput {
  email: string;
  password: string;
}

export interface ITokenPayload {
  accountId: string;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Repository Interfaces
export interface IAccountRepository {
  create(data: ISignupInput): Promise<Omit<Account, 'password'>>;
}

export interface IAuthTokenRepository {
  create(data: {
    token: string;
    accountId: string;
    expiresAt: Date;
  }): Promise<AuthToken>;
}