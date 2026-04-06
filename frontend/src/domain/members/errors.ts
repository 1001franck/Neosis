/**
 * DOMAIN - MEMBERS ERRORS
 * Erreurs métier spécifiques aux membres
 */

import { AppError } from '@shared/errors/AppError';

export class MemberError extends AppError {
  declare name: string;
  
  constructor(message: string) {
    super(message, 'MEMBER_ERROR', 400);
    this.name = 'MemberError';
    Object.setPrototypeOf(this, MemberError.prototype);
  }
}

export class MemberNotFoundError extends MemberError {
  declare name: string;
  
  constructor() {
    super('Membre non trouvé');
    this.name = 'MemberNotFoundError';
    Object.setPrototypeOf(this, MemberNotFoundError.prototype);
  }
}

export class MemberAlreadyBannedError extends MemberError {
  declare name: string;
  
  constructor() {
    super('Ce membre est déjà banni');
    this.name = 'MemberAlreadyBannedError';
    Object.setPrototypeOf(this, MemberAlreadyBannedError.prototype);
  }
}

export class InsufficientPermissionsError extends MemberError {
  declare name: string;
  
  constructor() {
    super('Permissions insuffisantes');
    this.name = 'InsufficientPermissionsError';
    Object.setPrototypeOf(this, InsufficientPermissionsError.prototype);
  }
}
