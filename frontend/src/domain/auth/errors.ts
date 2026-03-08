/**
 * DOMAIN - AUTH ERRORS
 * Erreurs métier spécifiques à l'authentification
 */

import { AppError } from '@shared/errors/AppError';

export class AuthError extends AppError {
  declare name: string;
  
  constructor(message: string) {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthError';
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

export class InvalidCredentialsError extends AuthError {
  declare name: string;

  constructor(message?: string) {
    super(message || 'Email ou mot de passe incorrect');
    this.name = 'InvalidCredentialsError';
    Object.setPrototypeOf(this, InvalidCredentialsError.prototype);
  }
}

export class UserAlreadyExistsError extends AuthError {
  declare name: string;

  constructor(message?: string) {
    super(message || 'Cet email existe déjà');
    this.name = 'UserAlreadyExistsError';
    Object.setPrototypeOf(this, UserAlreadyExistsError.prototype);
  }
}

export class TokenExpiredError extends AuthError {
  declare name: string;
  
  constructor() {
    super('Votre session a expiré');
    this.name = 'TokenExpiredError';
    Object.setPrototypeOf(this, TokenExpiredError.prototype);
  }
}

export class UnauthorizedError extends AuthError {
  declare name: string;
  
  constructor() {
    super('Non autorisé');
    this.name = 'UnauthorizedError';
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}


