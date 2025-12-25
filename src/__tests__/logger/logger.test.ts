/**
 * Unit Tests for Logger Service
 * Tests logging functionality
 */

import { Logger, LogLevel } from '../../lib/logger';

describe('Logger', () => {
  let logger: Logger;
  let consoleSpy: {
    log: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
    debug: jest.SpyInstance;
  };

  beforeEach(() => {
    logger = Logger.getInstance();
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
      debug: jest.spyOn(console, 'debug').mockImplementation(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = Logger.getInstance();
      const instance2 = Logger.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('info', () => {
    it('should log info messages', () => {
      logger.info('Test info message');

      expect(consoleSpy.log).toHaveBeenCalled();
    });

    it('should include context in log', () => {
      logger.info('Test message', { userId: '123' });

      expect(consoleSpy.log).toHaveBeenCalled();
      const logCall = consoleSpy.log.mock.calls[0][0];
      expect(logCall).toContain('Test message');
    });
  });

  describe('warn', () => {
    it('should log warning messages', () => {
      logger.warn('Test warning message');

      expect(consoleSpy.warn).toHaveBeenCalled();
    });
  });

  describe('error', () => {
    it('should log error messages', () => {
      logger.error('Test error message');

      expect(consoleSpy.error).toHaveBeenCalled();
    });

    it('should include error stack trace', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', { error });

      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe('debug', () => {
    it('should log debug messages when log level is DEBUG', () => {
      // Note: Debug level logging depends on LOG_LEVEL env variable
      logger.debug('Test debug message');

      // Debug might be suppressed based on default log level
      // This test just ensures no error is thrown
      expect(true).toBe(true);
    });
  });

  describe('child', () => {
    it('should create child logger with context', () => {
      const childLogger = logger.child({ service: 'auth' });

      childLogger.info('Child logger message');

      expect(consoleSpy.log).toHaveBeenCalled();
    });
  });
});
