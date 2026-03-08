/**
 * DOMAIN - VOICE CONNECTION ENTITY
 * Représente une connexion vocale active d'un utilisateur dans un channel
 */

/**
 * Entity VoiceConnection
 *
 * Règles métier :
 * - Un utilisateur ne peut être connecté qu'à UN SEUL voice channel à la fois
 * - isDeafened implique automatiquement isMuted (si tu coupes le son, ton micro est aussi coupé)
 */
export class VoiceConnection {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly channelId: string,
    public isMuted: boolean,
    public isDeafened: boolean,
    public readonly connectedAt: Date
  ) {
    this.validateState();
  }

  /**
   * Validation : si deafened, alors forcément muted
   */
  private validateState(): void {
    if (this.isDeafened && !this.isMuted) {
      this.isMuted = true; // Auto-correction : deafened implique muted
    }
  }

  /**
   * Active/désactive le micro
   */
  setMuted(muted: boolean): void {
    this.isMuted = muted;

    // Si on unmute mais qu'on est deafened, on undeafen aussi
    if (!muted && this.isDeafened) {
      this.isDeafened = false;
    }
  }

  /**
   * Active/désactive le son (implique aussi mute)
   */
  setDeafened(deafened: boolean): void {
    this.isDeafened = deafened;

    // Deafened implique forcément muted
    if (deafened) {
      this.isMuted = true;
    }
  }

  /**
   * Convertit l'entité en objet simple pour l'API
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      channelId: this.channelId,
      isMuted: this.isMuted,
      isDeafened: this.isDeafened,
      connectedAt: this.connectedAt
    };
  }
}
