import { generateToken, generateAuthTokens, generateEmailVerificationToken, generatePasswordResetToken } from './generate-token-service';
import { storeToken, storeRefreshToken } from './store-token-service';
import { verifyToken, blacklistToken } from './verify-token-service';

const tokenService = {
  generateToken,
  generateAuthTokens,
  generateEmailVerificationToken,
  generatePasswordResetToken,
  storeToken,
  storeRefreshToken,
  verifyToken,
  blacklistToken
};

export default tokenService;
