/**
 * DOMAIN - SERVERS ERRORS
 * Erreurs métier spécifiques aux serveurs
 */

import { AppError } from '@shared/errors/AppError';

export class ServerError extends AppError {
  constructor(message: string) {
    super(message, 'SERVER_ERROR', 400);
    this.name = 'ServerError';
  }
}

export class ServerNotFoundError extends ServerError {
  constructor() {
    super('Serveur non trouvé');
    this.name = 'ServerNotFoundError';
  }
}

export class ServerAccessDeniedError extends ServerError {
  constructor() {
    super('Accès refusé à ce serveur');
    this.name = 'ServerAccessDeniedError';
  }
}

export class InvalidServerDataError extends ServerError {
  constructor(details: string) {
    super(`Données serveur invalides: ${details}`);
    this.name = 'InvalidServerDataError';
  }
}
