/**
 * Enum pour les rôles des membres
 */
export enum MemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

/**
 * Données utilisateur rattachées à un membre (optionnel, enrichi par le repository)
 */
export interface MemberUser {
  id: string;
  username: string;
  email: string;
  avatar?: string | null;
  bio?: string | null;
  customStatus?: string | null;
  statusEmoji?: string | null;
  banner?: string | null;
}

/**
 * Entité métier Member
 * Représente l'appartenance d'un utilisateur à un serveur avec un rôle spécifique
 */
export class Member {
  public user?: MemberUser;

  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly serverId: string,
    public role: MemberRole,
    public readonly joinedAt: Date
  ) {
    this.validateRole(role);
  }

  /**
   * Validation du rôle
   */
  private validateRole(role: MemberRole): void {
    const validRoles = Object.values(MemberRole);
    if (!validRoles.includes(role)) {
      throw new Error(`Rôle invalide: ${role}. Doit être OWNER, ADMIN ou MEMBER`);
    }
  }

  /**
   * Vérifie si le membre est propriétaire du serveur
   */
  isOwner(): boolean {
    return this.role === MemberRole.OWNER;
  }

  /**
   * Vérifie si le membre est administrateur
   */
  isAdmin(): boolean {
    return this.role === MemberRole.ADMIN;
  }

  /**
   * Vérifie si le membre est admin ou owner
   */
  isAdminOrOwner(): boolean {
    return this.isOwner() || this.isAdmin();
  }

  /**
   * Vérifie si le membre peut gérer les messages (supprimer les messages des autres)
   * Seuls OWNER et ADMIN peuvent supprimer les messages d'autres membres
   */
  canManageMessages(): boolean {
    return this.isAdminOrOwner();
  }

  /**
   * Vérifie si le membre peut gérer les channels (créer, modifier, supprimer)
   * Seuls OWNER et ADMIN peuvent gérer les channels
   */
  canManageChannels(): boolean {
    return this.isAdminOrOwner();
  }

  /**
   * Vérifie si le membre peut gérer les autres membres (changer rôles)
   * Seul OWNER peut gérer les rôles des membres
   */
  canManageMembers(): boolean {
    return this.isOwner();
  }

  /**
   * Vérifie si le membre peut bannir d'autres membres
   * Seul OWNER peut bannir des membres
   */
  canBanMembers(): boolean {
    return this.isOwner();
  }

  /**
   * Vérifie si le membre peut modifier les paramètres du serveur
   * Seul OWNER peut modifier les paramètres du serveur (nom, image, description)
   */
  canManageServer(): boolean {
    return this.isOwner();
  }

  /**
   * Met à jour le rôle du membre
   * @throws Error si le rôle est invalide
   */
  updateRole(newRole: MemberRole): void {
    this.validateRole(newRole);
    this.role = newRole;
  }

  /**
   * Convertit l'entité en objet simple pour la sérialisation
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      serverId: this.serverId,
      role: this.role,
      // Tout membre existant en base est actif (kick/ban = suppression du record)
      status: 'active' as const,
      joinedAt: this.joinedAt,
      ...(this.user && { user: this.user }),
    };
  }
}
