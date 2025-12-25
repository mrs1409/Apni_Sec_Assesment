/**
 * Unit Tests for LoginValidator
 * Tests input validation for user login
 */

import { LoginValidator } from '../../lib/validators';
import { ValidationError } from '../../lib/errors';

describe('LoginValidator', () => {
  let validator: LoginValidator;

  beforeEach(() => {
    validator = new LoginValidator();
  });

  describe('validate', () => {
    it('should validate a correct login payload', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
      };

      const result = validator.validate(validData);

      expect(result).toEqual(validData);
    });

    it('should throw ValidationError for missing email', () => {
      const invalidData = {
        password: 'SecurePassword123!',
      };

      expect(() => validator.validate(invalidData)).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'SecurePassword123!',
      };

      expect(() => validator.validate(invalidData)).toThrow(ValidationError);
    });

    it('should throw ValidationError for missing password', () => {
      const invalidData = {
        email: 'test@example.com',
      };

      expect(() => validator.validate(invalidData)).toThrow(ValidationError);
    });

    it('should validate email case-insensitively', () => {
      const data = {
        email: 'TEST@EXAMPLE.COM',
        password: 'SecurePassword123!',
      };

      const result = validator.validate(data);

      // Validator preserves original case - normalization happens in repository
      expect(result.email).toBe('TEST@EXAMPLE.COM');
    });

    it('should trim whitespace from email', () => {
      const data = {
        email: '  test@example.com  ',
        password: 'SecurePassword123!',
      };

      const result = validator.validate(data);

      expect(result.email).toBe('test@example.com');
    });

    it('should accept any password length', () => {
      // Login validator shouldn't restrict password length
      // Only register validator should enforce minimum length
      const data = {
        email: 'test@example.com',
        password: 'a',
      };

      const result = validator.validate(data);

      expect(result.password).toBe('a');
    });
  });
});
