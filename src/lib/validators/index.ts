import { ValidationError } from '../errors';

export interface IValidator<T> {
  validate(data: unknown): T;
}

export abstract class BaseValidator<T> implements IValidator<T> {
  protected errors: Record<string, string> = {};

  protected abstract validateData(data: unknown): T;

  public validate(data: unknown): T {
    this.errors = {};
    const result = this.validateData(data);
    
    if (Object.keys(this.errors).length > 0) {
      throw new ValidationError('Validation failed', this.errors);
    }
    
    return result;
  }

  protected addError(field: string, message: string): void {
    this.errors[field] = message;
  }

  protected isEmail(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  protected isString(value: unknown): value is string {
    return typeof value === 'string';
  }

  protected isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  protected minLength(value: string, min: number): boolean {
    return value.length >= min;
  }

  protected maxLength(value: string, max: number): boolean {
    return value.length <= max;
  }

  protected sanitizeString(value: unknown): string {
    if (!this.isString(value)) return '';
    return value.trim().replace(/[<>]/g, '');
  }
}

export class RegisterValidator extends BaseValidator<{
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
}> {
  protected validateData(data: unknown) {
    if (!this.isObject(data)) {
      this.addError('body', 'Invalid request body');
      throw new ValidationError('Validation failed', this.errors);
    }

    const email = this.sanitizeString(data.email);
    const password = this.sanitizeString(data.password);
    const firstName = this.sanitizeString(data.firstName);
    const lastName = this.sanitizeString(data.lastName);
    const phone = data.phone ? this.sanitizeString(data.phone) : undefined;
    const company = data.company ? this.sanitizeString(data.company) : undefined;

    if (!email) {
      this.addError('email', 'Email is required');
    } else if (!this.isEmail(email)) {
      this.addError('email', 'Invalid email format');
    }

    if (!password) {
      this.addError('password', 'Password is required');
    } else if (!this.minLength(password, 8)) {
      this.addError('password', 'Password must be at least 8 characters');
    }

    if (!firstName) {
      this.addError('firstName', 'First name is required');
    } else if (!this.minLength(firstName, 2)) {
      this.addError('firstName', 'First name must be at least 2 characters');
    }

    if (!lastName) {
      this.addError('lastName', 'Last name is required');
    } else if (!this.minLength(lastName, 2)) {
      this.addError('lastName', 'Last name must be at least 2 characters');
    }

    return { email, password, firstName, lastName, phone, company };
  }
}

export class LoginValidator extends BaseValidator<{
  email: string;
  password: string;
}> {
  protected validateData(data: unknown) {
    if (!this.isObject(data)) {
      this.addError('body', 'Invalid request body');
      throw new ValidationError('Validation failed', this.errors);
    }

    const email = this.sanitizeString(data.email);
    const password = this.sanitizeString(data.password);

    if (!email) {
      this.addError('email', 'Email is required');
    } else if (!this.isEmail(email)) {
      this.addError('email', 'Invalid email format');
    }

    if (!password) {
      this.addError('password', 'Password is required');
    }

    return { email, password };
  }
}

export class UpdateProfileValidator extends BaseValidator<{
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
}> {
  protected validateData(data: unknown) {
    if (!this.isObject(data)) {
      this.addError('body', 'Invalid request body');
      throw new ValidationError('Validation failed', this.errors);
    }

    const result: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      company?: string;
    } = {};

    if (data.firstName !== undefined) {
      const firstName = this.sanitizeString(data.firstName);
      if (!this.minLength(firstName, 2)) {
        this.addError('firstName', 'First name must be at least 2 characters');
      } else {
        result.firstName = firstName;
      }
    }

    if (data.lastName !== undefined) {
      const lastName = this.sanitizeString(data.lastName);
      if (!this.minLength(lastName, 2)) {
        this.addError('lastName', 'Last name must be at least 2 characters');
      } else {
        result.lastName = lastName;
      }
    }

    if (data.phone !== undefined) {
      result.phone = this.sanitizeString(data.phone);
    }

    if (data.company !== undefined) {
      result.company = this.sanitizeString(data.company);
    }

    return result;
  }
}

const VALID_ISSUE_TYPES = ['CLOUD_SECURITY', 'RETEAM_ASSESSMENT', 'VAPT'] as const;
const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
const VALID_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const;

export class CreateIssueValidator extends BaseValidator<{
  type: typeof VALID_ISSUE_TYPES[number];
  title: string;
  description: string;
  priority?: typeof VALID_PRIORITIES[number];
  status?: typeof VALID_STATUSES[number];
}> {
  protected validateData(data: unknown) {
    if (!this.isObject(data)) {
      this.addError('body', 'Invalid request body');
      throw new ValidationError('Validation failed', this.errors);
    }

    const type = this.sanitizeString(data.type).toUpperCase() as typeof VALID_ISSUE_TYPES[number];
    const title = this.sanitizeString(data.title);
    const description = this.sanitizeString(data.description);
    const priority = data.priority 
      ? this.sanitizeString(data.priority).toUpperCase() as typeof VALID_PRIORITIES[number]
      : undefined;
    const status = data.status
      ? this.sanitizeString(data.status).toUpperCase() as typeof VALID_STATUSES[number]
      : undefined;

    if (!type) {
      this.addError('type', 'Issue type is required');
    } else if (!VALID_ISSUE_TYPES.includes(type)) {
      this.addError('type', 'Invalid issue type. Must be CLOUD_SECURITY, RETEAM_ASSESSMENT, or VAPT');
    }

    if (!title) {
      this.addError('title', 'Title is required');
    } else if (!this.minLength(title, 5)) {
      this.addError('title', 'Title must be at least 5 characters');
    } else if (!this.maxLength(title, 200)) {
      this.addError('title', 'Title must be at most 200 characters');
    }

    if (!description) {
      this.addError('description', 'Description is required');
    } else if (!this.minLength(description, 10)) {
      this.addError('description', 'Description must be at least 10 characters');
    }

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      this.addError('priority', 'Invalid priority. Must be LOW, MEDIUM, HIGH, or CRITICAL');
    }

    if (status && !VALID_STATUSES.includes(status)) {
      this.addError('status', 'Invalid status. Must be OPEN, IN_PROGRESS, RESOLVED, or CLOSED');
    }

    return { type, title, description, priority, status };
  }
}

export class UpdateIssueValidator extends BaseValidator<{
  type?: typeof VALID_ISSUE_TYPES[number];
  title?: string;
  description?: string;
  priority?: typeof VALID_PRIORITIES[number];
  status?: typeof VALID_STATUSES[number];
}> {
  protected validateData(data: unknown) {
    if (!this.isObject(data)) {
      this.addError('body', 'Invalid request body');
      throw new ValidationError('Validation failed', this.errors);
    }

    const result: {
      type?: typeof VALID_ISSUE_TYPES[number];
      title?: string;
      description?: string;
      priority?: typeof VALID_PRIORITIES[number];
      status?: typeof VALID_STATUSES[number];
    } = {};

    if (data.type !== undefined) {
      const type = this.sanitizeString(data.type).toUpperCase() as typeof VALID_ISSUE_TYPES[number];
      if (!VALID_ISSUE_TYPES.includes(type)) {
        this.addError('type', 'Invalid issue type. Must be CLOUD_SECURITY, RETEAM_ASSESSMENT, or VAPT');
      } else {
        result.type = type;
      }
    }

    if (data.title !== undefined) {
      const title = this.sanitizeString(data.title);
      if (!this.minLength(title, 5)) {
        this.addError('title', 'Title must be at least 5 characters');
      } else if (!this.maxLength(title, 200)) {
        this.addError('title', 'Title must be at most 200 characters');
      } else {
        result.title = title;
      }
    }

    if (data.description !== undefined) {
      const description = this.sanitizeString(data.description);
      if (!this.minLength(description, 10)) {
        this.addError('description', 'Description must be at least 10 characters');
      } else {
        result.description = description;
      }
    }

    if (data.priority !== undefined) {
      const priority = this.sanitizeString(data.priority).toUpperCase() as typeof VALID_PRIORITIES[number];
      if (!VALID_PRIORITIES.includes(priority)) {
        this.addError('priority', 'Invalid priority. Must be LOW, MEDIUM, HIGH, or CRITICAL');
      } else {
        result.priority = priority;
      }
    }

    if (data.status !== undefined) {
      const status = this.sanitizeString(data.status).toUpperCase() as typeof VALID_STATUSES[number];
      if (!VALID_STATUSES.includes(status)) {
        this.addError('status', 'Invalid status. Must be OPEN, IN_PROGRESS, RESOLVED, or CLOSED');
      } else {
        result.status = status;
      }
    }

    return result;
  }
}
