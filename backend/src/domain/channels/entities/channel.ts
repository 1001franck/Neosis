/**
 * Type de channel
 */
export enum ChannelType {
  TEXT = 'TEXT',
  VOICE = 'VOICE'
}

/**
 * Entité métier Channel
 * Représente un canal de communication dans un serveur
 */
export class Channel {
  constructor(
    public readonly id: string,
    public name: string,
    public type: ChannelType,
    public readonly serverId: string,
    public readonly createdAt: Date,
    public topic: string | null = null,
    public position: number = 0
  ) {
    this.validateName(name);
  }

  /**
   * Validation du nom du channel
   */
  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Le nom du channel ne peut pas être vide');
    }
    if (name.length > 100) {
      throw new Error('Le nom du channel ne peut pas dépasser 100 caractères');
    }
    // Validation du format (lettres, chiffres, tirets et underscores uniquement)
    if (!/^[a-z0-9_-]+$/i.test(name)) {
      throw new Error('Le nom du channel ne peut contenir que des lettres, chiffres, tirets et underscores');
    }
  }

  /**
   * Met à jour le nom du channel
   */
  updateName(newName: string): void {
    this.validateName(newName);
    this.name = newName;
  }

  /**
   * Met à jour le type du channel
   */
  updateType(newType: ChannelType): void {
    this.type = newType;
  }

  /**
   * Convertit l'entité en objet simple
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      serverId: this.serverId,
      createdAt: this.createdAt,
      topic: this.topic,
      position: this.position
    };
  }
}