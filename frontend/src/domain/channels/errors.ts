/**
 * DOMAIN - CHANNELS ERRORS
 * Erreurs métier spécifiques aux canaux
 */

import { AppError } from '@shared/errors/AppError';

export class ChannelError extends AppError {
  declare name: string;
  
  constructor(message: string) {
    super(message, 'CHANNEL_ERROR', 400);
    this.name = 'ChannelError';
    Object.setPrototypeOf(this, ChannelError.prototype);
  }
}

export class ChannelNotFoundError extends ChannelError {
  declare name: string;
  
  constructor() {
    super('Canal non trouvé');
    this.name = 'ChannelNotFoundError';
    Object.setPrototypeOf(this, ChannelNotFoundError.prototype);
  }
}

export class ChannelAccessDeniedError extends ChannelError {
  declare name: string;
  
  constructor() {
    super('Accès refusé à ce canal');
    this.name = 'ChannelAccessDeniedError';
    Object.setPrototypeOf(this, ChannelAccessDeniedError.prototype);
  }
}

export class InvalidChannelNameError extends ChannelError {
  declare name: string;
  
  constructor() {
    super('Nom du canal invalide');
    this.name = 'InvalidChannelNameError';
    Object.setPrototypeOf(this, InvalidChannelNameError.prototype);
  }
}
