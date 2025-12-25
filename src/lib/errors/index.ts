export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
}

export abstract class BaseError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCode;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    errorCode: ErrorCode,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  public toJSON(): object {
    return {
      success: false,
      error: {
        code: this.errorCode,
        message: this.message,
        statusCode: this.statusCode,
      },
    };
  }
}

export class ValidationError extends BaseError {
  public readonly fields: Record<string, string>;

  constructor(message: string, fields: Record<string, string> = {}) {
    super(message, 400, ErrorCode.VALIDATION_ERROR);
    this.fields = fields;
  }

  public toJSON(): object {
    return {
      ...super.toJSON(),
      fields: this.fields,
    };
  }
}

export class AuthenticationError extends BaseError {
  constructor(message = 'Authentication failed') {
    super(message, 401, ErrorCode.AUTHENTICATION_ERROR);
  }
}

export class AuthorizationError extends BaseError {
  constructor(message = 'Access denied') {
    super(message, 403, ErrorCode.AUTHORIZATION_ERROR);
  }
}

export class NotFoundError extends BaseError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, ErrorCode.NOT_FOUND);
  }
}

export class ConflictError extends BaseError {
  constructor(message: string) {
    super(message, 409, ErrorCode.CONFLICT);
  }
}

export class RateLimitError extends BaseError {
  public readonly retryAfter: number;

  constructor(retryAfter: number) {
    super('Too many requests. Please try again later.', 429, ErrorCode.RATE_LIMIT_EXCEEDED);
    this.retryAfter = retryAfter;
  }

  public toJSON(): object {
    return {
      ...super.toJSON(),
      retryAfter: this.retryAfter,
    };
  }
}

export class InternalServerError extends BaseError {
  constructor(message = 'An unexpected error occurred') {
    super(message, 500, ErrorCode.INTERNAL_SERVER_ERROR, false);
  }
}

export class BadRequestError extends BaseError {
  constructor(message: string) {
    super(message, 400, ErrorCode.BAD_REQUEST);
  }
}

export class ErrorHandler {
  public static handle(error: unknown): { status: number; body: object } {
    if (error instanceof BaseError) {
      return {
        status: error.statusCode,
        body: error.toJSON(),
      };
    }

    console.error('Unhandled error:', error);
    const internalError = new InternalServerError();
    return {
      status: internalError.statusCode,
      body: internalError.toJSON(),
    };
  }
}
