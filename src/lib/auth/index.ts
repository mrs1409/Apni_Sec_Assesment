export { AuthUtils, PasswordService, TokenService } from './utils';
export { 
  AuthMiddleware,
  CookieManager,
  // Legacy function exports for backward compatibility
  setAuthCookies, 
  clearAuthCookies, 
  getRefreshTokenFromCookie 
} from './middleware';
export type { IAuthenticatedRequest } from './middleware';
