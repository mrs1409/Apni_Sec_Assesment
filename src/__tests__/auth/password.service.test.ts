/**
 * Unit Tests for PasswordService
 * Tests password hashing and comparison
 */

import { AuthUtils } from '../../lib/auth';

describe('PasswordService', () => {
  const passwordService = AuthUtils.getPasswordService();

  describe('hash', () => {
    it('should hash a password', async () => {
      const password = 'SecurePassword123!';
      const hash = await passwordService.hash(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(password);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'SecurePassword123!';
      const hash1 = await passwordService.hash(password);
      const hash2 = await passwordService.hash(password);

      // bcrypt generates different salts each time
      expect(hash1).not.toBe(hash2);
    });

    it('should generate hash starting with bcrypt prefix', async () => {
      const password = 'SecurePassword123!';
      const hash = await passwordService.hash(password);

      // bcrypt hashes start with $2a$ or $2b$
      expect(hash.startsWith('$2')).toBe(true);
    });
  });

  describe('compare', () => {
    it('should return true for matching password', async () => {
      const password = 'SecurePassword123!';
      const hash = await passwordService.hash(password);

      const isMatch = await passwordService.compare(password, hash);

      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'SecurePassword123!';
      const wrongPassword = 'WrongPassword456!';
      const hash = await passwordService.hash(password);

      const isMatch = await passwordService.compare(wrongPassword, hash);

      expect(isMatch).toBe(false);
    });

    it('should return false for empty password', async () => {
      const password = 'SecurePassword123!';
      const hash = await passwordService.hash(password);

      const isMatch = await passwordService.compare('', hash);

      expect(isMatch).toBe(false);
    });

    it('should handle special characters in password', async () => {
      const password = 'P@$$w0rd!#$%^&*()';
      const hash = await passwordService.hash(password);

      const isMatch = await passwordService.compare(password, hash);

      expect(isMatch).toBe(true);
    });

    it('should handle unicode characters in password', async () => {
      const password = 'パスワード123!';
      const hash = await passwordService.hash(password);

      const isMatch = await passwordService.compare(password, hash);

      expect(isMatch).toBe(true);
    });
  });
});
