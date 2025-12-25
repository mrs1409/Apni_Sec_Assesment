/**
 * Unit Tests for Error Classes
 * Tests custom error handling
 */

import {
  BaseError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ErrorHandler,
} from '../../lib/errors';

describe('Custom Errors', () => {
  describe('BaseError', () => {
    it('should be extended by custom errors', () => {
      const error = new ValidationError('Test error');

      expect(error).toBeInstanceOf(BaseError);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('ValidationError', () => {
    it('should create ValidationError with 400 status', () => {
      const error = new ValidationError('Invalid input');

      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should include field errors', () => {
      const fields = { email: 'Invalid email format' };
      const error = new ValidationError('Validation failed', fields);

      expect(error.fields).toEqual(fields);
    });
  });

  describe('AuthenticationError', () => {
    it('should create AuthenticationError with 401 status', () => {
      const error = new AuthenticationError('Not authenticated');

      expect(error.message).toBe('Not authenticated');
      expect(error.statusCode).toBe(401);
      expect(error).toBeInstanceOf(AuthenticationError);
    });

    it('should have default message', () => {
      const error = new AuthenticationError();

      expect(error.message).toBe('Authentication failed');
    });
  });

  describe('AuthorizationError', () => {
    it('should create AuthorizationError with 403 status', () => {
      const error = new AuthorizationError('Not authorized');

      expect(error.message).toBe('Not authorized');
      expect(error.statusCode).toBe(403);
      expect(error).toBeInstanceOf(AuthorizationError);
    });
  });

  describe('NotFoundError', () => {
    it('should create NotFoundError with 404 status', () => {
      const error = new NotFoundError('User');

      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
      expect(error).toBeInstanceOf(NotFoundError);
    });
  });

  describe('ConflictError', () => {
    it('should create ConflictError with 409 status', () => {
      const error = new ConflictError('Email already exists');

      expect(error.message).toBe('Email already exists');
      expect(error.statusCode).toBe(409);
      expect(error).toBeInstanceOf(ConflictError);
    });
  });

  describe('RateLimitError', () => {
    it('should create RateLimitError with 429 status', () => {
      const error = new RateLimitError(60);

      expect(error.statusCode).toBe(429);
      expect(error).toBeInstanceOf(RateLimitError);
    });

    it('should include retryAfter value', () => {
      const error = new RateLimitError(120);

      expect(error.retryAfter).toBe(120);
      expect(error.message).toContain('Too many requests');
    });
  });
});

describe('ErrorHandler', () => {
  describe('handle', () => {
    it('should handle ValidationError correctly', () => {
      const error = new ValidationError('Invalid input');
      const result = ErrorHandler.handle(error);

      expect(result.status).toBe(400);
      expect(result.body).toHaveProperty('success', false);
    });

    it('should handle generic Error with 500 status', () => {
      const error = new Error('Something went wrong');
      const result = ErrorHandler.handle(error);

      expect(result.status).toBe(500);
      expect(result.body).toHaveProperty('success', false);
    });

    it('should handle unknown errors', () => {
      const result = ErrorHandler.handle('string error');

      expect(result.status).toBe(500);
      expect(result.body).toHaveProperty('success', false);
    });
  });
});
