/**
 * Jest Test Setup
 * Global configuration for all tests
 */

// Set test environment variables
Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', writable: true });
process.env.JWT_ACCESS_SECRET = 'test-access-secret-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-32-characters-long';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods to keep test output clean
global.console = {
  ...console,
  // Uncomment to suppress logs during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};
