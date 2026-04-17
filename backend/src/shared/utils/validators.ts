import { ValidationError } from '../errors/AppError.js';

export class Validators {
  static email(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }
  }

  static password(password: string): void {
    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      throw new ValidationError(
        'Password must contain at least one uppercase letter'
      );
    }
    if (!/[0-9]/.test(password)) {
      throw new ValidationError('Password must contain at least one number');
    }
  }

  static username(username: string): void {
    if (username.length < 3 || username.length > 20) {
      throw new ValidationError('Username must be between 3 and 20 characters');
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      throw new ValidationError('Username can only contain letters, numbers, _ and -');
    }
  }

  static notEmpty(value: string | unknown, fieldName: string): void {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      throw new ValidationError(`${fieldName} is required`);
    }
  }

  static required<T>(value: T | null | undefined, fieldName: string): asserts value is T {
    if (value === null || value === undefined) {
      throw new ValidationError(`${fieldName} is required`);
    }
  }
}
