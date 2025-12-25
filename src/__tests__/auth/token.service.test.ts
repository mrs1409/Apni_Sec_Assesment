/**
 * Unit Tests for TokenService (JWT Token Management)
 * Tests token generation and verification
 */

import { AuthUtils } from '../../lib/auth';

describe('TokenService', () => {
  const tokenService = AuthUtils.getTokenService();

  const testPayload = {
    userId: 'user-123',
    email: 'test@example.com',
    role: 'user',
  };

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = tokenService.generateAccessToken(testPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should generate different tokens for different payloads', () => {
      const token1 = tokenService.generateAccessToken(testPayload);
      const token2 = tokenService.generateAccessToken({
        ...testPayload,
        userId: 'user-456',
      });

      expect(token1).not.toBe(token2);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = tokenService.generateRefreshToken(testPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

    it('should generate different tokens from access tokens', () => {
      const accessToken = tokenService.generateAccessToken(testPayload);
      const refreshToken = tokenService.generateRefreshToken(testPayload);

      expect(accessToken).not.toBe(refreshToken);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', () => {
      const token = tokenService.generateAccessToken(testPayload);
      const decoded = tokenService.verifyAccessToken(token);

      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(testPayload.userId);
      expect(decoded?.email).toBe(testPayload.email);
      expect(decoded?.role).toBe(testPayload.role);
    });

    it('should return null for an invalid token', () => {
      const decoded = tokenService.verifyAccessToken('invalid-token');

      expect(decoded).toBeNull();
    });

    it('should return null for a refresh token', () => {
      const refreshToken = tokenService.generateRefreshToken(testPayload);
      const decoded = tokenService.verifyAccessToken(refreshToken);

      // Refresh tokens use different secret, so verification should fail
      expect(decoded).toBeNull();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const token = tokenService.generateRefreshToken(testPayload);
      const decoded = tokenService.verifyRefreshToken(token);

      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(testPayload.userId);
      expect(decoded?.email).toBe(testPayload.email);
      expect(decoded?.role).toBe(testPayload.role);
    });

    it('should return null for an invalid token', () => {
      const decoded = tokenService.verifyRefreshToken('invalid-token');

      expect(decoded).toBeNull();
    });

    it('should return null for an access token', () => {
      const accessToken = tokenService.generateAccessToken(testPayload);
      const decoded = tokenService.verifyRefreshToken(accessToken);

      // Access tokens use different secret, so verification should fail
      expect(decoded).toBeNull();
    });
  });
});
