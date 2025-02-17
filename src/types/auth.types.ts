import { Account } from "@prisma/client";

export interface ISignupInput {
  fullname: string;
  email: string;
  password: string;
  phone: string;
}

export interface IAuthResponse {
  account: Omit<Account, 'password'>;
}

// Repository Interfaces
export interface IAccountInterface {
  create(data: ISignupInput): Promise<Omit<Account, 'password'>>;
}