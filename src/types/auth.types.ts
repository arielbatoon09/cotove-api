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
  role: string;
}

export interface IAuthTokens {
  accessToken: string;
}

export interface IAccountId {
  accountId: string;
}

// Repository Interfaces
export interface IAccountRepository {
  findByEmail(email: string): Promise<Account | null>;
  create(data: ISignupInput): Promise<Omit<Account, 'password'>>;
}

export interface IAuthTokenRepository {
  create(data: {
    token: string;
    accountId: string;
    expiresAt: Date;
  }): Promise<AuthToken>;
  findValidToken(accountId: string, token: string): Promise<AuthToken | null>;
  deleteToken(id: string): Promise<void>;
  removeTokens(accountId: string): Promise<void>
  removeExpiredTokens(accountId: string): Promise<void>;
  countValidTokens(accountId: string): Promise<number>;
  deleteOldestTokens(accountId: string, count: number): Promise<void>;
}