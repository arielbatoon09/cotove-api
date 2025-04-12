import bcrypt from 'bcrypt';
import crypto from 'crypto';

/**
 * Hash a password using bcrypt with a salt round of 12
 * @param password The plain text password to hash
 * @returns A promise that resolves to the hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  // Use a higher salt round (12) for better security
  return bcrypt.hash(password, 12);
}

/**
 * Verify a password against a hash
 * @param password The plain text password to verify
 * @param hashedPassword The hashed password to compare against
 * @returns A promise that resolves to true if the password matches, false otherwise
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a secure random token
 * @param length The length of the token in bytes (default: 32)
 * @returns A promise that resolves to a secure random token
 */
export async function generateSecureToken(length: number = 32): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(length, (err, buffer) => {
      if (err) reject(err);
      resolve(buffer.toString('hex'));
    });
  });
}

/**
 * Hash a token using SHA-256
 * @param token The token to hash
 * @returns The hashed token
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Verify a token against a hash
 * @param token The token to verify
 * @param hashedToken The hashed token to compare against
 * @returns True if the token matches, false otherwise
 */
export function verifyToken(token: string, hashedToken: string): boolean {
  return hashToken(token) === hashedToken;
}
