export class OTPCode {
  public static async generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}