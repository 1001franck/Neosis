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
    public isVideoEnabled: boolean,
    public isScreenSharing: boolean,
    public readonly connectedAt: Date
  ) {
    this.validateState();
  }

  private validateState(): void {
    if (this.isDeafened && !this.isMuted) {
      this.isMuted = true;
    }
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (!muted && this.isDeafened) {
      this.isDeafened = false;
    }
  }

  setDeafened(deafened: boolean): void {
    this.isDeafened = deafened;
    if (deafened) {
      this.isMuted = true;
    }
  }

  setVideoEnabled(enabled: boolean): void {
    this.isVideoEnabled = enabled;
  }

  /**
   * Screen share et caméra sont mutuellement exclusifs
   */
  setScreenSharing(sharing: boolean): void {
    this.isScreenSharing = sharing;
    if (sharing) {
      this.isVideoEnabled = false;
    }
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      channelId: this.channelId,
      isMuted: this.isMuted,
      isDeafened: this.isDeafened,
      isVideoEnabled: this.isVideoEnabled,
      isScreenSharing: this.isScreenSharing,
      connectedAt: this.connectedAt
    };
  }
}
