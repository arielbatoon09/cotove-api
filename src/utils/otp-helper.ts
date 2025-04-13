import crypto from 'crypto';

/**
 * Generates a secure numeric OTP of specified length
 * @param length The length of the OTP (default: 6)
 * @returns A string containing the OTP
 */
export function generateOtp(length: number = 6): string {
  const randomBytes = crypto.randomBytes(length);
  let otp = '';
  
  // Convert random bytes to digits
  for (let i = 0; i < length; i++) {
    const digit = randomBytes[i] % 10;
    otp += digit.toString();
  }
  
  return otp;
}

/**
 * Validates if a string is a valid numeric OTP
 * @param otp The OTP to validate
 * @param length The expected length of the OTP (default: 6)
 * @returns True if the OTP is valid, false otherwise
 */
export function isValidOtp(otp: string, length: number = 6): boolean {
  // Check if the OTP is a string of exactly the specified length
  if (typeof otp !== 'string' || otp.length !== length) {
    return false;
  }
  
  // Check if the OTP contains only digits
  return /^\d+$/.test(otp);
}

/**
 * Generates an expiration time for an OTP
 * @param seconds The number of seconds until expiration (default: 15)
 * @returns A Date object representing the expiration time
 */
export function generateOtpExpiration(seconds: number = 15): Date {
  const expirationTime = new Date();
  expirationTime.setSeconds(expirationTime.getSeconds() + seconds);
  return expirationTime;
}