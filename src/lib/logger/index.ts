/**
 * Log levels for the logging system
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * Log entry structure
 */
export interface ILogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  stack?: string;
}

/**
 * Logger interface
 */
export interface ILogger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

/**
 * Logger - Centralized logging service for the application
 * Implements singleton pattern for consistent logging across the app
 * 
 * Features:
 * - Structured JSON logging
 * - Log levels (DEBUG, INFO, WARN, ERROR)
 * - Context support for additional metadata
 * - Error stack trace capture
 * - Environment-aware (production vs development)
 */
export class Logger implements ILogger {
  private static instance: Logger;
  private readonly isDevelopment: boolean;
  private readonly logLevel: LogLevel;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
    this.logLevel = this.parseLogLevel(process.env.LOG_LEVEL || 'INFO');
  }

  /**
   * Get singleton instance of Logger
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Parse log level from string
   */
  private parseLogLevel(level: string): LogLevel {
    const upperLevel = level.toUpperCase();
    if (Object.values(LogLevel).includes(upperLevel as LogLevel)) {
      return upperLevel as LogLevel;
    }
    return LogLevel.INFO;
  }

  /**
   * Get numeric priority of log level
   */
  private getLevelPriority(level: LogLevel): number {
    const priorities: Record<LogLevel, number> = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 1,
      [LogLevel.WARN]: 2,
      [LogLevel.ERROR]: 3,
    };
    return priorities[level];
  }

  /**
   * Check if log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    return this.getLevelPriority(level) >= this.getLevelPriority(this.logLevel);
  }

  /**
   * Format log entry
   */
  private formatEntry(level: LogLevel, message: string, context?: Record<string, unknown>): ILogEntry {
    const entry: ILogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (context) {
      // Extract error stack if present
      if (context.error instanceof Error) {
        entry.stack = context.error.stack;
        entry.context = {
          ...context,
          error: {
            name: context.error.name,
            message: context.error.message,
          },
        };
      } else {
        entry.context = context;
      }
    }

    return entry;
  }

  /**
   * Output log entry
   */
  private output(entry: ILogEntry): void {
    const output = this.isDevelopment
      ? this.formatDevelopment(entry)
      : JSON.stringify(entry);

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(output);
        break;
      case LogLevel.WARN:
        console.warn(output);
        break;
      case LogLevel.DEBUG:
        console.debug(output);
        break;
      default:
        console.log(output);
    }
  }

  /**
   * Format log entry for development (human-readable)
   */
  private formatDevelopment(entry: ILogEntry): string {
    const levelColors: Record<LogLevel, string> = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m',  // Green
      [LogLevel.WARN]: '\x1b[33m',  // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
    };
    const reset = '\x1b[0m';
    const color = levelColors[entry.level];

    let output = `${color}[${entry.level}]${reset} ${entry.timestamp} - ${entry.message}`;
    
    if (entry.context) {
      output += ` ${JSON.stringify(entry.context)}`;
    }
    
    if (entry.stack) {
      output += `\n${entry.stack}`;
    }

    return output;
  }

  /**
   * Log debug message
   */
  public debug(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.output(this.formatEntry(LogLevel.DEBUG, message, context));
    }
  }

  /**
   * Log info message
   */
  public info(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.output(this.formatEntry(LogLevel.INFO, message, context));
    }
  }

  /**
   * Log warning message
   */
  public warn(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.output(this.formatEntry(LogLevel.WARN, message, context));
    }
  }

  /**
   * Log error message
   */
  public error(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.output(this.formatEntry(LogLevel.ERROR, message, context));
    }
  }

  /**
   * Create child logger with preset context
   */
  public child(context: Record<string, unknown>): ChildLogger {
    return new ChildLogger(this, context);
  }
}

/**
 * ChildLogger - Logger with preset context
 */
export class ChildLogger implements ILogger {
  private parent: Logger;
  private context: Record<string, unknown>;

  constructor(parent: Logger, context: Record<string, unknown>) {
    this.parent = parent;
    this.context = context;
  }

  public debug(message: string, additionalContext?: Record<string, unknown>): void {
    this.parent.debug(message, { ...this.context, ...additionalContext });
  }

  public info(message: string, additionalContext?: Record<string, unknown>): void {
    this.parent.info(message, { ...this.context, ...additionalContext });
  }

  public warn(message: string, additionalContext?: Record<string, unknown>): void {
    this.parent.warn(message, { ...this.context, ...additionalContext });
  }

  public error(message: string, additionalContext?: Record<string, unknown>): void {
    this.parent.error(message, { ...this.context, ...additionalContext });
  }
}

/**
 * Request logger middleware helper
 */
export class RequestLogger {
  private logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
  }

  /**
   * Log incoming request
   */
  public logRequest(
    method: string,
    path: string,
    context?: Record<string, unknown>
  ): void {
    this.logger.info(`${method} ${path}`, {
      type: 'request',
      ...context,
    });
  }

  /**
   * Log response
   */
  public logResponse(
    method: string,
    path: string,
    statusCode: number,
    durationMs: number,
    context?: Record<string, unknown>
  ): void {
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    
    this.logger[level](`${method} ${path} - ${statusCode}`, {
      type: 'response',
      statusCode,
      durationMs,
      ...context,
    });
  }
}

// Export singleton instance
export const logger = Logger.getInstance();
