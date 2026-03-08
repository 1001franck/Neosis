/**
 * DOMAIN - MESSAGES ERRORS
 * Erreurs métier spécifiques aux messages
 */

import { AppError } from '@shared/errors/AppError';

export class MessageError extends AppError {
  declare name: string;
  
  constructor(message: string) {
    super(message, 'MESSAGE_ERROR', 400);
    this.name = 'MessageError';
    Object.setPrototypeOf(this, MessageError.prototype);
  }
}

export class MessageNotFoundError extends MessageError {
  declare name: string;
  
  constructor() {
    super('Message non trouvé');
    this.name = 'MessageNotFoundError';
    Object.setPrototypeOf(this, MessageNotFoundError.prototype);
  }
}

export class MessageAccessDeniedError extends MessageError {
  declare name: string;
  
  constructor() {
    super('Vous ne pouvez pas modifier ce message');
    this.name = 'MessageAccessDeniedError';
    Object.setPrototypeOf(this, MessageAccessDeniedError.prototype);
  }
}

export class EmptyMessageError extends MessageError {
  declare name: string;
  
  constructor() {
    super('Le message ne peut pas être vide');
    this.name = 'EmptyMessageError';
    Object.setPrototypeOf(this, EmptyMessageError.prototype);
  }
}

export class MessageTooLongError extends MessageError {
  declare name: string;
  
  constructor() {
    super('Le message dépasse 2000 caractères');
    this.name = 'MessageTooLongError';
    Object.setPrototypeOf(this, MessageTooLongError.prototype);
  }
}
