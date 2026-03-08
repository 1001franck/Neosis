/**
 * Entite metier Ban
 * Represente le bannissement d'un utilisateur d'un serveur
 *
 * - expiresAt = null  → ban definitif
 * - expiresAt = Date  → ban temporaire (expire automatiquement)
 */
export class Ban {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly serverId: string,
    public readonly bannedBy: string,
    public readonly reason: string | null,
    public readonly expiresAt: Date | null,
    public readonly createdAt: Date
  ) {}

  /**
   * Verifie si le ban est definitif (permanent)
   */
  isPermanent(): boolean {
    return this.expiresAt === null;
  }

  /**
   * Verifie si le ban est temporaire
   */
  isTemporary(): boolean {
    return this.expiresAt !== null;
  }

  /**
   * Verifie si le ban est encore actif (non expire)
   */
  isActive(): boolean {
    if (this.isPermanent()) return true;
    return this.expiresAt!.getTime() > Date.now();
  }

  /**
   * Verifie si le ban a expire
   */
  isExpired(): boolean {
    return !this.isActive();
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      serverId: this.serverId,
      bannedBy: this.bannedBy,
      reason: this.reason,
      expiresAt: this.expiresAt,
      isPermanent: this.isPermanent(),
      isActive: this.isActive(),
      createdAt: this.createdAt,
    };
  }
}
