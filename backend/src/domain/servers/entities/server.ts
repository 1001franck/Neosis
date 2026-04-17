/**
 * Entité métier Server
 * Représente un serveur de chat avec ses membres et channels
 */
export class Server {
  constructor(
    public readonly id: string,
    public name: string,
    public readonly ownerId: string,
    public inviteCode: string,
    public imageUrl: string | null,
    public readonly createdAt: Date,
    public description: string | null = null
  ) {
    this.validateName(name);
    this.validateInviteCode(inviteCode);
  }

  /**
   * Validation du nom du serveur
   */
  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Le nom du serveur ne peut pas être vide');
    }
    if (name.length > 100) {
      throw new Error('Le nom du serveur ne peut pas dépasser 100 caractères');
    }
  }

  /**
   * Validation du code d'invitation
   */
  private validateInviteCode(code: string): void {
    if (!code || code.length === 0) {
      throw new Error('Le code d\'invitation ne peut pas être vide');
    }
  }

  /**
   * Met à jour le nom du serveur
   */
  updateName(newName: string): void {
    this.validateName(newName);
    this.name = newName;
  }

  /**
   * Génère un nouveau code d'invitation
   */
  regenerateInviteCode(newCode: string): void {
    this.validateInviteCode(newCode);
    this.inviteCode = newCode;
  }

  /**
   * Met à jour l'image du serveur
   */
  updateImage(imageUrl: string | null): void {
    this.imageUrl = imageUrl;
  }

  /**
   * Vérifie si un utilisateur est le propriétaire du serveur
   */
  isOwner(userId: string): boolean {
    return this.ownerId === userId;
  }

  /**
   * Convertit l'entité en objet simple
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      ownerId: this.ownerId,
      inviteCode: this.inviteCode,
      imageUrl: this.imageUrl,
      createdAt: this.createdAt,
      description: this.description
    };
  }
}