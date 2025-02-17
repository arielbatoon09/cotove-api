import bcrypt from "bcryptjs";
import { AccountModel } from "@/models/account.model";
import { ISignupInput } from "@/types/auth.types";
import { ApiResponse } from "@/utils/ApiResponse";

export class SignupService {
  private static async isEmailTaken(email: string): Promise<boolean> {
    const account = new AccountModel();
    const existingEmail = await account.findByEmail(email);
    return existingEmail != null;
  }

  public static async create(data: ISignupInput): Promise<ApiResponse> {
    const emailTaken = await SignupService.isEmailTaken(data.email);
    if (emailTaken) {
      return ApiResponse.error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const account = new AccountModel();
    const newAccount = await account.create({
      ...data,
      password: hashedPassword,
    });

    return ApiResponse.success("Signup successfully", newAccount);
  }
}
