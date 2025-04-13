import { z } from 'zod';

export const createOtpSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email format'),
  otp: z.string()
    .regex(/^\d{6}$/, 'OTP must be 6 digits')
    .transform(val => parseInt(val, 10)),
});

export type CreateOtpInput = z.infer<typeof createOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export class OtpModel {
  id?: string;
  userId: string;
  token: string;
  type: string;
  expiresAt?: Date;
  blacklisted: boolean;
  attempts: number;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: Partial<OtpModel>) {
    this.id = data.id;
    this.userId = data.userId || '';
    this.token = data.token || '';
    this.type = data.type || '';
    this.expiresAt = data.expiresAt;
    this.blacklisted = data.blacklisted || false;
    this.attempts = data.attempts || 0;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      user_id: this.userId,
      token: this.token,
      type: this.type,
      expires_at: this.expiresAt,
      blacklisted: this.blacklisted,
      attempts: this.attempts,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }

  static fromDB(data: any): OtpModel {
    const otp = new OtpModel({
      id: data.id,
      userId: data.user_id,
      token: data.token,
      type: data.type,
      expiresAt: data.expires_at,
      blacklisted: data.blacklisted,
      attempts: data.attempts,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
    return otp;
  }

  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  isValid(): boolean {
    return !this.isExpired() && !this.blacklisted;
  }

  incrementAttempts(): void {
    this.attempts += 1;
  }

  blacklist(): void {
    this.blacklisted = true;
  }
}