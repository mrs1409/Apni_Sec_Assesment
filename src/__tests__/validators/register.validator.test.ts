/**
 * Unit Tests for RegisterValidator
 * Tests input validation for user registration
 */

import { RegisterValidator } from '../../lib/validators';
import { ValidationError } from '../../lib/errors';

describe('RegisterValidator', () => {
  let validator: RegisterValidator;

  beforeEach(() => {
    validator = new RegisterValidator();
  });

  describe('validate', () => {
    it('should validate a correct registration payload', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = validator.validate(validData);

      expect(result).toEqual(validData);
    });

    it('should accept optional fields', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        company: 'ApniSec',
      };

      const result = validator.validate(validData);

      expect(result).toEqual(validData);
    });

    it('should throw ValidationError for missing email', () => {
      const invalidData = {
        password: 'SecurePassword123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      expect(() => validator.validate(invalidData)).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'SecurePassword123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      expect(() => validator.validate(invalidData)).toThrow(ValidationError);
    });

    it('should throw ValidationError for missing password', () => {
      const invalidData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      expect(() => validator.validate(invalidData)).toThrow(ValidationError);
    });

    it('should throw ValidationError for short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '123',
        firstName: 'John',
        lastName: 'Doe',
      };

      expect(() => validator.validate(invalidData)).toThrow(ValidationError);
    });

    it('should throw ValidationError for missing firstName', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
        lastName: 'Doe',
      };

      expect(() => validator.validate(invalidData)).toThrow(ValidationError);
    });

    it('should throw ValidationError for missing lastName', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
        firstName: 'John',
      };

      expect(() => validator.validate(invalidData)).toThrow(ValidationError);
    });

    it('should validate email case-insensitively', () => {
      const data = {
        email: 'TEST@EXAMPLE.COM',
        password: 'SecurePassword123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = validator.validate(data);

      // Validator preserves original case - normalization happens in repository
      expect(result.email).toBe('TEST@EXAMPLE.COM');
    });

    it('should trim whitespace from fields', () => {
      const data = {
        email: '  test@example.com  ',
        password: 'SecurePassword123!',
        firstName: '  John  ',
        lastName: '  Doe  ',
      };

      const result = validator.validate(data);

      expect(result.email).toBe('test@example.com');
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
    });
  });
});
